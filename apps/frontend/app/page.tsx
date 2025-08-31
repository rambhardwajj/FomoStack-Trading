"use client";
import AssetsTicker from "@/componenets/AssetsTicker";
import TradingView from "@/componenets/TradingViews";
import Image from "next/image";
import React, { useState } from "react";

export default function TradingPage() {
  const [selectedInterval, setSelectedInterval] = useState("1minute");
  const [selectedAsset, setSelectedAsset] = useState("BTCUSDT");
  const [selectedLimit, setSelectedLimit] = useState(100);
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
            <Image className="rounded-[50%]" src="/et.png" alt="" width={30} height={30} />
          </div>
          <div className="rounded">
            <Image src="/sol.png" alt="" width={35} height={35} />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 border border-neutral-700 rounded">5000 $</div>
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
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 border border-green-700 rounded h-15 justify-center items-center flex flex-col hover:bg-green-500 hover:text-black cursor-pointer font-bold">
              Buy
              <div>{}</div>
            </div>
            <div className="flex-1 border border-red-700 rounded h-15 justify-center items-center flex flex-col hover:bg-red-500 hover:text-black cursor-pointer font-bold ">
              Sell
            </div>
          </div>
          
          <div className="h-12 flex justify-start items-center rounded">
            <input
              type="text"
              placeholder="Enter the Margin"
              className=" pl-5 p-2 border-1 w-[25vw] rounded"
            />
          </div>
          <div className="h-12 flex justify-start items-center rounded">
            <input
              type="text"
              placeholder="Enter the Quantity"
              className=" pl-5 p-2 w-[25vw] border-1 rounded"
            />
          </div>
          <div className="h-12  flex justify-start items-center rounded">
            <input
              type="text"
              placeholder="Enter the Levrage"
              className=" border-1 w-[25vw] rounded pl-5 p-2"
            />
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
            <TradingView asset={selectedAsset} interval={selectedInterval} limit={selectedLimit} />
              <div className=" w-[20vw] border border-neutral-700 rounded">
                
              </div>

          </div>

          {/* RL  */}
          <div className="flex space-x-4">
            <div className="flex flex-col space-y-2">
            </div>

            <div className="flex-1 flex flex-col space-y-2">
               <select
                className="bg-neutral-900 text-white cursor-pointer text-sm max-w-[10vw] border border-neutral-700 rounded px-2 py-1 focus:outline-none"
                defaultValue={selectedLimit}
                onChange={(e) => setSelectedLimit(Number(e.currentTarget.value))}
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
