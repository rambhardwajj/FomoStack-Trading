import { createClient } from "redis";
import WebSocket, { WebSocketServer } from "ws";
import {BINANCE_ASSETS} from "@repo/assets"

const wss = new WebSocketServer({ port: 8080 });

type User = {
  ws: WebSocket;
};
const users: User[] = [];

const subscriberClient = createClient({ url: "redis://localhost:6379" });

async function connectClient() {
  try {
    await subscriberClient.connect();
    console.log("connected to redis subs client ");
  } catch (error) {
    console.log(error);
  }
}

wss.on("connection", (ws) => {
  const user: User = { ws };
  console.log("new user connected");
  users.push(user);

  ws.on("close", () => {
    console.log("user disconnected");
    const ind = users.indexOf(user);
    if (ind != -1) users.splice(ind, 1);
  });
});

async function subscribeToThePubSub() {
  try {
    for( const asset of BINANCE_ASSETS){
      // console.log(asset)
      await subscriberClient.subscribe(`binance:prices:${asset}`, (message) => {
        // console.log("subscribed to - ", asset)
        // console.log("subscribed message - ", message);
        users.forEach((user) => {
          user.ws.send(message);
        });
      });

    }
  } catch (error) {
    console.log("error", error);
  }
}

(async () => {
  await connectClient();
  await subscribeToThePubSub();
})();
