import dotevn from "dotenv";
import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware.js";
import { createClient, RedisArgument, RedisClientType } from "redis";
import { CustomError } from "./utils/CustomError.js";
import { BINANCE_ASSETS } from "@repo/assets";
dotevn.config();

const PORT = process.env.PORT;

const app: Application = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      process.env.DOMAIN_URL!,
      process.env.APP_URL!,
    ],
  })
);

export const beSubscriber: RedisClientType = createClient({
  url: "redis://localhost:6379",
});

export const bePublisher: RedisClientType = createClient({
  url: "redis://localhost:6379",
});

export async function connectBeSubscriber() {
  try {
    await beSubscriber.connect();
    console.log("backend redis subscriber connected");
  } catch (error) {
    console.log(error);
    throw new CustomError(500, "Redis connection error");
  }
}

export async function connectBePublisher() {
  try {
    await bePublisher.connect();
    console.log("backedn redis publisher connected");
  } catch (error) {
    console.log(error);
    throw new CustomError(
      500,
      "Redis connection error in connecting to publisher"
    );
  }
}

export async function subscribeToThePubSub() {
  try {
    for (const asset of BINANCE_ASSETS) {
      await beSubscriber.subscribe(
        `binance:prices:${asset}`,
        async (message) => {
          // console.log(`Message from ${asset}: ${message}`);

          try {
            const priceData = JSON.parse(message);

            const normalized = {
              ...priceData,
              buyPrice: parseFloat(priceData.buyPrice),
              sellPrice: parseFloat(priceData.sellPrice),
              quantity: parseFloat(priceData.quantity),
            };

            // console.log("priceData", priceData);
            await bePublisher.set(
              `binance:latest:${asset}`,
              JSON.stringify(normalized)
            );
            console.log("latest asset published")
          } catch (error:any) {
            console.log("error in setting latest price in pubsub", error.message);
          }
        }
      );
    }
  } catch (error) {
    console.log("error", error);
  }
}
async function subscribeToPubSub() {
  await connectBeSubscriber();
  await connectBePublisher();
  await subscribeToThePubSub();
}
subscribeToPubSub();

import authRoute from "./routes/auth.route.js";
import candlesRoute from "./routes/candles.route.js";

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/candles", candlesRoute);

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(" server is listening on port", PORT);
});
