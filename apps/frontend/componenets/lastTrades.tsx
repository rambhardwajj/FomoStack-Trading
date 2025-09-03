import { useEffect, useRef, useState } from "react";
type Trade = {
  symbol: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  tradeId: number;
  timestamp: number;
};

export const LastTrades = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const tradeRefs = useRef<Record<string, Trade[]>>({});
  const [, setRender] = useState(0);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    socketRef.current = ws;

    ws.onopen = () => console.log("Connected to WebSocket server");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (!tradeRefs.current[msg.symbol]) {
        tradeRefs.current[msg.symbol] = [];
      }

      tradeRefs.current[msg.symbol] = [
        msg,
        ...(tradeRefs.current[msg.symbol] || []),
      ].slice(0, 2);
    };

    const interval = setInterval(() => {
      setRender((prev) => prev + 1);
    }, 300);

    ws.onerror = (error) => {
      console.log(error);
    };
    ws.onclose = () => {
      console.log("ws closed");
    };
  }, []);

  return (
    <div>
      <div className="p-4 space-y-6">
        {Object.entries(tradeRefs.current).map(([symbol, trades = []]) => (
          <div
            key={symbol}
            className="bg-neutral-950 border border-neutral-700 rounded-md shadow-lg overflow-hidden"
          >
            {/* Symbol Header */}
            <div className="p-3 border-b border-neutral-700 text-white font-semibold text-md tracking-wide">
              {symbol} - Last 2 Trades
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-white">
                <thead className="bg-neutral-900 text-xs uppercase tracking-wider text-gray-300">
                  <tr>
                    <th className="p-3 text-right">Buy</th>
                    <th className="p-3 text-right">Sell</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades?.map((trade, idx) => (
                    <tr
                      key={trade.tradeId || idx}
                      className="hover:bg-neutral-800 transition-colors duration-150"
                    >
                      <td className="p-3 text-right text-green-400 font-medium">
                        {Number(trade.buyPrice).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-red-400 font-medium">
                        {Number(trade.sellPrice).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-gray-300">
                        {Number(trade.quantity).toFixed(4)}
                      </td>
                      <td className="p-3 text-right text-gray-400">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
