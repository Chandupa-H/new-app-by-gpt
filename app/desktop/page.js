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

    const ws = new WebSocket("wss://server-production-7da7.up.railway.app");

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify(answer));
      }

      if (data.type === "candidate") {
        await pc.addIceCandidate(data.candidate);
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
