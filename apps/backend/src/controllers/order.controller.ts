import type { Request, RequestHandler, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { CustomError } from "../utils/CustomError.js";

function checkValidOrder(
  quantity: number,
  price: number,
  margin: number,
  leverage: number,
  orderType: string,
  symbol: string, 
  userBalance: number
): {  isOrderValid: boolean, orderValue: number} {
  return {
    isOrderValid: true,
    orderValue: 1000
  };
}

const getUserBalance = (userId: string) : number=> {
  return 5000;
}

export const getOrders: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      // find orders in db

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
      const userBalance = getUserBalance(userId);

      res.status(200).json({ balance: userBalance });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);
export const getAssets : RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    
  }
);
export const calculatePnl = () : number => {
  return 1000;
} 


export const openOrder: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { symbol, orderType, quantity, price, leverage, margin } = req.body;
    const userId = req.user.id;

    const userBalance = getUserBalance(userId);

    const {isOrderValid, orderValue} = checkValidOrder(
      quantity,
      price,
      margin,
      leverage,
      orderType,
      symbol, 
      userBalance
    );
    if (!isOrderValid) {
      throw new CustomError(400, "Insufficient balance or invalid order ");
    }
    if (orderType === "buy") {
      if (!leverage) {

        const newUserBalance = userBalance - orderValue; 

        // create order in db with quantity price leverage margin , status as open , 
        
        // update user balance in db


      } else {


      }
    } else if (orderType === "sell") {
      if (!leverage) {

        // 

        const pnL = calculatePnl();
        const newUserBalance = userBalance + pnL;

        // update in order table db 

      } else {
      }
    }
  }
);

export const closeOrder: RequestHandler = asyncHandler(async (req, res) => {
  // find order in db
  // update order - close price
  // update the status of the order
});
