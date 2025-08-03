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

    ws.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        ws.send(JSON.stringify({ type: "answer", answer }));
      }
    };
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
