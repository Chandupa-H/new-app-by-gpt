// "use client";

// import { useEffect, useRef, useState } from "react";

// export default function Home() {
//   const [isMobile, setIsMobile] = useState(false);
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerRef = useRef(null);

//   useEffect(() => {
//     // Detect screen size on first render
//     if (typeof window !== "undefined") {
//       setIsMobile(window.innerWidth <= 768);
//     }
//   }, []);

//   useEffect(() => {
//     if (isMobile) {
//       startCameraAndSendStream();
//     } else {
//       setupReceiver();
//     }
//   }, [isMobile]);

//   // MOBILE: Capture camera and send stream via WebRTC
//   const startCameraAndSendStream = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: false,
//     });
//     localVideoRef.current.srcObject = stream;

//     peerRef.current = new RTCPeerConnection();

//     // Add stream tracks to the connection
//     stream
//       .getTracks()
//       .forEach((track) => peerRef.current.addTrack(track, stream));

//     // Create offer
//     const offer = await peerRef.current.createOffer();
//     await peerRef.current.setLocalDescription(offer);

//     // Send offer to the desktop (for demo, using localStorage as signaling)
//     localStorage.setItem("offer", JSON.stringify(offer));

//     // Listen for answer from desktop
//     const interval = setInterval(() => {
//       const answerStr = localStorage.getItem("answer");
//       if (answerStr) {
//         const answer = JSON.parse(answerStr);
//         peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//         clearInterval(interval);
//       }
//     }, 1000);
//   };

//   // DESKTOP: Receive offer and show remote stream
//   const setupReceiver = async () => {
//     peerRef.current = new RTCPeerConnection();

//     peerRef.current.ontrack = (event) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     // Listen for offer from mobile
//     const interval = setInterval(async () => {
//       const offerStr = localStorage.getItem("offer");
//       if (offerStr) {
//         clearInterval(interval);
//         const offer = JSON.parse(offerStr);
//         await peerRef.current.setRemoteDescription(
//           new RTCSessionDescription(offer)
//         );
//         const answer = await peerRef.current.createAnswer();
//         await peerRef.current.setLocalDescription(answer);
//         localStorage.setItem("answer", JSON.stringify(answer));
//       }
//     }, 1000);
//   };

//   return (
//     <main
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         padding: 20,
//       }}
//     >
//       <h1>{isMobile ? "📱 Mobile Camera Stream" : "💻 Desktop Viewer"}</h1>
//       <video
//         ref={isMobile ? localVideoRef : remoteVideoRef}
//         autoPlay
//         playsInline
//         muted={isMobile}
//         style={{
//           width: "100%",
//           maxWidth: 480,
//           border: "2px solid black",
//           borderRadius: 8,
//         }}
//       />
//       <p style={{ marginTop: 20 }}>
//         {isMobile ? "Streaming to desktop..." : "Waiting for mobile stream..."}
//       </p>
//     </main>
//   );
// }
