import type { Request, RequestHandler, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { CustomError } from "../utils/CustomError.js";
import { prisma } from "../config/db.js";
import { User } from "@prisma/client";

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

const getCurrStPrice = (stock: string) => {
  return 1;
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
  let percentageChange = 0;

  if (orderType === "buy") {
    let liqAmt = currStockPrice - currStockPrice / leverage;
    return liqAmt - stopLoss;
  } else if (orderType === "sell") {
    let liqAmt = currStockPrice + currStockPrice / leverage;
    return liqAmt + stopLoss;
  }
}

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
    const currStockPrice = getCurrStPrice(symbol);

    if (!userBalance)
      throw new CustomError(500, "User Balance cannot be retrieved");

    const orderValue = margin;

    const isOrderValid = checkValidOrder(orderValue, userBalance);

    if (!isOrderValid) {
      throw new CustomError(400, "Insufficient balance or invalid order ");
    }

    let liquidatePrice;
    liquidatePrice = calculateLiqAmt(
      userBalance,
      orderValue,
      leverage,
      orderType,
      stopLoss,
      currStockPrice
    );

    if (leverage) {
      if (orderType === "buy") {

      } else if (orderType === "sell") {

      }
    } else {
      if (orderType === "buy") {
      } else if (orderType === "sell") {
      }
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
