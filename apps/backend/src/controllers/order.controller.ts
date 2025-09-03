import type { Request, RequestHandler, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { CustomError } from "../utils/CustomError.js";
import { prisma } from "../config/db.js";
import { Order, User } from "@prisma/client";
import { beSubscriber } from "../index.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BINANCE_ASSETS } from "@repo/assets";

import {
  MinPriorityQueue,
  MaxPriorityQueue,
} from "@datastructures-js/priority-queue";

const orders = new Map<string, Order>(); // orderId -> Order
const userOrders = new Map<string, Set<string>>(); // userId -> Set of orderIds
const activeOrders = new Set<string>(); // Set of active order IDs
const closeOrders = new Set<string>(); // Set of close order IDs
const ordersBySymbol = new Map<string, Set<string>>();

const orderWithLiquidationPrice = new Map<string, number>();

type liqOrder = {
  orderId: string;
  liqPrice: number;
  userId: string;
  symbol: string;
};
// const longOrdersPq = new MinPriorityQueue<{
//   orderId: string;
//   liqPrice: number;
//   userId: string;
//   symbol: string;
// }>((o) => o.liqPrice);

// const shortOrdersPq = new MaxPriorityQueue<{
//   orderId: string;
//   liqPrice: number;
//   userId: string;
//   symbol: string;
// }>((o) => o.liqPrice);

const longOrdersHm = new Map<string, MinPriorityQueue<liqOrder>>();
const shortOrderHm = new Map<string, MaxPriorityQueue<liqOrder>>();

const addInHmPq = (
  orderType: string,
  userId: string,
  orderId: string,
  liqPrice: number,
  symbol: string
) => {
  if (orderType === "buy") {
    if (!longOrdersHm.has(symbol)) {
      longOrdersHm.set(
        symbol,
        new MinPriorityQueue<liqOrder>((o) => o.liqPrice)
      );
    }
    longOrdersHm.get(symbol)?.enqueue({ orderId, liqPrice, userId, symbol });
  } else {
    if (!shortOrderHm.has(symbol)) {
      shortOrderHm.set(
        symbol,
        new MaxPriorityQueue<liqOrder>((o) => o.liqPrice)
      );
    }
    shortOrderHm.get(symbol)?.enqueue({ orderId, liqPrice, userId, symbol });
  }
};

const getUserData = async (userId: string) => {
  if (!userId) {
    throw new CustomError(400, "userId is invalid");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) throw new CustomError(400, "user does not exists");

  return user;
};
const getUserBalance = (user: User) => {
  if (!user) {
    throw new CustomError(
      400,
      "Balance could not be fetched as user doesnot exists"
    );
  }

  const userBalance = user.balance;
  return userBalance;
};
function checkValidOrder(requiredMargin: number, userBalance: number) {
  if (requiredMargin > userBalance) {
    throw new CustomError(
      403,
      `Cannot apply margin of ${requiredMargin}, user balance is only ${userBalance}`
    );
  }
  return true;
}
function calculateLiqAmt(
  leverage: number,
  orderType: string,
  currStockPrice: number
): number {
  if (orderType === "buy") {
    return currStockPrice * (1 - 1 / leverage);
  } else {
    return currStockPrice * (1 + 1 / leverage);
  }
}
async function updateUserBalance(userId: string, updatedBalance: number) {
  if (!userId || updatedBalance === undefined || updatedBalance === null) {
    throw new CustomError(400, "User ID or updated balance not provided");
  }
  if (updatedBalance < 0) {
    throw new CustomError(400, "Balance cannot be negative");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      balance: updatedBalance,
    },
  });

  if (!updatedUser) {
    throw new CustomError(500, "user balance not debited");
  }
}
async function getLatestAssetPrice(symbol: string) {
  const assetCurrPrice = await beSubscriber.get(`binance:latest:${symbol}`);
  return Number(assetCurrPrice);
}
async function startTransaction(orderData: Order) {}

//----------------------

