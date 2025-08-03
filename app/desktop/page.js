"use client";

import { useEffect, useRef } from "react";

export default function DesktopViewerPage() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const pc = new RTCPeerConnection();
    peerRef.current = pc;

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      videoRef.current.srcObject = stream;
    };

    const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
    wsRef.current = ws;
    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        // This is probably a JSON message (offer/answer/candidate)
        try {
          const data = JSON.parse(event.data);
          // handle JSON data (offer, answer, etc.)
        } catch (e) {
          console.error("Invalid JSON:", e);
        }
      } else if (event.data instanceof Blob) {
        // This is probably a video frame or other binary data
        const blob = event.data;
        const url = URL.createObjectURL(blob);
        const video = document.getElementById("remoteVideo"); // or your video tag
        video.src = url;
        video.play();
      }
    };

    // ws.onmessage = async (msg) => {
    //   const data = JSON.parse(msg.data);
    //   if (data.type === "offer") {
    //     await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    //     const answer = await pc.createAnswer();
    //     await pc.setLocalDescription(answer);

    //     ws.send(JSON.stringify({ type: "answer", answer }));
    //   }
    // };
  }, []);

  return (
    <div>
      <h1>💻 Desktop Viewer</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls
        style={{ width: "100%" }}
      />
    </div>
  );
}
