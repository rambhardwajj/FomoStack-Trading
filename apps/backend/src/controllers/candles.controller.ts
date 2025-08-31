import { INTERVALS } from "@repo/db";
import asyncHandler from "../utils/asyncHandler.js";
import { RequestHandler } from "express";
import { client, connectDB } from "@repo/db";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CustomError } from "../utils/CustomError.js";

console.log(INTERVALS);

connectDB();

export const getCandles: RequestHandler = asyncHandler(async (req, res) => {
  const { asset, interval, limit } = req.body;
  console.log(asset, interval, limit)

  if (!asset || !interval || !limit) {
    throw new CustomError(400, "Feilds are required")
  }

  const viewName = `${asset.toLowerCase()}_ohlcv_${interval.replace(/\s+/g, "")}`;
  console.log(viewName)

  try {
    const query = `
    SELECT bucket, open, high, low, close, volume
      FROM ${viewName}
      
      ORDER BY bucket DESC
      LIMIT ${limit};
      `;

    const rows  = await client.query(query);
    const reversedRows = {
      ...rows,
      rows: rows.rows.reverse()
    };

    res.status(200).json(new ApiResponse(200, "Rows retrieeved for the assets", reversedRows))
  } catch (error:any) {
    throw new CustomError(400, error.message)
  }
});