export const openOrder: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    let { symbol, orderType, leverage, quantity, stopLoss } = req.body;
    const userId = req.user.id;

    if (!symbol || !orderType || !leverage) {
      throw new CustomError(400, "Invalid Inputs");
    }

    const user = await getUserData(userId);
    const userBalance = getUserBalance(user);
    const assetPrice = await getLatestAssetPrice(symbol);
    const currStockPrice = Number(assetPrice);

    if (!userBalance)
      throw new CustomError(500, "User Balance cannot be retrieved");

    const positionValue = currStockPrice * quantity;
    const margin = positionValue / leverage;

    checkValidOrder(margin, userBalance);

    const liquidationPrice = calculateLiqAmt(
      leverage,
      orderType,
      currStockPrice
    );

    const orderId = crypto.randomUUID();

    if (!orderWithLiquidationPrice.get(orderId)) {
      orderWithLiquidationPrice.set(orderId, liquidationPrice);
    }

    const orderData = {
      id: orderId,
      userId: userId,
      symbol: symbol as string,
      orderType: orderType as string,
      price: Math.round(currStockPrice),
      leverage: leverage as number,
      margin: margin as number,
      status: "OPEN",
      openingPrice: Math.round(currStockPrice),
      stopLoss: Math.round(stopLoss),
      closingPrice: null,
      closedAt: null,
      quantity: quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
      pnl: null,
      user: user,
    };

    const position = await startTransaction(orderData);
    try {
      addInHmPq(orderType, userId, orderId, liquidationPrice, symbol);
    } catch (error) {
      throw new CustomError(500, "cannot add in liquidation queue ");
    }

    try {
      orders.set(orderId, orderData);

      if (!userOrders.has(userId)) {
        userOrders.set(userId, new Set());
      }
      userOrders.get(userId)?.add(orderId);

      if (!ordersBySymbol.has(symbol.toUpperCase())) {
        ordersBySymbol.set(symbol.toUpperCase(), new Set());
      }
      ordersBySymbol.get(symbol.toUpperCase())!.add(orderId);

      if (!activeOrders.has(orderId)) activeOrders.add(orderId);
      await updateUserBalance(userId, userBalance - margin);

      res.status(200).json(new ApiResponse(200, "Order Opened", orderData));
    } catch (error) {
      throw new CustomError(500, "Open Order failed ");
    }
  }
);

//-------------------------------------------------

const calculatePnl = async (
  orderId: string,
  currPrice: number,
  orderType: string
): Promise<number> => {
  if (!orderId) throw new CustomError(400, "Invalid Order Id");

  const order = orders.get(orderId);
  if (!order) throw new CustomError(400, "Order not found ");

  const openingPrice = order.openingPrice!;
  const leverage = order.leverage;
  let pnl: number;

  if (orderType === "buy") {
    pnl = (currPrice - openingPrice) * order.quantity!;
  } else {
    pnl = (openingPrice - currPrice) * order.quantity!;
  }

  if (leverage) {
    pnl = pnl * leverage;
  }

  return pnl;
};
const liquidateOrder = async (orderId: string, userId: string) => {
  const order = orders.get(orderId);
  if (!order) throw new CustomError(400, "Order not found");

  const price = await getLatestAssetPrice(order.symbol);
  const pnl = await calculatePnl(orderId, price, order.orderType);

  const closedOrder = {
    ...order,
    status: "CLOSED" as const,
    closedAt: new Date(),
    updatedAt: new Date(),
    closingPrice: price,
    pnl: pnl,
  };

  orders.set(orderId, closedOrder);
  activeOrders.delete(orderId);
  closeOrders.add(orderId);

  const user = await getUserData(userId);
  const newBalance = Math.max(0, getUserBalance(user) + pnl); // wipe margin
  await updateUserBalance(userId, newBalance);
};

