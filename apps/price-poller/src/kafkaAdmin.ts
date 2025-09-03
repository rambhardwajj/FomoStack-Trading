import { BINANCE_ASSETS } from "@repo/assets";
import { Kafka } from "kafkajs";

const kafka  = new Kafka({
    clientId: "my-app", 
    brokers: ["localhost:9092"]
})

async function init() {
  const admin = kafka.admin();
  console.log("admin connecting...");
  await admin.connect();
  console.log("Admin connected");

  for (const binAssets of BINANCE_ASSETS) {
    await admin.createTopics({
      topics: [{ topic: binAssets, numPartitions: 1 }],
    });
    console.log("Topic created ", binAssets);
  }
  console.log(await admin.listTopics());
  

  console.log("Disconecting admin");
  await admin.disconnect();
}

init();
