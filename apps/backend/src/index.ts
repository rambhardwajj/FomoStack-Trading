import dotevn from "dotenv";
import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware.js";
import redis from "redis";
import { CustomError } from "./utils/CustomError.js";
import {BINANCE_ASSETS} from "@repo/assets"
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

const beSubscriber = redis.createClient({ url: "redis://localhost:6379" });

async function connectBeSubscriber() {
  try {
    await beSubscriber.connect();
    console.log("backend redis subscriber connected");
  } catch (error) {
    console.log(error);
    throw new CustomError(500, "Redis connection error");
  }
}
async function subscribeToThePubSub() {
  try {
    for (const asset of BINANCE_ASSETS){
        await beSubscriber.subscribe(`binance:prices:${asset}`,  (message)=>{
            console.log(`Message from ${asset}: ${message}`);
        })

    }
  } catch (error) {
    console.log("error", error);
  }
}
await connectBeSubscriber();
await subscribeToThePubSub();


app.use(errorHandler);
app.listen(PORT, () => {
  console.log(" server is listening on port", PORT);
});
