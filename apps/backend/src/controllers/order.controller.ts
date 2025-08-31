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
const ordersBySymbol = new Map<string, Set<string>>();

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
      throw new CustomError(500, "Open Order failed ")
    }
  }
);

export const closeOrder: RequestHandler = asyncHandler(async (req, res) => {
  // find order in db
  // update order - close price
  // update the status of the order
});

export const getOrders: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      res.status(200).json({});
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);
export const getOpenOrdersForUser: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      // find orders in db with userId = userId and Order.status = Open

      res.status(200).json({});
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);
export const getAllOpenOrders: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // find orders in db with Order.status = Open

      res.status(200).json({});
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);
export const getClosedOrdersForUser: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      // find orders in db with userId = userId and Order.status = Closed

      res.status(200).json({});
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
export const calculatePnl = (): number => {
  return 1000;
};
