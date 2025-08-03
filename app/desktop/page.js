"use client";
import { useEffect, useRef } from "react";

export default function DesktopViewPage() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      console.log("💻 Desktop: Initializing...");

      const pc = new RTCPeerConnection();
      peerRef.current = pc;

      // Show incoming stream
      pc.ontrack = (event) => {
        console.log("💻 Desktop: Received remote track");
        videoRef.current.srcObject = event.streams[0];
      };

      // Setup WebSocket
      const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("💻 Desktop: WebSocket connected ✅");
      };

      ws.onmessage = async (msg) => {
        console.log("📩 Desktop received msg:", msg);
        console.log("📩 Desktop  msg.data:", msg.data);
        try {
          const data = JSON.parse(msg.data);
          console.log("data", data);

          if (data.type === "offer") {
            console.log("💻 Desktop: Received offer");

            await pc.setRemoteDescription(
              new RTCSessionDescription(data.offer)
            );
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log("💻 Desktop: Sending answer");
            ws.send(JSON.stringify({ type: "answer", answer }));
          } else if (data.type === "candidate") {
            console.log("💻 Desktop: Received ICE candidate");
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (err) {
          console.error("💻 Desktop: Failed to parse message", err);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("💻 Desktop: Sending ICE candidate");
          ws.send(
            JSON.stringify({ type: "candidate", candidate: event.candidate })
          );
        }
      };
    };

    init();
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

// // /app/desktop/page.jsx

// "use client";
// import { useEffect, useRef } from "react";

// export default function DesktopPage() {
//   const remoteVideoRef = useRef(null);
//   const peerConnectionRef = useRef(null);

//   useEffect(() => {
//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });
//     peerConnectionRef.current = pc;
//     console.log("pc", pc);

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     console.log("ws", ws);

//     ws.onopen = () => {
//       console.log("✅ WebSocket connected");
//     };

//     ws.onmessage = async (event) => {
//       try {
//         const text = await event.data.text();
//         const message = JSON.parse(text);
//         console.log("📩 Parsed message:", message);

//         if (message.type === "offer") {
//           await peerConnectionRef.current.setRemoteDescription(
//             new RTCSessionDescription(message.offer)
//           );
//           const answer = await peerConnectionRef.current.createAnswer();
//           await peerConnectionRef.current.setLocalDescription(answer);

//           ws.send(JSON.stringify({ type: "answer", answer }));
//         } else if (message.type === "answer") {
//           await peerConnectionRef.current.setRemoteDescription(
//             new RTCSessionDescription(message.answer)
//           );
//         } else if (message.type === "candidate") {
//           await peerConnectionRef.current.addIceCandidate(
//             new RTCIceCandidate(message.candidate)
//           );
//         }
//       } catch (err) {
//         console.error("❌ Failed to parse WebSocket message:", err);
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate && ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({ type: "candidate", candidate: event.candidate })
//         );
//       }
//     };

//     pc.ontrack = (event) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };
//   }, []);

//   // useEffect(() => {
//   //   const pc = new RTCPeerConnection({
//   //     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//   //   });
//   //   peerConnectionRef.current = pc;
//   //   console.log("pc", pc);

//   //   const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//   //   console.log("ws", ws);

//   //   // ws.onmessage = async (event) => {
//   //   //   const data = JSON.parse(event.data);

//   //   //   if (data.type === "offer") {
//   //   //     await pc.setRemoteDescription(new RTCSessionDescription(data));
//   //   //     const answer = await pc.createAnswer();
//   //   //     await pc.setLocalDescription(answer);
//   //   //     ws.send(JSON.stringify(answer));
//   //   //   }

//   //   //   if (data.type === "candidate") {
//   //   //     await pc.addIceCandidate(data.candidate);
//   //   //   }
//   //   // };
//   //   // ws.onmessage = async (event) => {
//   //   //   try {
//   //   //     const text = await event.data.text(); // Convert Blob to text
//   //   //     const message = JSON.parse(text); // Now parse JSON
//   //   //     console.log("📩 Parsed message:", message);

//   //   //     // continue with your logic...
//   //   //     handleSignalingMessage(message);
//   //   //   } catch (err) {
//   //   //     console.error("❌ Failed to parse WebSocket message:", err);
//   //   //   }
//   //   // };
//   //   ws.onmessage = async (event) => {
//   //     const text = await event.data.text();
//   //     const message = JSON.parse(text);
//   //     console.log(message);

//   //     if (message.type === "offer") {
//   //       await peerConnectionRef.current.setRemoteDescription(
//   //         new RTCSessionDescription(message.offer)
//   //       );
//   //       const answer = await peerConnectionRef.current.createAnswer();
//   //       await peerConnectionRef.current.setLocalDescription(answer);

//   //       socket.send(JSON.stringify({ type: "answer", answer }));
//   //     } else if (message.type === "answer") {
//   //       await peerConnectionRef.current.setRemoteDescription(
//   //         new RTCSessionDescription(message.answer)
//   //       );
//   //     } else if (message.type === "candidate") {
//   //       await peerConnectionRef.current.addIceCandidate(
//   //         new RTCIceCandidate(message.candidate)
//   //       );
//   //     }
//   //   };

//   //   pc.onicecandidate = (event) => {
//   //     if (event.candidate) {
//   //       ws.send(
//   //         JSON.stringify({ type: "candidate", candidate: event.candidate })
//   //       );
//   //     }
//   //   };

//   //   pc.ontrack = (event) => {
//   //     remoteVideoRef.current.srcObject = event.streams[0];
//   //   };
//   // }, []);

//   return (
//     <div>
//       <p>hello2</p>
//       <h1>Desktop Preview</h1>
//       <video
//         ref={remoteVideoRef}
//         autoPlay
//         playsInline
//         style={{ width: "100%" }}
//       />
//     </div>
//   );
// }
// "use client";

// import { useEffect, useRef } from "react";

// export default function DesktopStreamViewer() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);

//   useEffect(() => {
//     const pc = new RTCPeerConnection();
//     peerRef.current = pc;

//     pc.ontrack = (event) => {
//       console.log("🎥 Track received");
//       videoRef.current.srcObject = event.streams[0];
//     };

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     wsRef.current = ws;

//     ws.onmessage = async (msg) => {
//       const data = JSON.parse(msg.data);
//       console.log("📩 Desktop received:", data);

//       if (data.type === "offer") {
//         await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         ws.send(JSON.stringify({ type: "answer", answer }));
//       } else if (data.type === "candidate") {
//         try {
//           await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//         } catch (e) {
//           console.error("❌ Failed to add ICE candidate", e);
//         }
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         ws.send(
//           JSON.stringify({ type: "candidate", candidate: event.candidate })
//         );
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <h1>💻 Desktop Viewer</h1>
//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         controls
//         style={{ width: "100%" }}
//       />
//     </div>
//   );
// }
