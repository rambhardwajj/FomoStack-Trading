import WebSocket from "ws";
import { createClient } from "redis";
import { BINANCE_ASSETS } from "@repo/assets";
import { Kafka } from "kafkajs";

console.log(BINANCE_ASSETS);

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ['localhost:9092']
})
const kafkaProducer = kafka.producer();

async function initKafka() {
  await kafkaProducer.connect();
  console.log("Kafka connected");
}


const ws = new WebSocket("wss://stream.binance.com:9443/ws");

const client = createClient({ url: "redis://localhost:6379" });

async function startRedis() {
  try {
    await client.connect();
  } catch (error) {
    console.log(error);
  }
}
await startRedis();
await initKafka().then(()=>console.log("calling kafka"));

ws.on("open", () => {
  console.log("connected to biniance websoc ");
  const subscribedAssets = BINANCE_ASSETS.map(
    (sub) => `${sub.toLowerCase()}@trade`
  );

  const subRequests = {
    method: "SUBSCRIBE",
    params: subscribedAssets,
    id: 1,
  };
  ws.send(JSON.stringify(subRequests));

  console.log("subscribed to Binance assets ");
});

ws.on("message", async (rawData: any) => {
  try {
    const data = JSON.parse(rawData.toString());
    // console.log(data.e)
    if (data.e === "trade") {
      // console.log(data);
      const tradeData = {
        symbol: data.s, // BTCUSDT
        price: data.p + (0.01*data.p) , // Trade price
        quantity: data.q , // Trade quantity
        tradeId: data.t,
        timestamp: data.T, 
      };

      await client.publish(
        `binance:prices:${tradeData.symbol}`,
        JSON.stringify(tradeData)
      );
      console.log("Published:", tradeData);

      await kafkaProducer.send({
        topic: tradeData.symbol,
        messages: [{ value: JSON.stringify(tradeData) }],
      });

      // BINANCE_ASSETS.forEach(async (asset) => {
      //   await kafkaProducer.send({
      //     topic: tradeData.symbol,
      //     messages: [{ value: JSON.stringify(tradeData) }],
      //   });
      //   console.log("produced data to topic - ", asset);
      // });

      console.log("Produced data to kafka");
    }
  } catch (error) {
    console.log(error);
  }
});

ws.on("error", (err) => {
  console.error("Error Error ", err);
});
