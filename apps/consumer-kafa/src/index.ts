// import path from "path";
// import fs from "fs";
import { BINANCE_ASSETS } from "@repo/assets";
import { client } from "@repo/db";

import { Kafka } from "kafkajs";

await client.connect();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});

type TradeDetails = {
  symbol: string;
  price: string;
  quantity: string;
  timestamp: string;
};

const kafkaConsumer = kafka.consumer({ groupId: "new-group" });

// const BATCH_DIR = path.join(process.cwd(), "batchfiles");
// const FILE1_PATH = path.join(BATCH_DIR, "file1.csv");
// const FILE2_PATH = path.join(BATCH_DIR, "file2.csv");

let writeToFile1 = true;

// if (!fs.existsSync(BATCH_DIR)) {
//   fs.mkdirSync(BATCH_DIR);
// }

// fs.writeFileSync(FILE1_PATH, "");
// fs.writeFileSync(FILE2_PATH, "");
let arr1: TradeDetails[] = [];
let arr2: TradeDetails[] = [];

async function insertData(trades: TradeDetails[]) {
  if (!trades || trades.length === 0) return;

  console.log("Inserting data into DB...");
  console.log("price" , trades[1])

  try {
    for (const trade of trades) {
      await client.query(
        `INSERT INTO trades (symbol, price, quantity, timestamp)
         VALUES ($1, $2, $3, $4)`,
        [trade.symbol, trade.price, trade.quantity, trade.timestamp]
      );
    }

    console.log(`Inserted ${trades.length} trades`);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}


function writeToFileFun(trade: TradeDetails) {
  // const filePath = writeToFile1 ? FILE1_PATH : FILE2_PATH;
  const currDS = writeToFile1 ? arr1 : arr2;
  // if (fs.statSync(filePath).size === 0) {
  //   const header = Object.keys(trade).join(",") + "\n";
  //   fs.appendFileSync(filePath, header);
  // }

  // const row = Object.values(trade).join(",") + "\n";
  // fs.appendFileSync(filePath, row);

  currDS.push(trade);
  // console.log(currDS[currDS.length-1])
}

async function processAndClearFile(DS: any) {
  await insertData(DS);
  // if (fs.statSync(filePath).size === 0) return;

  // const fileData = fs.readFileSync(filePath, "utf8");
  // console.log(`processing ${filePath}:\n`);

  // Insert logic to push `fileData` to DB here

  // fs.writeFileSync(filePath, "") ;
  DS.length = 0;

  console.log(`Cleared ${DS}`);
}

setInterval(async () => {
  console.log("Switching DS...");

  const DSToProcessPath = writeToFile1 ? arr1 : arr2;
  writeToFile1 = !writeToFile1;
  await processAndClearFile(DSToProcessPath);
}, 10000);

async function startConsumer() {
  try {
    console.log("Initializing consumer...");

    await kafkaConsumer.connect();
    console.log("consumer connected");

    for (const asset of BINANCE_ASSETS) {
      await kafkaConsumer.subscribe({
        topic: asset,
        fromBeginning: false,
      });
      console.log(`subscribed to topic: ${asset}`);
    }

    console.log("sttarting consumer...");
    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          console.log("topic- ", topic);
          // console.log("message- ", message);
          const trade = JSON.parse(message.value?.toString() || "{}");
          //   console.log("trade- ", trade)

          const floatPrice = parseFloat(trade.price);            // Convert string → number
          const roundedToFour = Number(floatPrice.toFixed(4)).toString()

          const tradeObj = {
            symbol: trade.symbol as string,
            price: roundedToFour as string,
            quantity: trade.quantity as string,
            timestamp: new Date(trade.timestamp).toISOString(),
          };
          // console.log("Consumed trade:", {
          //   symbol: trade.symbol,
          //   price: trade.price,
          //   quantity: trade.quantity,
          //   timestamp: new Date(trade.timestamp).toISOString(),
          // });

          writeToFileFun(tradeObj);

          // or write in memory
        } catch (parseError) {
          console.log(" message:", message.value?.toString());
        }
      },
    });
  } catch (error) {
    console.error("cos error:", error);

    setTimeout(() => {
      startConsumer();
    }, 5000);
  }
}

startConsumer();
