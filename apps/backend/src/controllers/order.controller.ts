import type { Request, RequestHandler, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { CustomError } from "../utils/CustomError.js";
import { prisma } from "../config/db.js";
import { Order, User } from "@prisma/client";
import { beSubscriber } from "../index.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const orders = new Map<string, Order>(); // orderId -> Order
const userOrders = new Map<string, Set<string>>(); // userId -> Set of orderIds
const activeOrders = new Set<string>(); // Set of active order IDs
const closeOrders = new Set<string>(); // Set of close order IDs
const ordersBySymbol = new Map<string, Set<string>>();
const orderWithStopLossPrice = new Map<string, number>();


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
function checkValidOrder(exposedTradeValue: number, userBalance: number) {
  if (exposedTradeValue < userBalance)
    throw new CustomError(
      403,
      `Cannot apply ${exposedTradeValue} margin as User Balance is not sufficient `
    );
  // if not then user can place the order in case of buy ̰
  return true;
}
function calculateLiqAmt(
  userBalance: number,
  orderValue: number,
  leverage: number,
  orderType: string,
  stopLoss: number,
  currStockPrice: number
) {
  if (orderType === "buy") {
    let liqAmt = currStockPrice - currStockPrice / leverage;
    return liqAmt - stopLoss;
  } else {
    let liqAmt = currStockPrice + currStockPrice / leverage;
    return liqAmt + stopLoss;
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

async function startTransaction(orderData: Order) {}

const calculatePnl = (order: Order, currentPrice: number): number => {
  return 1000;
};

export const openOrder: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    let { symbol, orderType, leverage, margin, stopLoss } = req.body;
    const userId = req.user.id;

    if (!symbol || !orderType || !leverage || !margin) {
      throw new CustomError(400, "Invalid Inputs");
    }
    if (!stopLoss) {
      stopLoss = margin;
    }

    const user = await getUserData(userId);
    const userBalance = getUserBalance(user);
    const assetPrice = await beSubscriber.get(`binance:latest:${symbol}`);
    const currStockPrice = Number(assetPrice);

    if (!userBalance)
      throw new CustomError(500, "User Balance cannot be retrieved");

    const orderValue = margin;

    const isOrderValid = checkValidOrder(orderValue, userBalance);

    if (!isOrderValid) {
      throw new CustomError(400, "Insufficient balance or invalid order ");
    }

    let liquidatePrice: number;
    liquidatePrice = calculateLiqAmt(
      userBalance,
      orderValue,
      leverage,
      orderType,
      stopLoss,
      currStockPrice
    );

    const orderId = crypto.randomUUID();

    if (!orderWithStopLossPrice.get(orderId)) {
      orderWithStopLossPrice.set(orderId, liquidatePrice);
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
      createdAt: new Date(),
      updatedAt: new Date(),
      pnl: null,
      user: user,
    };

    const position = await startTransaction(orderData);

    try {
      // all orders ka map
      orders.set(orderId, orderData);

      // all user orders ka map with orders set mai
      if (!userOrders.has(userId)) {
        userOrders.set(userId, new Set());
      }
      userOrders.get(userId)?.add(orderId);

      //assets ka map
      if (!ordersBySymbol.has(symbol.toUpperCase())) {
        ordersBySymbol.set(symbol.toUpperCase(), new Set());
      }
      ordersBySymbol.get(symbol.toUpperCase())!.add(orderId);

      // active orders
      if (!activeOrders.has(orderId)) activeOrders.add(orderId);
      await updateUserBalance(userId, userBalance - margin);

      res.status(200).json(new ApiResponse(200, "Order Opened", orderData));
    } catch (error) {
      throw new CustomError(500, "Open Order failed ");
    }
  }
);

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
    // If you have bid/ask prices, use appropriate one based on order type
    currentPrice =
      order.orderType === "buy" ? priceData.sellPrice : priceData.buyPrice;
    if (!currentPrice || isNaN(currentPrice)) {
      throw new CustomError(400, "Invalid price data received");
    }
    pnl = calculatePnl(order, currentPrice);
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

  closeOrders.add(closedOrder!.id)

  const symbolOrders = ordersBySymbol.get(symbol);
  if (symbolOrders) {
    symbolOrders.delete(orderId);
  }

  const user = await getUserData(userId);
  const currentBalance = getUserBalance(user);

  const newBalance = currentBalance + order.margin! + pnl;

  await updateUserBalance(userId, newBalance);

  res
    .status(200)
    .json(new ApiResponse(200, "Order closed successfully", closedOrder));
});

export const getOpenOrdersForUser: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const userAllOrders = userOrders.get(userId);
      if (!userAllOrders)
        throw new CustomError(400, "No  orders of this users exists");

      const allOrdersIds = Array.from(userAllOrders!);

      let result: any[] = [];
      for (const orderId in allOrdersIds) {
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
      for (const orderId in allOpenOrderIds) {
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
      for (const orderId in allClosedOrder) {
        if (closeOrders.has(orderId)) {
          result.push(orders.get(orderId));
        }
      }
      res.status(200).json(new ApiResponse(200, "Closed orders fetched", result));
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
