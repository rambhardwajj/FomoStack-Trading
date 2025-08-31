"use client";
import AssetsTicker from "@/componenets/AssetsTicker";
import TradingView from "@/componenets/TradingViews";
import Image from "next/image";
import React from "react";

export default function TradingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header  */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className=" rounded">
            <img src="image.png" alt="" width={150}/>
          </div>
          <div className="">
            <img src="btc.png" alt="" width={50} />
          </div>
          <div className="">
            <img className="rounded-[50%]" src="et.png" alt=""  width={30}/>
          </div>
          <div className="rounded">
            <img src="sol.png" alt="" width={35}/>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 border border-gray-700 rounded">5000 $</div>
          <button className="px-4 py-2 border border-gray-700 rounded">
            Deposit
          </button>
          <div className="w-8 h-8 border border-gray-700 rounded-full"></div>
        </div>
      </div>

      <div className="flex flex-1 p-4 space-x-4">
        {/* Left  */}
        <div className="flex flex-col w-1/4 space-y-4">
          <div className="flex-1 rounded">
            <AssetsTicker />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 border border-gray-700 rounded h-15">
                Buy
            </div>
            <div className="flex-1 border border-gray-700 rounded h-15 ">
                Sell 
            </div>
          </div>
          <div className="h-10 border border-gray-700 rounded"></div>
          <div className="h-10 border border-gray-700 rounded"></div>
          <div className="h-10 border border-gray-700 rounded"></div>
        </div>

        <div className="flex flex-col flex-1 space-y-4">
          {/* Chart  */}
          <div className="h-10 border border-gray-700 rounded">
            
          </div>
          <div className="flex  p-2 border border-gray-700 rounded">
            <TradingView />
          </div>

          {/* RL  */}
          <div className="flex space-x-4">
            <div className="flex flex-col space-y-2">
              <div>
                <button className="px-2 py-1 mx-2 border border-gray-700 rounded h-10">
                  Open
                </button>
                <button className="px-2 py-1 mx-2 border border-gray-700 rounded h-10">
                  Close
                </button>
                <button className="px-2 py-1 mx-2 border border-gray-700 rounded h-10">
                  Pending
                </button>
              </div>
              <div></div>
            </div>

            <div className="flex-1 flex flex-col space-y-2">
              <div className="h-13 border border-gray-700 rounded"></div>
              <div className="h-13 border border-gray-700 rounded"></div>
              <div className="h-13 border border-gray-700 rounded"></div>
              <div className="h-13 border border-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
