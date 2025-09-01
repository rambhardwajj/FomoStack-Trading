"use client";

import { useState } from "react";

export default function TradeForm() {
  const [useLeverage, setUseLeverage] = useState(false);
  const [leverage, setLeverage] = useState<number | null>(null);
  const [margin, setMargin] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  const leverageOptions = [1, 2, 4, 10];

  return (
    <div className="w-full max-w-md p-5 bg-neutral-900 rounded-xl border border-neutral-700 shadow-lg space-y-4 text-white">
      <h2 className="text-xl font-semibold">Place Your Trade</h2>

      {/* Leverage Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={useLeverage}
          onChange={() => setUseLeverage(!useLeverage)}
          className="w-4 h-4 accent-blue-500"
        />
        <label className="text-sm">Use Leverage</label>
      </div>

      {/* Leverage Options */}
      {useLeverage && (
        <div className="flex space-x-2">
          {leverageOptions.map((option) => (
            <button
              key={option}
              onClick={() => setLeverage(option)}
              className={`px-3 py-1 rounded-lg border text-sm font-medium transition ${
                leverage === option
                  ? "bg-blue-500 text-black border-blue-500"
                  : "border-neutral-600 text-white hover:bg-neutral-800"
              }`}
            >
              {option}x
            </button>
          ))}
        </div>
      )}

      {/* Margin / Quantity Inputs */}
      {!useLeverage && (
        <input
          type="number"
          placeholder="Enter the Margin"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-600 rounded-lg bg-neutral-800 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      <input
        type="number"
        placeholder="Enter the Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-full px-4 py-2 border border-neutral-600 rounded-lg bg-neutral-800 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Stop Loss */}
      <input
        type="number"
        placeholder="Enter Stop Loss"
        value={stopLoss}
        onChange={(e) => setStopLoss(e.target.value)}
        className="w-full px-4 py-2 border border-neutral-600 rounded-lg bg-neutral-800 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Submit Button */}
      <button className="w-full py-2 mt-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition">
        Submit Trade
      </button>
    </div>
  );
}
