import { useEffect, useRef, useState } from "react";

type AssetData = {
  buyPrice: number;
  sellPrice: number;
  lastBuyPrice: number;
  lastSellPrice: number;
};

export default function AssetsTicker() {
  const socketRefVal = useRef<WebSocket | null>(null);
  const assetsRef = useRef<Record<string, AssetData>>({});
  const [, setRender] = useState<number>(0);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socketRefVal.current = socket;

    socket.onopen = () => console.log("Connected to WebSocket server");
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const existing = assetsRef.current[msg.symbol];
      // console.log({
      //   assetsRef: assetsRef.current[msg.symbol]?.buyPrice,
      //   existing: existing?.buyPrice
      // })
      assetsRef.current[msg.symbol] = {
        buyPrice: Number(msg.buyPrice),
        sellPrice: Number(msg.sellPrice),
        lastBuyPrice: existing ? existing.buyPrice : Number(msg.buyPrice),
        lastSellPrice: existing ? existing.sellPrice : Number(msg.sellPrice),
      };
    };

    const interval = setInterval(() => {
      setRender((prev) => prev + 1); 
    }, 300);

    socket.onerror = (error) => console.error("WebSocket Error:", error);
    socket.onclose = () => console.log("Disconnected from WebSocket server");

    return () => {
      clearInterval(interval);
      socket.close();
    };
  }, []);

  return (
    <div className="p-2 space-y-2">
      {Object.entries(assetsRef.current).map(
        ([symbol, { buyPrice, sellPrice, lastBuyPrice, lastSellPrice }]) => (
          <div
            key={symbol}
            className="flex items-center justify-between max-w-[30vw] rounded-sm px-4 py-2 shadow-sm "
          >
            {/* Symbol */}
            <span className="font-semibold text-white text-sm">{symbol}</span>

            {/* Buy */}
            <div
              className={` text-center text-sm w-[30%] ${
                lastBuyPrice < buyPrice ? "text-green-500" : "text-red-400"
              }`}
            >
              Buy: {buyPrice.toFixed(2)}
            </div>

            {/* Sell */}
            <div
              className={`w-[30%] text-center  text-sm font-medium ${
                lastSellPrice < sellPrice ? "text-green-500" : "text-red-400"
              }`}
            >
              Sell: {sellPrice.toFixed(2)}
            </div>
          </div>
        )
      )}
    </div>
  );
}
