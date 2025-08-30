"use client";

import { useEffect, useRef, useState } from "react";
type AssetData = {
  buyPrice: number;
  sellPrice: number;
  lastPrice: number;
};

export default function Home() {
  const socketRefVal = useRef<WebSocket | null>(null);
  const assetsRef = useRef<Record<string, AssetData>>({});
  const [, setRender] = useState<number>(0);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socketRefVal.current = socket;

    socket.onopen = () => {
      console.log("connected to websocket server");
    };
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      assetsRef.current[msg.symbol] = {
        buyPrice: Number(msg.buyPrice),
        sellPrice: Number(msg.sellPrice),
        lastPrice: Number(msg.buyPrice)
      };
      // console.log(assetsRef.current)
    };

    setInterval(() => {
      console.log("Rerendering the component");
      setRender((prev) => prev + 1); // just trigginering the rerender
    }, 200);
    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    return () => {
      socket.close();
    };
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold underline">FomoStack</h1>
      <h2 className="text-2xl font-bold underline">Real-time Crypto Prices</h2>
      <br />
      {Object.entries(assetsRef.current).map(
        ([symbol, { buyPrice, sellPrice }]) => (
          <div
            key={symbol}
            className="p-3 border rounded shadow-sm flex justify-between bg-white"
          >
            <span className="font-semibold">{symbol}</span>
            <div className="flex gap-4">
              <div className="text-green-600">Buy: {buyPrice}</div>
              <div className="text-red-600">Sell: {sellPrice}</div>
            </div>
            <br />
          </div>
        )
      )}
    </div>
  );
}
