import type { Request, RequestHandler, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";

export const getOrders: RequestHandler = asyncHandler(async (req:Request, res: Response) => {
  try {
    const userId = req.user.id;
    // find orders in db 

    
    res.status(200).json({  });
  } catch (error) {
    res.status(500).json({ message: error });
  }
})

export const openOrder : RequestHandler= asyncHandler(async ( req: Request , res : Response) =>{
   const { asset, amount, type } = req.body; 
    const userId = req.user.id;
   if (type === "sell") {

    // will get the balance from the db 
      const balance = {amount: 100}

      if (!balance || balance.amount < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      balance.amount -= amount;
      
    }

    // create Order in db 

})

export const closeOrder : RequestHandler= asyncHandler(async( req , res ) =>{
  const {orderId, price }  = req.body
  const userId = req.user;

  // find order in db
  // update order - close price 
  // update the status of the order 
  

})