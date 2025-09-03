"use client";

import AssetsTicker from "@/componenets/AssetsTicker";
import { LastTrades } from "@/componenets/lastTrades";
import TradingView from "@/componenets/TradingViews";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function TradingPage() {
  const [selectedInterval, setSelectedInterval] = useState("1minute");
  const [selectedAsset, setSelectedAsset] = useState("BTCUSDT");
  const [selectedLimit, setSelectedLimit] = useState(100);
  const [history, setHistorty] = useState("OPEN");

  const [useLeverage, setUseLeverage] = useState(false);
  const [leverage, setLeverage] = useState<number | null>(null);
  const [margin, setMargin] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const router = useRouter();

  const leverageOptions = [1, 2, 4, 10];

  const { user, logout } = useUser();
  console.log(user)

  function handlePlaceOrder() {
    console.log("OrderType- ", selected)
    console.log("isLeverage- ", useLeverage)
    console.log("margin- ", margin )
    console.log('quantity- ', quantity)
    console.log("stopLoss- ", stopLoss)

  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white w-[100vw]">
      <header className="h-16 bg-[#111111] border-b border-[#1a1a1a] px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <Image
              src="/image.png"
              alt="Logo"
              width={120}
              height={32}
              className="h-18 w-auto"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
              <Image src="/btc.png" alt="BTC" width={24} height={24} />
            </div>
            <div className="p-1.5 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
              <Image
                src="/et.png"
                alt="ETH"
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <div className="p-1.5 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
              <Image src="/sol.png" alt="SOL" width={24} height={24} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg font-medium">
            <span className="text-sm text-gray-400 mr-2">Balance:</span>
            <span className="text-green-400 font-semibold">$5,000.00</span>
          </div>
          <button className="px-4 py-2 bg-black hover:bg-neutral-700 border border-neutral-500 mx-5 rounded-lg font-medium transition-colors">
            Deposit
          </button>
          <div className="w-8 h-8 mx-4  rounded-lg flex items-center justify-center">
            <div className="rounded-full">

              {
                user && (
                  <button
                  className="border-neutral-700 border rounded-md py-2 px-6"
                  onClick={logout}
                   >Logout</button>
                )
              }
              {!user && (
                <button
                className="border-neutral-700 border rounded-md py-2 px-6" onClick={() => router.push('/signin')} >
                  SignIn
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-4rem)]">
        <aside className="w-90 bg-[#0f0f0f] border-r border-[#1a1a1a] p-4">
          <div className="space-y-4">
            <LastTrades />
            <AssetsTicker />
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400 font-medium">
                  Interval:
                </label>
                <select
                  className="bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors min-w-[80px]"
                  value={selectedInterval}
                  onChange={(e) => setSelectedInterval(e.target.value)}
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
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400 font-medium">
                  Asset:
                </label>
                <select
                  className="bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors min-w-[100px]"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                >
                  <option value="BTCUSDT">BTC/USDT</option>
                  <option value="SOLUSDT">SOL/USDT</option>
                  <option value="ETHUSDT">ETH/USDT</option>
                </select>
              </div>
            </div>

            <div className="flex gap-6 h-[500px]">
              <div className="flex-1 bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
                <TradingView
                  asset={selectedAsset}
                  interval={selectedInterval}
                  limit={selectedLimit}
                />
              </div>

              <div className="w-80 bg-[#111111] border border-[#1a1a1a] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-6 text-center">
                  Place Order
                </h3>

                <div className="flex mb-6 bg-[#0a0a0a] rounded-lg p-1">
                  <button
                    onClick={() => setSelected("buy")}
                    className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-200 ${
                      selected === "buy"
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-green-400 hover:bg-green-600/10"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setSelected("sell")}
                    className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-200 ${
                      selected === "sell"
                        ? "bg-red-600 text-white shadow-lg"
                        : "text-red-400 hover:bg-red-600/10"
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Use Leverage
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useLeverage}
                        onChange={() =>  setUseLeverage(!useLeverage)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {useLeverage && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">
                        Leverage
                      </label>
                      <div className="flex gap-1">
                        {leverageOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => setLeverage(option)}
                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                              leverage === option
                                ? "bg-blue-600 text-white border-blue-500 shadow-lg"
                                : "border-[#2a2a2a] text-gray-300 hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
                            }`}
                          >
                            {option}x
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  

                  <div className={` space-y-2
                    ${margin ===""? "" : useLeverage === true? "":  "hidden"}
                    `}>
                    <label className={`text-sm font-medium text-gray-300 `}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="Enter quantity"
                      value={quantity}
                      disabled={margin===""? false : useLeverage===true? false:  true }
                      onChange={(e) => setQuantity(e.target.value)}
                      className={`w-full px-4 py-3 border border-[#2a2a2a] rounded-lg bg-[#0a0a0a] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Stop Loss
                    </label>
                    <input
                      type="number"
                      placeholder="Enter stop loss price"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full px-4 py-3 border border-[#2a2a2a] rounded-lg bg-[#0a0a0a] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                      selected === "buy"
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/25"
                        : selected === "sell"
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25"
                          : "bg-[#2a2a2a] text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!selected}

                    onClick={handlePlaceOrder}
                  >
                    {selected
                      ? `Place ${selected.charAt(0).toUpperCase() + selected.slice(1)} Order`
                      : "Select Buy or Sell"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1a1a1a] p-3 mr-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Order History</h3>
              <select
                className="bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                value={history}
                onChange={(e) => setHistorty(e.target.value)}
              >
                <option value="Pending">Pending Orders</option>
                <option value="Open">Open Positions</option>
                <option value="Closed">Order History</option>
              </select>
            </div>

            <div className="grid grid-cols-4 gap-4">dfsaf</div>
          </div>
        </div>
      </main>
    </div>
  );
}
