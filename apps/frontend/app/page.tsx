"use client";
import AssetsTicker from "@/componenets/AssetsTicker";
import { LastTrades } from "@/componenets/lastTrades";
import TradingView from "@/componenets/TradingViews";
import Image from "next/image";
import React, { useState } from "react";

export default function TradingPage() {
  const [selectedInterval, setSelectedInterval] = useState("1minute");
  const [selectedAsset, setSelectedAsset] = useState("BTCUSDT");
  const [selectedLimit, setSelectedLimit] = useState(100);

  const [useLeverage, setUseLeverage] = useState(false);
  const [leverage, setLeverage] = useState<number | null>(null);
  const [margin, setMargin] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const leverageOptions = [1, 2, 4, 10];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header  */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
        <div className="flex items-center space-x-4">
          <div className=" rounded">
            <Image src="/image.png" alt="" width={150} height={150} />
          </div>
          <div className="">
            <Image src="/btc.png" alt="" width={50} height={50} />
          </div>
          <div className="">
            <Image
              className="rounded-[50%]"
              src="/et.png"
              alt=""
              width={30}
              height={30}
            />
          </div>
          <div className="rounded">
            <Image src="/sol.png" alt="" width={35} height={35} />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 border border-neutral-700 rounded">
            5000 $
          </div>
          <button className="px-4 py-2 border border-neutral-700 rounded">
            Deposit
          </button>
          <div className="w-8 h-8 border border-neutral-700 rounded-full"></div>
        </div>
      </div>

      <div className="flex flex-1 p-4 space-x-4">
        {/* Left  */}
        <div className="flex flex-col w-1/4 space-y-3">
          <div className="flex-1 rounded">
            <AssetsTicker />
            <LastTrades />
          </div>
        </div>

        <div className="flex flex-col flex-1 space-y-4">
          {/* Chart  */}
          <div className="h-10ml-4 rounded flex items-center px-2">
            <select
              className="bg-neutral-900 text-white ml-2 cursor-pointer text-sm border border-neutral-700 rounded px-2 py-1 focus:outline-none"
              defaultValue={selectedInterval}
              onChange={(e) => setSelectedInterval(e.currentTarget.value)}
            >
              <option value="1minute">1m</option>
              <option value="5minutes">5m</option>
              <option value="15minutes">15m</option>
              <option value="30minutes">30m</option>
              <option value="1hour">1h</option>
              <option value="4hours">4h</option>
              <option value="1day">1d</option>
              <option value="1week">1w</option>
              <option value="1month">1M</option>
            </select>
            <select
              className="bg-neutral-900 text-white cursor-pointer mx-2 text-sm border border-neutral-700 rounded px-2 py-1 focus:outline-none"
              defaultValue={selectedAsset}
              onChange={(e) => setSelectedAsset(e.currentTarget.value)}
            >
              <option value="BTCUSDT">BTC</option>
              <option value="SOLUSDT">SOL</option>
              <option value="ETHUSDT">ETH</option>
            </select>
          </div>
          <div className="flex ml-4 p-2 rounded">
            <TradingView
              asset={selectedAsset}
              interval={selectedInterval}
              limit={selectedLimit}
            />
            <div className="w-[20vw] p-4 rounded-sm bg-neutral-900 border border-neutral-700 shadow-lg space-y-4 flex flex-col justify-between ">
              {/* Buy & Sell Buttons */}
              <div>
                <div className="flex space-x-4">
                  <div
                    onClick={() => setSelected("buy")}
                    className={`flex-1 border rounded-xl h-14 flex justify-center items-center flex-col font-bold cursor-pointer transition duration-300 
          ${
            selected === "buy"
              ? "bg-green-500 text-black border-green-600"
              : "text-green-400 border-green-600 hover:bg-green-500 hover:text-black"
          }`}
                  >
                    Buy
                  </div>

                  {/* Sell Button */}
                  <div
                    onClick={() => setSelected("sell")}
                    className={`flex-1 border rounded-xl h-14 flex justify-center items-center flex-col font-bold cursor-pointer transition duration-300 
          ${
            selected === "sell"
              ? "bg-red-500 text-black border-red-600"
              : "text-red-400 border-red-600 hover:bg-red-500 hover:text-black"
          }`}
                  >
                    Sell
                  </div>
                </div>
                <div className="flex flex-col space-y-3 justify-between">
                  <div className="flex flex-col space-y-3">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={useLeverage}
                          onChange={() => setUseLeverage(!useLeverage)}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <label className="text-sm p-3">Use Leverage</label>
                      </div>
                    </div>

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
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <button className="px-10 py-3 bg-green-700 rounded-md ">
                  Place Your Order
                </button>
              </div>
            </div>
          </div>

          {/* RL  */}
          <div className="flex space-x-4">
            <div className="flex flex-col space-y-2"></div>

            <div className="flex-1 flex flex-col space-y-2">
              <select
                className="bg-neutral-900 text-white cursor-pointer text-sm max-w-[10vw] border border-neutral-700 rounded px-2 py-1 focus:outline-none"
                defaultValue={selectedLimit}
                onChange={(e) =>
                  setSelectedLimit(Number(e.currentTarget.value))
                }
              >
                <option value="Pending">Order History</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
              <div className="h-13 border border-neutral-700 rounded"></div>
              <div className="h-13 border border-neutral-700 rounded"></div>
              <div className="h-13 border border-neutral-700 rounded"></div>
              <div className="h-13 border border-neutral-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
