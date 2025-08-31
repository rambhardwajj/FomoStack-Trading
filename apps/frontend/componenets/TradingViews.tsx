"use client";

import axios from "axios";
import { CandlestickSeries, createChart } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

export default function TradingView() {
  const secondContainerRef = useRef(null);
  const [data, setData ] = useState([]);

  useEffect(() => {
    if (secondContainerRef.current) {
      const chartOptions = { layout: { textColor: 'white', background: { color: 'black' } } };
      const secondChart = createChart(secondContainerRef.current, chartOptions);

      const secondSeries = secondChart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      // api to get the data of the candles from timescaledb
      const fetchData = async () => {
        try {
          const res = await axios.post(
            "http://localhost:4000/api/v1/candles/get-candles",
            {
              asset: "BTCUSDT",
              interval: "1minute",
              limit: 100,
            }
          );
          console.log(res.data.data.rows)
          console.log(res.data.data.rows[0].bucket)


          const candles = res.data.data.rows.map((candle: any) => ({
            time: Date.parse(candle.bucket)/1000, 
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
            close: Number(candle.close),
          }));

          // console.log("candles", candles);
          secondSeries.setData(candles);
          secondChart.timeScale().fitContent();
        } catch (error) {
          console.log(error);
        }
      };

      fetchData();

      // const refreshInterval = setInterval(() =>{
      //   console.log("fetched data");
      //   fetchData();
      // }, 1000)

      return () => {
        // clearInterval(refreshInterval)
        secondChart.remove();
      };
    }
  }, []);

  return (
    <div>
      <div>
        <div
          ref={secondContainerRef}
          style={{ width: "60vw", height: "30vw" }}
        ></div>
      </div>
    </div>
  );
}
