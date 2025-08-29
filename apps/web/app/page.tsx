"use client"

import {useEffect} from "react"

export default function Home() {
  useEffect(() =>{
    const socket = new WebSocket("ws://localhost:8080")
    socket.onopen = () =>{
      console.log("connected to websocket server")
    }
    socket.onmessage = (event) =>{
      const msg = JSON.parse(event.data);
      console.log(msg)
    }
    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      socket.close();
    };
  }, [])
  return (
   <div>
      Hellofdsf fasd
   </div>
  );
}
