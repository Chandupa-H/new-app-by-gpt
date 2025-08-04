"use client";

import { useRef, useState } from "react";

export default function MobileStreamPage() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const wsRef = useRef(null);
  const iceQueue = useRef([]);
  const [ready, setReady] = useState(false);

  const handleStart = async () => {
    console.log("📱 Mobile: Starting stream...");

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    console.log("📱 Mobile: Got media stream");

    const pc = new RTCPeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    peerRef.current = pc;
    console.log("📱 Mobile: PeerConnection created and tracks added");

    const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
    wsRef.current = ws;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateMsg = JSON.stringify({
          type: "candidate",
          candidate: event.candidate,
        });
        if (ws.readyState === WebSocket.OPEN) {
          console.log("📱 Mobile: Sending ICE candidate");
          ws.send(candidateMsg);
        } else {
          console.log("📱 Mobile: Queued ICE candidate");
          iceQueue.current.push(candidateMsg);
        }
      }
    };

    ws.onopen = async () => {
      console.log("📱 Mobile: WebSocket connected ✅");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("📱 Mobile: Created and set local offer");

      ws.send(JSON.stringify({ type: "offer", offer }));
      console.log("📱 Mobile: Sent offer");

      // Send queued ICE candidates
      iceQueue.current.forEach((msg) => {
        ws.send(msg);
        console.log("📱 Mobile: Sent queued ICE candidate");
      });
      iceQueue.current = [];
    };

    ws.onmessage = async (msg) => {
      const data =
        typeof msg.data === "string" ? msg.data : await msg.data.text();
      const parsed = JSON.parse(data);
      console.log("📩 Mobile: Received message", parsed);

      if (parsed.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(parsed.answer));
        console.log("📱 Mobile: Set remote description from desktop");
      }
    };
  };

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
      <button
        onClick={handleStart}
        disabled={ready}
        style={{ marginTop: 16, padding: "10px 20px", fontSize: "16px" }}
      >
        Start Streaming
      </button>
    </div>
  );
}
