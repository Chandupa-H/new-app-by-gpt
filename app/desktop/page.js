// /app/desktop/page.jsx

"use client";
import { useEffect, useRef } from "react";

export default function DesktopPage() {
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerConnectionRef.current = pc;
    console.log("pc", pc);

    const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
    console.log("ws", ws);

    // ws.onmessage = async (event) => {
    //   const data = JSON.parse(event.data);

    //   if (data.type === "offer") {
    //     await pc.setRemoteDescription(new RTCSessionDescription(data));
    //     const answer = await pc.createAnswer();
    //     await pc.setLocalDescription(answer);
    //     ws.send(JSON.stringify(answer));
    //   }

    //   if (data.type === "candidate") {
    //     await pc.addIceCandidate(data.candidate);
    //   }
    // };
    socket.onmessage = async (event) => {
      try {
        const text = await event.data.text(); // Convert Blob to text
        const message = JSON.parse(text); // Now parse JSON
        console.log("📩 Parsed message:", message);

        // continue with your logic...
        handleSignalingMessage(message);
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message:", err);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(
          JSON.stringify({ type: "candidate", candidate: event.candidate })
        );
      }
    };

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };
  }, []);

  return (
    <div>
      <p>hello2</p>
      <h1>Desktop Preview</h1>
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: "100%" }}
      />
    </div>
  );
}
