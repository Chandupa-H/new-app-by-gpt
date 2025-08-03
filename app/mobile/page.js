// "use client";

// import { useEffect, useRef } from "react";

// export default function MobileStreamPage() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);

//   useEffect(() => {
//     const init = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       videoRef.current.srcObject = stream;

//       const pc = new RTCPeerConnection();
//       stream.getTracks().forEach((track) => pc.addTrack(track, stream));
//       peerRef.current = pc;

//       const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//       wsRef.current = ws;

//       // ws.onmessage = async (msg) => {
//       //   try {
//       //     const text = await msg.data.text();
//       //     const data = JSON.parse(text);
//       //     console.log("📩 Mobile received:", data);

//       //     if (data.type === "answer") {
//       //       await pc.setRemoteDescription(
//       //         new RTCSessionDescription(data.answer)
//       //       );
//       //     }
//       //   } catch (err) {
//       //     console.error("❌ Mobile failed to parse WebSocket message:", err);
//       //   }
//       // };
//       ws.onmessage = async (msg) => {
//         const data = JSON.parse(msg.data);
//         console.log("📩 Mobile received:", data);

//         if (data.type === "answer") {
//           await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
//         } else if (data.type === "candidate") {
//           await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//         }
//       };

//       // ws.onopen = async () => {
//       //   const offer = await pc.createOffer();
//       //   await pc.setLocalDescription(offer);
//       //   ws.send(JSON.stringify({ type: "offer", offer }));
//       // };
//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           ws.send(
//             JSON.stringify({ type: "candidate", candidate: event.candidate })
//           );
//         }
//       };
//     };

//     init();
//   }, []);

//   // useEffect(() => {
//   //   const init = async () => {
//   //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//   //     videoRef.current.srcObject = stream;

//   //     const pc = new RTCPeerConnection();
//   //     stream.getTracks().forEach((track) => pc.addTrack(track, stream));
//   //     peerRef.current = pc;

//   //     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//   //     wsRef.current = ws;

//   //     ws.onmessage = async (msg) => {
//   //       const data = JSON.parse(msg.data);
//   //       if (data.type === "answer") {
//   //         await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
//   //       }
//   //     };

//   //     const offer = await pc.createOffer();
//   //     await pc.setLocalDescription(offer);

//   //     ws.onopen = () => {
//   //       ws.send(JSON.stringify({ type: "offer", offer }));
//   //     };
//   //   };

//   //   init();
//   // }, []);

//   return (
//     <div>
//       <h1>📱 Mobile Streaming</h1>
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         style={{ width: "100%" }}
//       />
//     </div>
//   );
// }
// "use client";
// import { useEffect, useRef } from "react";

// export default function MobileStreamPage() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);

//   useEffect(() => {
//     const init = async () => {
//       console.log("📱 Mobile: Initializing...");

//       // 1. Get local media
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       console.log("📱 Mobile: Got media stream");
//       videoRef.current.srcObject = stream;

//       // 2. Create PeerConnection
//       const pc = new RTCPeerConnection();
//       stream.getTracks().forEach((track) => pc.addTrack(track, stream));
//       peerRef.current = pc;
//       console.log("📱 Mobile: PeerConnection created and tracks added");

//       // 3. Connect to WebSocket signaling server
//       const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//       wsRef.current = ws;

//       ws.onopen = () => {
//         console.log("📱 Mobile: WebSocket connected ✅");
//       };

//       ws.onmessage = async (msg) => {
//         console.log("📩 Mobile received:", msg.data);
//         try {
//           const data = JSON.parse(msg.data);
//           if (data.type === "answer") {
//             console.log("📱 Mobile: Received answer");
//             await pc.setRemoteDescription(
//               new RTCSessionDescription(data.answer)
//             );
//           } else if (data.type === "candidate") {
//             console.log("📱 Mobile: Received ICE candidate");
//             await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//           }
//         } catch (err) {
//           console.error("📱 Mobile: Failed to parse message", err);
//         }
//       };

//       // 4. Send offer
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       console.log("📱 Mobile: Created and set local offer");

//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           console.log("📱 Mobile: Sending ICE candidate");
//           ws.send(
//             JSON.stringify({ type: "candidate", candidate: event.candidate })
//           );
//         }
//       };

//       ws.onopen = () => {
//         console.log("📱 Mobile: Sending offer...");
//         ws.send(JSON.stringify({ type: "offer", offer }));
//       };
//     };

//     init();
//   }, []);

//   return (
//     <div>
//       <h1>📱 Mobile Streaming</h1>
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         style={{ width: "100%" }}
//       />
//     </div>
//   );
// }
"use client";

import { useEffect, useRef } from "react";

export default function MobileStreamPage() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const wsRef = useRef(null);
  const candidateQueueRef = useRef([]);

  useEffect(() => {
    const init = async () => {
      console.log("📱 Mobile: Initializing...");

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log("📱 Mobile: Got media stream");
      videoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      console.log("📱 Mobile: PeerConnection created and tracks added");
      peerRef.current = pc;

      const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
      wsRef.current = ws;

      // ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = {
            type: "candidate",
            candidate: event.candidate,
          };
          console.log("📱 Mobile: Sending ICE candidate");

          // If WebSocket is ready, send it immediately
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(candidate));
          } else {
            // Otherwise queue it
            console.warn("📱 Mobile: WebSocket not ready, queueing ICE");
            candidateQueueRef.current.push(candidate);
          }
        }
      };

      ws.onopen = () => {
        console.log("📱 Mobile: WebSocket connected ✅");

        // Send queued ICE candidates
        while (candidateQueueRef.current.length > 0) {
          const queuedCandidate = candidateQueueRef.current.shift();
          ws.send(JSON.stringify(queuedCandidate));
          console.log("📱 Mobile: Sent queued ICE candidate");
        }

        // Send offer
        console.log("📱 Mobile: Sending offer...");
        ws.send(JSON.stringify({ type: "offer", offer: pc.localDescription }));
      };

      ws.onmessage = async (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.type === "answer") {
            console.log("📱 Mobile: Received answer");
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
          } else if (data.type === "candidate") {
            console.log("📱 Mobile: Received remote ICE candidate");
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (err) {
          console.error("📱 Mobile: Error handling WebSocket message", err);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("📱 Mobile: Created and set local offer");
    };

    init();
  }, []);

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
