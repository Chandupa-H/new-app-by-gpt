"use client";

import { useEffect, useRef } from "react";

export default function MobileStreamPage() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      peerRef.current = pc;

      const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
      wsRef.current = ws;

      // ws.onmessage = async (msg) => {
      //   try {
      //     const text = await msg.data.text();
      //     const data = JSON.parse(text);
      //     console.log("📩 Mobile received:", data);

      //     if (data.type === "answer") {
      //       await pc.setRemoteDescription(
      //         new RTCSessionDescription(data.answer)
      //       );
      //     }
      //   } catch (err) {
      //     console.error("❌ Mobile failed to parse WebSocket message:", err);
      //   }
      // };
      ws.onmessage = async (msg) => {
        const data = JSON.parse(msg.data);
        console.log("📩 Mobile received:", data);

        if (data.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === "candidate") {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      };

      // ws.onopen = async () => {
      //   const offer = await pc.createOffer();
      //   await pc.setLocalDescription(offer);
      //   ws.send(JSON.stringify({ type: "offer", offer }));
      // };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          ws.send(
            JSON.stringify({ type: "candidate", candidate: event.candidate })
          );
        }
      };
    };

    init();
  }, []);

  // useEffect(() => {
  //   const init = async () => {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //     videoRef.current.srcObject = stream;

  //     const pc = new RTCPeerConnection();
  //     stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  //     peerRef.current = pc;

  //     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
  //     wsRef.current = ws;

  //     ws.onmessage = async (msg) => {
  //       const data = JSON.parse(msg.data);
  //       if (data.type === "answer") {
  //         await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
  //       }
  //     };

  //     const offer = await pc.createOffer();
  //     await pc.setLocalDescription(offer);

  //     ws.onopen = () => {
  //       ws.send(JSON.stringify({ type: "offer", offer }));
  //     };
  //   };

  //   init();
  // }, []);

  return (
    <div>
      <h1>📱 Mobile Streaming</h1>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "100%" }}
      />
    </div>
  );
}