export const getLiquidatingOrders: RequestHandler = asyncHandler(
  async (req, res) => {
    const liquidated: string[] = [];
    const processQueue = async (
      pq: MinPriorityQueue<liqOrder> | MaxPriorityQueue<liqOrder>,
      isLongOrder: boolean
    ) => {
      while (!pq.isEmpty()) {
        const peek = pq.front();
        if (!peek) break;

        const { orderId, userId, symbol, liqPrice } = peek;
        const currPrice = await getLatestAssetPrice(symbol);

        if (!currPrice) break;
        let percentDiff: number;
        if (isLongOrder)
          percentDiff = ((currPrice - liqPrice) / currPrice) * 100;
        else percentDiff = ((liqPrice - currPrice) / liqPrice) * 100;
        if (percentDiff < 10) {
          await liquidateOrder(orderId, userId);
          liquidated.push(orderId);
          pq.dequeue();
        } else {
          break;
        }
      }
    };

    for (const [symbol, pq] of longOrdersHm.entries()) {
      await processQueue(pq, true);
    }
    for (const [symbol, pq] of shortOrderHm.entries()) {
      await processQueue(pq, false);
    }
    return liquidated;
  }
);

//-------------------------

export const closeOrder: RequestHandler = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  if (!orderId) throw new CustomError(500, "Invalid order id ");

  if (!orders.get(orderId))
    throw new CustomError(400, "Order does not exists ");

  const order = orders.get(orderId);
  if (!order) throw new CustomError(500, "order not found");

  const symbol = order.symbol;

  if (!activeOrders.has(orderId))
    throw new CustomError(500, "Not an open order");

  const price = await beSubscriber.get(`binance:latest:${symbol}`);

  if (!price)
    throw new CustomError(400, "Unable to fetch current price for this asset");

  const priceData = JSON.parse(price);

  let currentPrice: number;
  let closedOrder;
  let pnl = 0;

  if (priceData.buyPrice && priceData.sellPrice) {
    currentPrice =
      order.orderType === "buy" ? priceData.sellPrice : priceData.buyPrice;
    if (!currentPrice || isNaN(currentPrice)) {
      throw new CustomError(400, "Invalid price data received");
    }
    pnl = await calculatePnl(orderId, currentPrice, order.orderType);
    closedOrder = {
      ...order,
      status: "CLOSED" as const,
      closedAt: new Date(),
      updatedAt: new Date(),
      closingPrice: currentPrice,
      pnl: pnl,
    };
    orders.set(orderId, closedOrder);
    activeOrders.delete(orderId);
  }

  closeOrders.add(closedOrder!.id);

  const symbolOrders = ordersBySymbol.get(symbol);
  if (symbolOrders) {
    symbolOrders.delete(orderId);
  }

  const user = await getUserData(userId);
  const currentBalance = getUserBalance(user);

  const newBalance = Math.max(currentBalance + order.margin! + pnl, 0);

  await updateUserBalance(userId, newBalance);

  res
    .status(200)
    .json(new ApiResponse(200, "Order closed successfully", closedOrder));
});

//------------------------

//-----------------------
export const getOpenOrdersForUser: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const userAllOrders = userOrders.get(userId);
      if (!userAllOrders)
        throw new CustomError(400, "No  orders of this users exists");

      const allOrdersIds = Array.from(userAllOrders!);

      let result: any[] = [];
      for (const orderId of allOrdersIds) {
        if (activeOrders.has(orderId)) {
          const order = orders.get(orderId);
          result.push(order);
        }
      }

      res
        .status(200)
        .json(new ApiResponse(200, "All open orders of user fetched", result));
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);
export const getAllOpenOrders: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    let result: any[] = [];
    try {
      const allOpenOrderIds = Array.from(activeOrders);
      for (const orderId of allOpenOrderIds) {
        if (activeOrders.has(orderId)) {
          result.push(orders.get(orderId));
        }
      }
      res.status(200).json(new ApiResponse(200, "Open orders fetched", result));
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);
export const getClosedOrders: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    let result: any[] = [];
    try {
      const allClosedOrder = Array.from(closeOrders);
      for (const orderId of allClosedOrder) {
        if (closeOrders.has(orderId)) {
          result.push(orders.get(orderId));
        }
      }
      res
        .status(200)
        .json(new ApiResponse(200, "Closed orders fetched", result));
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);
export const getBalance: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await getUserData(userId);
      const userBalance = getUserBalance(user);

      res.status(200).json({ balance: userBalance });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);
export const getAssets: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {}
);
