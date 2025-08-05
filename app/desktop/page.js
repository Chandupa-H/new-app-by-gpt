// // // "use client";

// // // import { useEffect, useRef } from "react";

// // // export default function DesktopViewPage() {
// // //   const videoRef = useRef(null);
// // //   const peerRef = useRef(null);
// // //   const wsRef = useRef(null);

// // //   useEffect(() => {
// // //     const init = async () => {
// // //       console.log("💻 Desktop: Initializing...");

// // //       const pc = new RTCPeerConnection();
// // //       peerRef.current = pc;

// // //       pc.ontrack = (event) => {
// // //         console.log("💻 Desktop: Received remote track");
// // //         videoRef.current.srcObject = event.streams[0];
// // //       };

// // //       const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
// // //       wsRef.current = ws;

// // //       ws.onopen = () => {
// // //         console.log("💻 Desktop: WebSocket connected ✅");
// // //       };

// // //       ws.onmessage = async (msg) => {
// // //         const data =
// // //           typeof msg.data === "string" ? msg.data : await msg.data.text();
// // //         const parsed = JSON.parse(data);
// // //         console.log("📩 Desktop: Received message:", parsed);

// // //         if (parsed.type === "offer") {
// // //           console.log("💻 Desktop: Received offer");
// // //           await pc.setRemoteDescription(
// // //             new RTCSessionDescription(parsed.offer)
// // //           );
// // //           const answer = await pc.createAnswer();
// // //           await pc.setLocalDescription(answer);
// // //           ws.send(JSON.stringify({ type: "answer", answer }));
// // //           console.log("💻 Desktop: Sent answer");
// // //         } else if (parsed.type === "candidate") {
// // //           console.log("💻 Desktop: Adding ICE candidate");
// // //           await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
// // //         }
// // //       };

// // //       pc.onicecandidate = (event) => {
// // //         if (event.candidate && ws.readyState === WebSocket.OPEN) {
// // //           console.log("💻 Desktop: Sending ICE candidate");
// // //           ws.send(
// // //             JSON.stringify({ type: "candidate", candidate: event.candidate })
// // //           );
// // //         }
// // //       };
// // //     };

// // //     init();
// // //   }, []);

// // //   return (
// // //     <div>
// // //       <h1>💻 Desktop Viewer</h1>
// // //       <video
// // //         ref={videoRef}
// // //         autoPlay
// // //         playsInline
// // //         controls
// // //         style={{ width: "100%" }}
// // //       />
// // //     </div>
// // //   );
// // // }
// // "use client";

// // import { useEffect, useRef, useState } from "react";

// // export default function DesktopViewPage() {
// //   const videoRef = useRef(null);
// //   const peerRef = useRef(null);
// //   const wsRef = useRef(null);
// //   const mediaRecorderRef = useRef(null);
// //   const recordedChunksRef = useRef([]);
// //   const [recording, setRecording] = useState(false);

// //   useEffect(() => {
// //     const init = async () => {
// //       const pc = new RTCPeerConnection();
// //       peerRef.current = pc;

// //       pc.ontrack = (event) => {
// //         videoRef.current.srcObject = event.streams[0];
// //       };

// //       const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
// //       wsRef.current = ws;

// //       ws.onopen = () => {
// //         console.log("WebSocket connected");
// //       };

// //       ws.onmessage = async (msg) => {
// //         const data =
// //           typeof msg.data === "string" ? msg.data : await msg.data.text();
// //         const parsed = JSON.parse(data);

// //         if (parsed.type === "offer") {
// //           await pc.setRemoteDescription(
// //             new RTCSessionDescription(parsed.offer)
// //           );
// //           const answer = await pc.createAnswer();
// //           await pc.setLocalDescription(answer);
// //           ws.send(JSON.stringify({ type: "answer", answer }));
// //         } else if (parsed.type === "candidate") {
// //           await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
// //         }
// //       };

// //       pc.onicecandidate = (event) => {
// //         if (event.candidate && ws.readyState === WebSocket.OPEN) {
// //           ws.send(
// //             JSON.stringify({ type: "candidate", candidate: event.candidate })
// //           );
// //         }
// //       };
// //     };

// //     init();
// //   }, []);

// //   const captureImage = () => {
// //     const canvas = document.createElement("canvas");
// //     const video = videoRef.current;
// //     canvas.width = video.videoWidth;
// //     canvas.height = video.videoHeight;
// //     const ctx = canvas.getContext("2d");
// //     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
// //     canvas.toBlob(async (blob) => {
// //       const formData = new FormData();
// //       formData.append("file", blob, `capture_${Date.now()}.png`);

// //       await fetch("/api/save-image", {
// //         method: "POST",
// //         body: formData,
// //       });
// //     }, "image/png");
// //   };

// //   const startRecording = () => {
// //     const stream = videoRef.current.srcObject;
// //     const recorder = new MediaRecorder(stream);
// //     mediaRecorderRef.current = recorder;
// //     recordedChunksRef.current = [];

// //     recorder.ondataavailable = (event) => {
// //       if (event.data.size > 0) recordedChunksRef.current.push(event.data);
// //     };

// //     recorder.onstop = async () => {
// //       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
// //       const formData = new FormData();
// //       formData.append("file", blob, `recording_${Date.now()}.webm`);

// //       await fetch("/api/save-video", {
// //         method: "POST",
// //         body: formData,
// //       });
// //     };

// //     recorder.start();
// //     setRecording(true);
// //   };

// //   const stopRecording = () => {
// //     mediaRecorderRef.current.stop();
// //     setRecording(false);
// //   };

// //   return (
// //     <div>
// //       <h1>💻 Desktop Viewer</h1>
// //       <video
// //         ref={videoRef}
// //         autoPlay
// //         playsInline
// //         controls
// //         style={{ width: "100%" }}
// //       />
// //       <div style={{ marginTop: 16 }}>
// //         <button onClick={captureImage}>📸 Capture Image</button>
// //         {!recording ? (
// //           <button onClick={startRecording}>⏺️ Start Recording</button>
// //         ) : (
// //           <button onClick={stopRecording}>⏹️ Stop Recording</button>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// "use client";

// import { useEffect, useRef, useState } from "react";

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const [recording, setRecording] = useState(false);

//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);

//   useEffect(() => {
//     const init = async () => {
//       const pc = new RTCPeerConnection();
//       peerRef.current = pc;

//       pc.ontrack = (event) => {
//         videoRef.current.srcObject = event.streams[0];
//       };

//       const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//       wsRef.current = ws;

//       ws.onopen = () => {
//         console.log("WebSocket connected");
//       };

//       ws.onmessage = async (msg) => {
//         const data =
//           typeof msg.data === "string" ? msg.data : await msg.data.text();
//         const parsed = JSON.parse(data);

//         if (parsed.type === "offer") {
//           await pc.setRemoteDescription(
//             new RTCSessionDescription(parsed.offer)
//           );
//           const answer = await pc.createAnswer();
//           await pc.setLocalDescription(answer);
//           ws.send(JSON.stringify({ type: "answer", answer }));
//         } else if (parsed.type === "candidate") {
//           await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
//         }
//       };

//       pc.onicecandidate = (event) => {
//         if (event.candidate && ws.readyState === WebSocket.OPEN) {
//           ws.send(
//             JSON.stringify({ type: "candidate", candidate: event.candidate })
//           );
//         }
//       };
//     };

//     init();
//     fetchMedia();
//   }, []);

//   const fetchMedia = async () => {
//     const imgRes = await fetch("/api/list-images");
//     const vidRes = await fetch("/api/list-videos");
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     setImages(imgData.files);
//     setVideos(vidData.files);
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, `capture_${Date.now()}.png`);

//       await fetch("/api/save-image", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     }, "image/png");
//   };

//   const startRecording = () => {
//     const stream = videoRef.current.srcObject;
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) recordedChunksRef.current.push(event.data);
//     };

//     recorder.onstop = async () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("file", blob, `recording_${Date.now()}.webm`);

//       await fetch("/api/save-video", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

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
//       <div style={{ marginTop: 16 }}>
//         <button onClick={captureImage}>📸 Capture Image</button>
//         {!recording ? (
//           <button onClick={startRecording}>⏺️ Start Recording</button>
//         ) : (
//           <button onClick={stopRecording}>⏹️ Stop Recording</button>
//         )}
//       </div>

//       <h2 style={{ marginTop: 24 }}>📷 Captured Images</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {images.map((img, i) => (
//           <img
//             key={i}
//             src={`/data/images/${img}`}
//             style={{ width: 200, border: "1px solid #ccc" }}
//             alt="Captured"
//           />
//         ))}
//       </div>

//       <h2 style={{ marginTop: 24 }}>🎥 Recorded Videos</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {videos.map((vid, i) => (
//           <video
//             key={i}
//             src={`/data/videos/${vid}`}
//             controls
//             style={{ width: 200, border: "1px solid #ccc" }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// "use client";
// import { useEffect, useRef, useState } from "react";

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);

//   const [recording, setRecording] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);

//   const initConnection = async () => {
//     console.log("💻 Desktop: Initializing WebRTC");

//     const pc = new RTCPeerConnection();
//     peerRef.current = pc;

//     pc.ontrack = (event) => {
//       console.log("💻 Received track");
//       videoRef.current.srcObject = event.streams[0];
//     };

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("WebSocket connected ✅");
//       setConnected(true);
//     };

//     ws.onmessage = async (msg) => {
//       const data =
//         typeof msg.data === "string" ? msg.data : await msg.data.text();
//       const parsed = JSON.parse(data);

//       if (parsed.type === "offer") {
//         console.log("📩 Offer received");
//         await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         ws.send(JSON.stringify({ type: "answer", answer }));
//       } else if (parsed.type === "candidate") {
//         console.log("📩 Candidate received");
//         await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate && ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({ type: "candidate", candidate: event.candidate })
//         );
//       }
//     };
//   };

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   const fetchMedia = async () => {
//     const imgRes = await fetch("/api/list-images");
//     const vidRes = await fetch("/api/list-videos");
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     setImages(imgData.files);
//     setVideos(vidData.files);
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, `capture_${Date.now()}.png`);
//       await fetch("/api/save-image", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     }, "image/png");
//   };

//   const startRecording = () => {
//     const stream = videoRef.current.srcObject;
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) recordedChunksRef.current.push(event.data);
//     };

//     recorder.onstop = async () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("file", blob, `recording_${Date.now()}.webm`);

//       await fetch("/api/save-video", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

//   return (
//     <div>
//       <h1>💻 Desktop Viewer</h1>

//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         controls
//         style={{ width: "100%", backgroundColor: "#000" }}
//       />

//       <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
//         {!connected && (
//           <button onClick={initConnection}>🔌 Connect to Stream</button>
//         )}
//         <button onClick={captureImage} disabled={!connected}>
//           📸 Capture Image
//         </button>
//         {!recording ? (
//           <button onClick={startRecording} disabled={!connected}>
//             ⏺️ Start Recording
//           </button>
//         ) : (
//           <button onClick={stopRecording}>⏹️ Stop Recording</button>
//         )}
//       </div>

//       <h2 style={{ marginTop: 24 }}>📷 Captured Images</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {images.map((img, i) => (
//           <img
//             key={i}
//             src={img}
//             style={{ width: 200, border: "1px solid #ccc" }}
//             alt={`Captured ${i}`}
//           />
//         ))}
//       </div>

//       <h2 style={{ marginTop: 24 }}>🎥 Recorded Videos</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {videos.map((vid, i) => (
//           <video
//             key={i}
//             src={`/data/videos/${vid}`}
//             controls
//             style={{ width: 200, border: "1px solid #ccc" }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// "use client";
// import { useEffect, useRef, useState } from "react";
// import dynamic from "next/dynamic";

// // Dynamically import tracking library only on client side
// const loadTracking = () => {
//   if (typeof window !== "undefined") {
//     require("tracking/build/tracking-min");
//   }
// };

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const trackingRef = useRef(null);
//   const lastPositionRef = useRef({ x: null, y: null, timestamp: null });

//   const [recording, setRecording] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [trackingDirection, setTrackingDirection] = useState("");

//   const initConnection = async () => {
//     console.log("💻 Desktop: Initializing WebRTC");

//     const pc = new RTCPeerConnection();
//     peerRef.current = pc;

//     pc.ontrack = (event) => {
//       console.log("💻 Received track");
//       videoRef.current.srcObject = event.streams[0];
//     };

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("WebSocket connected ✅");
//       setConnected(true);
//     };

//     ws.onmessage = async (msg) => {
//       const data =
//         typeof msg.data === "string" ? msg.data : await msg.data.text();
//       const parsed = JSON.parse(data);

//       if (parsed.type === "offer") {
//         console.log("📩 Offer received");
//         await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         ws.send(JSON.stringify({ type: "answer", answer }));
//       } else if (parsed.type === "candidate") {
//         console.log("📩 Candidate received");
//         await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate && ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({ type: "candidate", candidate: event.candidate })
//         );
//       }
//     };
//   };

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   useEffect(() => {
//     const startObjectTracking = () => {
//       const video = videoRef.current;
//       if (!video || !connected || typeof window === "undefined") return;

//       // Load tracking library
//       loadTracking();

//       // Wait for video to be ready
//       const checkVideoReady = () => {
//         if (video.videoWidth === 0 || video.videoHeight === 0) {
//           setTimeout(checkVideoReady, 100);
//           return;
//         }

//         // Check if tracking is available
//         if (!window.tracking) {
//           console.warn("Tracking library not loaded");
//           return;
//         }

//         // Try to use color tracker as it's more reliable than object tracker
//         const tracker = new window.tracking.ColorTracker([
//           "yellow",
//           "magenta",
//           "cyan",
//         ]);
//         tracker.setMinDimension(10);
//         tracker.setMinGroupSize(30);

//         // Start tracking
//         trackingRef.current = window.tracking.track(video, tracker, {
//           camera: false,
//         });

//         tracker.on("track", (event) => {
//           if (event.data.length > 0) {
//             // Get the largest detected object (assuming it's the main subject)
//             const rect = event.data.reduce((largest, current) =>
//               current.width * current.height > largest.width * largest.height
//                 ? current
//                 : largest
//             );

//             const currentTime = Date.now();
//             const centerX = rect.x + rect.width / 2;
//             const centerY = rect.y + rect.height / 2;

//             const lastPos = lastPositionRef.current;

//             if (
//               lastPos.x !== null &&
//               lastPos.y !== null &&
//               lastPos.timestamp !== null
//             ) {
//               const timeDelta = currentTime - lastPos.timestamp;

//               // Only process if enough time has passed (avoid jittery movements)
//               if (timeDelta > 100) {
//                 const deltaX = centerX - lastPos.x;
//                 const deltaY = centerY - lastPos.y;

//                 // Threshold for movement detection
//                 const threshold = 15;

//                 let direction = "";

//                 // Determine horizontal movement
//                 if (Math.abs(deltaX) > threshold) {
//                   direction += deltaX > 0 ? "Right " : "Left ";
//                 }

//                 // Determine vertical movement
//                 if (Math.abs(deltaY) > threshold) {
//                   direction += deltaY > 0 ? "Down" : "Up";
//                 }

//                 if (direction.trim()) {
//                   console.log(`🧠 Object moving: ${direction.trim()}`);
//                   setTrackingDirection(direction.trim());

//                   // Clear direction after 1 second
//                   setTimeout(() => setTrackingDirection(""), 1000);
//                 }

//                 // Update last position
//                 lastPositionRef.current = {
//                   x: centerX,
//                   y: centerY,
//                   timestamp: currentTime,
//                 };
//               }
//             } else {
//               // Initialize first position
//               lastPositionRef.current = {
//                 x: centerX,
//                 y: centerY,
//                 timestamp: currentTime,
//               };
//             }
//           } else {
//             // No objects detected, clear direction
//             setTrackingDirection("");
//           }
//         });
//       };

//       checkVideoReady();
//     };

//     if (connected && videoRef.current) {
//       // Start tracking when video is loaded
//       if (videoRef.current.readyState >= 2) {
//         startObjectTracking();
//       } else {
//         videoRef.current.addEventListener("loadeddata", startObjectTracking);
//       }
//     }

//     // Cleanup function
//     return () => {
//       if (trackingRef.current) {
//         trackingRef.current.stop();
//       }
//       if (videoRef.current) {
//         videoRef.current.removeEventListener("loadeddata", startObjectTracking);
//       }
//     };
//   }, [connected]);

//   const fetchMedia = async () => {
//     const imgRes = await fetch("/api/list-images");
//     const vidRes = await fetch("/api/list-videos");
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     setImages(imgData.files);
//     setVideos(vidData.files);
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, `capture_${Date.now()}.png`);
//       await fetch("/api/save-image", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     }, "image/png");
//   };

//   const startRecording = () => {
//     const stream = videoRef.current.srcObject;
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) recordedChunksRef.current.push(event.data);
//     };

//     recorder.onstop = async () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("file", blob, `recording_${Date.now()}.webm`);

//       await fetch("/api/save-video", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

//   return (
//     <div>
//       <h1>💻 Desktop Viewer</h1>

//       {trackingDirection && (
//         <div
//           style={{
//             backgroundColor: "#007bff",
//             color: "white",
//             padding: "8px 16px",
//             borderRadius: "4px",
//             marginBottom: "16px",
//             fontWeight: "bold",
//             textAlign: "center",
//           }}
//         >
//           🎯 Movement Detected: {trackingDirection}
//         </div>
//       )}

//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         controls
//         style={{ width: "100%", backgroundColor: "#000" }}
//       />

//       <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
//         {!connected && (
//           <button onClick={initConnection}>🔌 Connect to Stream</button>
//         )}
//         <button onClick={captureImage} disabled={!connected}>
//           📸 Capture Image
//         </button>
//         {!recording ? (
//           <button onClick={startRecording} disabled={!connected}>
//             ⏺️ Start Recording
//           </button>
//         ) : (
//           <button onClick={stopRecording}>⏹️ Stop Recording</button>
//         )}
//       </div>

//       <h2 style={{ marginTop: 24 }}>📷 Captured Images</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {images.map((img, i) => (
//           <img
//             key={i}
//             src={img}
//             style={{ width: 200, border: "1px solid #ccc" }}
//             alt={`Captured ${i}`}
//           />
//         ))}
//       </div>

//       <h2 style={{ marginTop: 24 }}>🎥 Recorded Videos</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {videos.map((vid, i) => (
//           <video
//             key={i}
//             src={`/data/videos/${vid}`}
//             controls
//             style={{ width: 200, border: "1px solid #ccc" }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

//
//
//
//
//
//
//
//
//
// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const previousX = useRef(null);

//   const [recording, setRecording] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [direction, setDirection] = useState("Idle");

//   const initConnection = async () => {
//     console.log("💻 Desktop: Initializing WebRTC");

//     const pc = new RTCPeerConnection();
//     peerRef.current = pc;

//     pc.ontrack = (event) => {
//       console.log("💻 Received track");
//       videoRef.current.srcObject = event.streams[0];
//     };

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("WebSocket connected ✅");
//       setConnected(true);
//     };

//     ws.onmessage = async (msg) => {
//       const data =
//         typeof msg.data === "string" ? msg.data : await msg.data.text();
//       const parsed = JSON.parse(data);

//       if (parsed.type === "offer") {
//         console.log("📩 Offer received");
//         await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         ws.send(JSON.stringify({ type: "answer", answer }));
//       } else if (parsed.type === "candidate") {
//         console.log("📩 Candidate received");
//         await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate && ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({ type: "candidate", candidate: event.candidate })
//         );
//       }
//     };
//   };

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   const fetchMedia = async () => {
//     const imgRes = await fetch("/api/list-images");
//     const vidRes = await fetch("/api/list-videos");
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     setImages(imgData.files);
//     setVideos(vidData.files);
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, `capture_${Date.now()}.png`);
//       await fetch("/api/save-image", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     }, "image/png");
//   };

//   const startRecording = () => {
//     const stream = videoRef.current.srcObject;
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) recordedChunksRef.current.push(event.data);
//     };

//     recorder.onstop = async () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("file", blob, `recording_${Date.now()}.webm`);

//       await fetch("/api/save-video", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

//   // 🔍 Real-time tracking effect
//   useEffect(() => {
//     let net;
//     let intervalId;

//     const trackMovement = async () => {
//       if (!videoRef.current || videoRef.current.readyState < 2) return;
//       if (!net) return;

//       const segmentation = await net.segmentPerson(videoRef.current, {
//         flipHorizontal: false,
//         internalResolution: "medium",
//       });

//       const mask = bodyPix.toMask(segmentation);
//       const xCoords = [];

//       for (let y = 0; y < mask.height; y++) {
//         for (let x = 0; x < mask.width; x++) {
//           const idx = (y * mask.width + x) * 4;
//           if (mask.data[idx + 3] > 0) xCoords.push(x);
//         }
//       }

//       if (xCoords.length > 0) {
//         const currentX =
//           xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length;

//         if (previousX.current !== null) {
//           const dx = currentX - previousX.current;
//           if (dx > 10) setDirection("➡️ Moving Right");
//           else if (dx < -10) setDirection("⬅️ Moving Left");
//           else setDirection("⏹️ Centered");
//         }

//         previousX.current = currentX;
//       }
//     };

//     const loadModelAndStart = async () => {
//       net = await bodyPix.load();
//       intervalId = setInterval(trackMovement, 500);
//     };

//     loadModelAndStart();

//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, []);
//   return (
//     <div
//       style={{
//         fontFamily: "Segoe UI, system-ui, sans-serif",
//         padding: "24px",
//         backgroundColor: "#f5f7fa",
//         minHeight: "100vh",
//         color: "#1a1a1a",
//       }}
//     >
//       {/* Header */}
//       <header style={{ textAlign: "center", marginBottom: "24px" }}>
//         <h1 style={{ fontSize: "2.5rem", margin: "0", color: "#2c3e50" }}>
//           💻 Desktop Viewer
//         </h1>
//         <p style={{ color: "#7f8c8d", fontSize: "1.1rem" }}>
//           Real-time stream with movement tracking & media capture
//         </p>
//       </header>

//       {/* Main Content Grid */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "1fr 300px",
//           gap: "24px",
//           maxWidth: "1200px",
//           margin: "0 auto",
//         }}
//       >
//         {/* Left Side: Video & Controls */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//           {/* Video */}
//           <div
//             style={{
//               borderRadius: "12px",
//               overflow: "hidden",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//               backgroundColor: "#000",
//             }}
//           >
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               muted
//               style={{
//                 width: "100%",
//                 height: "auto",
//                 display: "block",
//               }}
//             />
//           </div>

//           {/* Status Badge */}
//           <div
//             style={{
//               padding: "10px 16px",
//               backgroundColor: connected ? "#d4edda" : "#f8d7da",
//               color: connected ? "#155724" : "#721c24",
//               borderRadius: "8px",
//               fontSize: "0.95rem",
//               textAlign: "center",
//               fontWeight: "500",
//             }}
//           >
//             {connected ? "🟢 Connected to Stream" : "🔴 Not Connected"}
//           </div>

//           {/* Action Buttons */}
//           <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
//             {!connected && (
//               <button
//                 onClick={initConnection}
//                 style={{
//                   flex: 1,
//                   padding: "12px 16px",
//                   backgroundColor: "#007bff",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   fontSize: "1rem",
//                   cursor: "pointer",
//                   fontWeight: "600",
//                 }}
//                 onMouseOver={(e) =>
//                   (e.target.style.backgroundColor = "#0056b3")
//                 }
//                 onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
//               >
//                 🔌 Connect to Stream
//               </button>
//             )}
//             <button
//               onClick={captureImage}
//               disabled={!connected}
//               style={{
//                 flex: 1,
//                 padding: "12px 16px",
//                 backgroundColor: !connected ? "#e9ecef" : "#28a745",
//                 color: !connected ? "#6c757d" : "white",
//                 border: "none",
//                 borderRadius: "8px",
//                 fontSize: "1rem",
//                 cursor: !connected ? "not-allowed" : "pointer",
//                 fontWeight: "600",
//               }}
//             >
//               📸 Capture Image
//             </button>
//             {!recording ? (
//               <button
//                 onClick={startRecording}
//                 disabled={!connected}
//                 style={{
//                   flex: 1,
//                   padding: "12px 16px",
//                   backgroundColor: !connected ? "#e9ecef" : "#ffc107",
//                   color: !connected ? "#6c757d" : "#212529",
//                   border: "none",
//                   borderRadius: "8px",
//                   fontSize: "1rem",
//                   cursor: !connected ? "not-allowed" : "pointer",
//                   fontWeight: "600",
//                 }}
//               >
//                 ⏺️ Start Recording
//               </button>
//             ) : (
//               <button
//                 onClick={stopRecording}
//                 style={{
//                   flex: 1,
//                   padding: "12px 16px",
//                   backgroundColor: "#dc3545",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   fontSize: "1rem",
//                   cursor: "pointer",
//                   fontWeight: "600",
//                 }}
//               >
//                 ⏹️ Stop Recording
//               </button>
//             )}
//           </div>

//           {/* Movement Direction Indicator */}
//           <div
//             style={{
//               padding: "14px",
//               backgroundColor: "#fff",
//               borderRadius: "8px",
//               boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
//               textAlign: "center",
//               fontWeight: "bold",
//               color: direction.includes("Right")
//                 ? "#007bff"
//                 : direction.includes("Left")
//                 ? "#e74c3c"
//                 : "#27ae60",
//               fontSize: "1.1rem",
//             }}
//           >
//             🧭 Movement: <span style={{ color: "#2c3e50" }}>{direction}</span>
//           </div>

//           {/* 4-Way Arrow Controller */}
//           <div style={{ marginTop: "24px" }}>
//             <h3
//               style={{
//                 marginBottom: "12px",
//                 textAlign: "center",
//                 color: "#2c3e50",
//               }}
//             >
//               🕹️ Manual Control
//             </h3>
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(3, 1fr)",
//                 gridTemplateRows: "repeat(3, 1fr)",
//                 gap: "8px",
//                 width: "180px",
//                 height: "180px",
//                 margin: "0 auto",
//               }}
//             >
//               {/* Up */}
//               <button
//                 onClick={() => alert("Up")}
//                 style={{
//                   gridRow: 1,
//                   gridColumn: 2,
//                   backgroundColor: "#007bff",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   fontSize: "1.5rem",
//                   cursor: "pointer",
//                 }}
//               >
//                 ▲
//               </button>
//               {/* Left */}
//               <button
//                 onClick={() => alert("Left")}
//                 style={{
//                   gridRow: 2,
//                   gridColumn: 1,
//                   backgroundColor: "#007bff",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   fontSize: "1.5rem",
//                   cursor: "pointer",
//                 }}
//               >
//                 ◀
//               </button>
//               {/* Center (Stop/Idle) */}
//               <button
//                 onClick={() => alert("Stop")}
//                 style={{
//                   gridRow: 2,
//                   gridColumn: 2,
//                   backgroundColor: "#95a5a6",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   fontSize: "1rem",
//                   cursor: "pointer",
//                 }}
//               >
//                 ⏹️
//               </button>
//               {/* Right */}
//               <button
//                 onClick={() => alert("Right")}
//                 style={{
//                   gridRow: 2,
//                   gridColumn: 3,
//                   backgroundColor: "#007bff",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   fontSize: "1.5rem",
//                   cursor: "pointer",
//                 }}
//               >
//                 ▶
//               </button>
//               {/* Down */}
//               <button
//                 onClick={() => alert("Down")}
//                 style={{
//                   gridRow: 3,
//                   gridColumn: 2,
//                   backgroundColor: "#007bff",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   fontSize: "1.5rem",
//                   cursor: "pointer",
//                 }}
//               >
//                 ▼
//               </button>
//             </div>
//             <p
//               style={{
//                 textAlign: "center",
//                 fontSize: "0.9rem",
//                 color: "#7f8c8d",
//                 marginTop: "8px",
//               }}
//             >
//               Use arrows to control remote device
//             </p>
//           </div>
//         </div>

//         {/* Right Side: Media Gallery */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
//           {/* Images */}
//           <div>
//             <h2
//               style={{
//                 fontSize: "1.4rem",
//                 marginBottom: "12px",
//                 color: "#2c3e50",
//                 borderBottom: "2px solid #007bff",
//                 paddingBottom: "6px",
//               }}
//             >
//               📷 Captured Images
//             </h2>
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
//                 gap: "10px",
//                 maxHeight: "300px",
//                 overflowY: "auto",
//                 padding: "4px",
//                 border: "1px solid #e0e0e0",
//                 borderRadius: "8px",
//                 backgroundColor: "#fff",
//               }}
//             >
//               {images.length > 0 ? (
//                 images.map((img, i) => (
//                   <img
//                     key={i}
//                     src={img}
//                     alt={`Captured ${i}`}
//                     style={{
//                       width: "100%",
//                       height: "100px",
//                       objectFit: "cover",
//                       borderRadius: "6px",
//                       border: "1px solid #ddd",
//                     }}
//                   />
//                 ))
//               ) : (
//                 <p
//                   style={{
//                     fontSize: "0.9rem",
//                     color: "#7f8c8d",
//                     gridColumn: "1/-1",
//                   }}
//                 >
//                   No images yet
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Videos */}
//           <div>
//             <h2
//               style={{
//                 fontSize: "1.4rem",
//                 marginBottom: "12px",
//                 color: "#2c3e50",
//                 borderBottom: "2px solid #28a745",
//                 paddingBottom: "6px",
//               }}
//             >
//               🎥 Recorded Videos
//             </h2>
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
//                 gap: "10px",
//                 maxHeight: "300px",
//                 overflowY: "auto",
//                 padding: "4px",
//                 border: "1px solid #e0e0e0",
//                 borderRadius: "8px",
//                 backgroundColor: "#fff",
//               }}
//             >
//               {videos.length > 0 ? (
//                 videos.map((vid, i) => (
//                   <video
//                     key={i}
//                     src={`/data/videos/${vid}`}
//                     controls
//                     style={{
//                       width: "100%",
//                       height: "120px",
//                       objectFit: "cover",
//                       borderRadius: "6px",
//                       border: "1px solid #ddd",
//                     }}
//                   />
//                 ))
//               ) : (
//                 <p
//                   style={{
//                     fontSize: "0.9rem",
//                     color: "#7f8c8d",
//                     gridColumn: "1/-1",
//                   }}
//                 >
//                   No videos yet
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
//   return (
//     <div>
//       <h1>💻 Desktop Viewer</h1>
//       <h2>🧭 Movement: {direction}</h2>

//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         controls
//         style={{ width: "100%", backgroundColor: "#000" }}
//       />

//       <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
//         {!connected && (
//           <button onClick={initConnection}>🔌 Connect to Stream</button>
//         )}
//         <button onClick={captureImage} disabled={!connected}>
//           📸 Capture Image
//         </button>
//         {!recording ? (
//           <button onClick={startRecording} disabled={!connected}>
//             ⏺️ Start Recording
//           </button>
//         ) : (
//           <button onClick={stopRecording}>⏹️ Stop Recording</button>
//         )}
//       </div>

//       <h2 style={{ marginTop: 24 }}>📷 Captured Images</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {images.map((img, i) => (
//           <img
//             key={i}
//             src={img}
//             style={{ width: 200, border: "1px solid #ccc" }}
//             alt={`Captured ${i}`}
//           />
//         ))}
//       </div>

//       <h2 style={{ marginTop: 24 }}>🎥 Recorded Videos</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {videos.map((vid, i) => (
//           <video
//             key={i}
//             src={`/data/videos/${vid}`}
//             controls
//             style={{ width: 200, border: "1px solid #ccc" }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

//
//
//
//
//current one
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const previousX = useRef(null);

//   const [recording, setRecording] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [direction, setDirection] = useState("Idle");

//   const initConnection = async () => {
//     console.log("💻 Desktop: Initializing WebRTC");

//     const pc = new RTCPeerConnection();
//     peerRef.current = pc;

//     pc.ontrack = (event) => {
//       console.log("💻 Received track");
//       videoRef.current.srcObject = event.streams[0];
//     };

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("WebSocket connected ✅");
//       setConnected(true);
//     };

//     ws.onmessage = async (msg) => {
//       const data =
//         typeof msg.data === "string" ? msg.data : await msg.data.text();
//       const parsed = JSON.parse(data);

//       if (parsed.type === "offer") {
//         console.log("📩 Offer received");
//         await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         ws.send(JSON.stringify({ type: "answer", answer }));
//       } else if (parsed.type === "candidate") {
//         console.log("📩 Candidate received");
//         await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate && ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({ type: "candidate", candidate: event.candidate })
//         );
//       }
//     };
//   };

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   const fetchMedia = async () => {
//     const imgRes = await fetch("/api/list-images");
//     const vidRes = await fetch("/api/list-videos");
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     setImages(imgData.files);
//     setVideos(vidData.files);
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, `capture_${Date.now()}.png`);
//       await fetch("/api/save-image", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     }, "image/png");
//   };

//   const startRecording = () => {
//     const stream = videoRef.current.srcObject;
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) recordedChunksRef.current.push(event.data);
//     };

//     recorder.onstop = async () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("file", blob, `recording_${Date.now()}.webm`);

//       await fetch("/api/save-video", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

//   // 🔍 Real-time tracking effect
//   useEffect(() => {
//     let net;
//     let intervalId;

//     const trackMovement = async () => {
//       if (!videoRef.current || videoRef.current.readyState < 2) return;
//       if (!net) return;

//       const segmentation = await net.segmentPerson(videoRef.current, {
//         flipHorizontal: false,
//         internalResolution: "medium",
//       });

//       const mask = bodyPix.toMask(segmentation);
//       const xCoords = [];

//       for (let y = 0; y < mask.height; y++) {
//         for (let x = 0; x < mask.width; x++) {
//           const idx = (y * mask.width + x) * 4;
//           if (mask.data[idx + 3] > 0) xCoords.push(x);
//         }
//       }

//       if (xCoords.length > 0) {
//         const currentX =
//           xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length;

//         if (previousX.current !== null) {
//           const dx = currentX - previousX.current;
//           if (dx > 10) setDirection("➡️ Moving Right");
//           else if (dx < -10) setDirection("⬅️ Moving Left");
//           else setDirection("⏹️ Centered");
//         }

//         previousX.current = currentX;
//       }
//     };

//     const loadModelAndStart = async () => {
//       net = await bodyPix.load();
//       intervalId = setInterval(trackMovement, 500);
//     };

//     loadModelAndStart();

//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 font-sans text-slate-800">
//       {/* Header */}
//       <header className="text-center mb-8">
//         <h1 className="text-3xl md:text-4xl font-bold text-slate-700">
//           💻 Desktop Viewer
//         </h1>
//         <p className="text-slate-500 mt-2">
//           Real-time stream with AI tracking & media capture
//         </p>
//       </header>

//       {/* Main Grid: Video + Controls (Left), Media (Right) */}
//       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column: Video, Controls, Controller */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Video */}
//           <div className="bg-black rounded-xl overflow-hidden shadow-xl">
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               muted
//               className="w-full h-auto"
//             />
//           </div>

//           {/* Connection Status */}
//           <div
//             className={`text-center py-3 rounded-lg font-medium ${
//               connected
//                 ? "bg-green-100 text-green-800"
//                 : "bg-red-100 text-red-800"
//             }`}
//           >
//             {connected ? "🟢 Connected to Stream" : "🔴 Not Connected"}
//           </div>

//           {/* Action Buttons */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//             {!connected && (
//               <button
//                 onClick={initConnection}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
//               >
//                 🔌 Connect
//               </button>
//             )}
//             <button
//               onClick={captureImage}
//               disabled={!connected}
//               className={`font-semibold py-3 rounded-lg transition ${
//                 connected
//                   ? "bg-emerald-600 hover:bg-emerald-700 text-white"
//                   : "bg-gray-200 text-gray-400 cursor-not-allowed"
//               }`}
//             >
//               📸 Capture
//             </button>
//             {!recording ? (
//               <button
//                 onClick={startRecording}
//                 disabled={!connected}
//                 className={`font-semibold py-3 rounded-lg transition ${
//                   connected
//                     ? "bg-amber-500 hover:bg-amber-600 text-white"
//                     : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                 }`}
//               >
//                 ⏺️ Record
//               </button>
//             ) : (
//               <button
//                 onClick={stopRecording}
//                 className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
//               >
//                 ⏹️ Stop
//               </button>
//             )}
//           </div>

//           {/* Movement Direction */}
//           <div className="bg-white p-4 rounded-lg shadow text-center font-bold text-lg border border-slate-200">
//             🧭 Movement:{" "}
//             <span
//               className={
//                 direction.includes("Right")
//                   ? "text-blue-600"
//                   : direction.includes("Left")
//                   ? "text-red-600"
//                   : "text-green-600"
//               }
//             >
//               {direction}
//             </span>
//           </div>

//           {/* 4-Way Arrow Controller */}
//           <div className="bg-white p-6 rounded-xl shadow text-center">
//             <h3 className="text-lg font-semibold mb-4 text-slate-700">
//               🕹️ Manual Control
//             </h3>
//             <div className="grid grid-cols-3 gap-2 w-40 h-40 mx-auto">
//               {/* Up */}
//               <div></div>
//               <button
//                 onClick={() => alert("Up")}
//                 className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg transition flex items-center justify-center"
//               >
//                 ▲
//               </button>
//               <div></div>

//               {/* Left */}
//               <button
//                 onClick={() => alert("Left")}
//                 className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg transition flex items-center justify-center"
//               >
//                 ◀
//               </button>
//               {/* Center (Stop) */}
//               <button
//                 onClick={() => alert("Stop")}
//                 className="bg-gray-500 hover:bg-gray-600 text-white text-lg rounded-lg transition"
//               >
//                 ⏹️
//               </button>
//               {/* Right */}
//               <button
//                 onClick={() => alert("Right")}
//                 className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg transition flex items-center justify-center"
//               >
//                 ▶
//               </button>

//               {/* Down */}
//               <div></div>
//               <button
//                 onClick={() => alert("Down")}
//                 className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg transition flex items-center justify-center"
//               >
//                 ▼
//               </button>
//               <div></div>
//             </div>
//             <p className="text-sm text-slate-500 mt-3">Control remote device</p>
//           </div>
//         </div>

//         {/* Right Column: Media Gallery */}
//         <div className="space-y-8">
//           {/* Images */}
//           <div>
//             <h2 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
//               📷 Captured Images
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 max-h-64 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
//               {images.length > 0 ? (
//                 images.map((img, i) => (
//                   <img
//                     key={i}
//                     src={img}
//                     alt={`Captured ${i}`}
//                     className="w-full h-20 object-cover rounded-md border"
//                   />
//                 ))
//               ) : (
//                 <p className="text-sm text-slate-400 col-span-2 text-center py-4">
//                   No images yet
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Videos */}
//           <div>
//             <h2 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
//               🎥 Recorded Videos
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 max-h-64 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
//               {videos.length > 0 ? (
//                 videos.map((vid, i) => (
//                   <video
//                     key={i}
//                     src={`/data/videos/${vid}`}
//                     controls
//                     className="w-full h-24 object-cover rounded-md border"
//                   />
//                 ))
//               ) : (
//                 <p className="text-sm text-slate-400 col-span-2 text-center py-4">
//                   No videos yet
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const previousX = useRef(null);

//   const [recording, setRecording] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [direction, setDirection] = useState("Idle");

//   const initConnection = async () => {
//     console.log("💻 Desktop: Initializing WebRTC");

//     const pc = new RTCPeerConnection();
//     peerRef.current = pc;

//     pc.ontrack = (event) => {
//       console.log("💻 Received track");
//       videoRef.current.srcObject = event.streams[0];
//     };

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("WebSocket connected ✅");
//       setConnected(true);
//     };

//     ws.onmessage = async (msg) => {
//       const data =
//         typeof msg.data === "string" ? msg.data : await msg.data.text();
//       const parsed = JSON.parse(data);

//       if (parsed.type === "offer") {
//         console.log("📩 Offer received");
//         await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         ws.send(JSON.stringify({ type: "answer", answer }));
//       } else if (parsed.type === "candidate") {
//         console.log("📩 Candidate received");
//         await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate && ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({ type: "candidate", candidate: event.candidate })
//         );
//       }
//     };
//   };

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   const fetchMedia = async () => {
//     const imgRes = await fetch("/api/list-images");
//     const vidRes = await fetch("/api/list-videos");
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     setImages(imgData.files);
//     setVideos(vidData.files);
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, `capture_${Date.now()}.png`);
//       await fetch("/api/save-image", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     }, "image/png");
//   };

//   const startRecording = () => {
//     const stream = videoRef.current.srcObject;
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) recordedChunksRef.current.push(event.data);
//     };

//     recorder.onstop = async () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("file", blob, `recording_${Date.now()}.webm`);

//       await fetch("/api/save-video", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

//   // 🔍 Real-time tracking with bounding box
//   useEffect(() => {
//     let net;
//     let intervalId;

//     const trackMovement = async () => {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       if (!video || video.readyState < 2 || !canvas || !net) return;

//       // Set canvas resolution
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       const segmentation = await net.segmentPerson(video, {
//         flipHorizontal: false,
//         internalResolution: "medium",
//       });

//       const mask = bodyPix.toMask(segmentation);
//       const xCoords = [];
//       const yCoords = [];

//       for (let y = 0; y < mask.height; y++) {
//         for (let x = 0; x < mask.width; x++) {
//           const idx = (y * mask.width + x) * 4;
//           if (mask.data[idx + 3] > 0) {
//             xCoords.push(x);
//             yCoords.push(y);
//           }
//         }
//       }

//       if (xCoords.length > 0 && yCoords.length > 0) {
//         const currentX =
//           xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length;

//         if (previousX.current !== null) {
//           const dx = currentX - previousX.current;
//           if (dx > 10) setDirection("➡️ Moving Right");
//           else if (dx < -10) setDirection("⬅️ Moving Left");
//           else setDirection("⏹️ Centered");
//         }

//         previousX.current = currentX;

//         // Bounding box
//         const minX = Math.min(...xCoords);
//         const maxX = Math.max(...xCoords);
//         const minY = Math.min(...yCoords);
//         const maxY = Math.max(...yCoords);

//         const ctx = canvas.getContext("2d");
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         const scaleX = canvas.width / mask.width;
//         const scaleY = canvas.height / mask.height;

//         ctx.strokeStyle = "lime";
//         ctx.lineWidth = 3;
//         ctx.strokeRect(
//           minX * scaleX,
//           minY * scaleY,
//           (maxX - minX) * scaleX,
//           (maxY - minY) * scaleY
//         );
//       }
//     };

//     const loadModelAndStart = async () => {
//       net = await bodyPix.load();
//       intervalId = setInterval(trackMovement, 500);
//     };

//     loadModelAndStart();

//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, []);

//   return (
//     <div>
//       <h1>💻 Desktop Viewer</h1>
//       <h2>🧭 Movement: {direction}</h2>

//       <div style={{ position: "relative", width: "100%" }}>
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           controls
//           style={{ width: "100%", backgroundColor: "#000" }}
//         />
//         <canvas
//           ref={canvasRef}
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             pointerEvents: "none",
//           }}
//         />
//       </div>

//       <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
//         {!connected && (
//           <button onClick={initConnection}>🔌 Connect to Stream</button>
//         )}
//         <button onClick={captureImage} disabled={!connected}>
//           📸 Capture Image
//         </button>
//         {!recording ? (
//           <button onClick={startRecording} disabled={!connected}>
//             ⏺️ Start Recording
//           </button>
//         ) : (
//           <button onClick={stopRecording}>⏹️ Stop Recording</button>
//         )}
//       </div>

//       <h2 style={{ marginTop: 24 }}>📷 Captured Images</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {images.map((img, i) => (
//           <img
//             key={i}
//             src={img}
//             style={{ width: 200, border: "1px solid #ccc" }}
//             alt={`Captured ${i}`}
//           />
//         ))}
//       </div>

//       <h2 style={{ marginTop: 24 }}>🎥 Recorded Videos</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {videos.map((vid, i) => (
//           <video
//             key={i}
//             src={`/data/videos/${vid}`}
//             controls
//             style={{ width: 200, border: "1px solid #ccc" }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const previousX = useRef(null);

//   const [recording, setRecording] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [direction, setDirection] = useState("Idle");

//   const initConnection = async () => {
//     console.log("💻 Desktop: Initializing WebRTC");

//     const pc = new RTCPeerConnection();
//     peerRef.current = pc;

//     pc.ontrack = (event) => {
//       console.log("💻 Received track");
//       videoRef.current.srcObject = event.streams[0];
//     };

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("WebSocket connected ✅");
//       setConnected(true);
//     };

//     ws.onmessage = async (msg) => {
//       const data =
//         typeof msg.data === "string" ? msg.data : await msg.data.text();
//       const parsed = JSON.parse(data);

//       if (parsed.type === "offer") {
//         console.log("📩 Offer received");
//         await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         ws.send(JSON.stringify({ type: "answer", answer }));
//       } else if (parsed.type === "candidate") {
//         console.log("📩 Candidate received");
//         await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate && ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({ type: "candidate", candidate: event.candidate })
//         );
//       }
//     };
//   };

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   const fetchMedia = async () => {
//     const imgRes = await fetch("/api/list-images");
//     const vidRes = await fetch("/api/list-videos");
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     setImages(imgData.files);
//     setVideos(vidData.files);
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, `capture_${Date.now()}.png`);
//       await fetch("/api/save-image", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     }, "image/png");
//   };

//   const startRecording = () => {
//     const stream = videoRef.current.srcObject;
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) recordedChunksRef.current.push(event.data);
//     };

//     recorder.onstop = async () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("file", blob, `recording_${Date.now()}.webm`);

//       await fetch("/api/save-video", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

//   // 🔍 Real-time tracking with bounding box - FIXED: Added empty dependency array
//   useEffect(() => {
//     let net;
//     let intervalId;

//     const trackMovement = async () => {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       if (!video || video.readyState < 2 || !canvas || !net) return;

//       // Set canvas resolution
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       const segmentation = await net.segmentPerson(video, {
//         flipHorizontal: false,
//         internalResolution: "medium",
//       });

//       const mask = bodyPix.toMask(segmentation);
//       const xCoords = [];
//       const yCoords = [];

//       for (let y = 0; y < mask.height; y++) {
//         for (let x = 0; x < mask.width; x++) {
//           const idx = (y * mask.width + x) * 4;
//           if (mask.data[idx + 3] > 0) {
//             xCoords.push(x);
//             yCoords.push(y);
//           }
//         }
//       }

//       if (xCoords.length > 0 && yCoords.length > 0) {
//         const currentX =
//           xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length;

//         if (previousX.current !== null) {
//           const dx = currentX - previousX.current;
//           if (dx > 10) setDirection("➡️ Moving Right");
//           else if (dx < -10) setDirection("⬅️ Moving Left");
//           else setDirection("⏹️ Centered");
//         }

//         previousX.current = currentX;

//         // Bounding box
//         const minX = Math.min(...xCoords);
//         const maxX = Math.max(...xCoords);
//         const minY = Math.min(...yCoords);
//         const maxY = Math.max(...yCoords);

//         const ctx = canvas.getContext("2d");
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         const scaleX = canvas.width / mask.width;
//         const scaleY = canvas.height / mask.height;

//         ctx.strokeStyle = "lime";
//         ctx.lineWidth = 3;
//         ctx.strokeRect(
//           minX * scaleX,
//           minY * scaleY,
//           (maxX - minX) * scaleX,
//           (maxY - minY) * scaleY
//         );
//       }
//     };

//     const loadModelAndStart = async () => {
//       net = await bodyPix.load();
//       intervalId = setInterval(trackMovement, 500);
//     };

//     loadModelAndStart();

//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, []); // ← CRITICAL FIX: Added empty dependency array here

//   return (
//     <div>
//       <h1>💻 Desktop Viewer</h1>
//       <h2>🧭 Movement: {direction}</h2>

//       <div style={{ position: "relative", width: "100%" }}>
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           controls
//           style={{ width: "100%", backgroundColor: "#000" }}
//         />
//         <canvas
//           ref={canvasRef}
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             pointerEvents: "none",
//           }}
//         />
//       </div>

//       <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
//         {!connected && (
//           <button onClick={initConnection}>🔌 Connect to Stream</button>
//         )}
//         <button onClick={captureImage} disabled={!connected}>
//           📸 Capture Image
//         </button>
//         {!recording ? (
//           <button onClick={startRecording} disabled={!connected}>
//             ⏺️ Start Recording
//           </button>
//         ) : (
//           <button onClick={stopRecording}>⏹️ Stop Recording</button>
//         )}
//       </div>

//       <h2 style={{ marginTop: 24 }}>📷 Captured Images</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {images.map((img, i) => (
//           <img
//             key={i}
//             src={img}
//             style={{ width: 200, border: "1px solid #ccc" }}
//             alt={`Captured ${i}`}
//           />
//         ))}
//       </div>

//       <h2 style={{ marginTop: 24 }}>🎥 Recorded Videos</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {videos.map((vid, i) => (
//           <video
//             key={i}
//             src={`/data/videos/${vid}`}
//             controls
//             style={{ width: 200, border: "1px solid #ccc" }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const previousX = useRef(null);

//   const [recording, setRecording] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [direction, setDirection] = useState("Idle");

//   const initConnection = async () => {
//     console.log("💻 Desktop: Initializing WebRTC");

//     const pc = new RTCPeerConnection();
//     peerRef.current = pc;

//     pc.ontrack = (event) => {
//       console.log("💻 Received track");
//       videoRef.current.srcObject = event.streams[0];
//     };

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("WebSocket connected ✅");
//       setConnected(true);
//     };

//     ws.onmessage = async (msg) => {
//       const data =
//         typeof msg.data === "string" ? msg.data : await msg.data.text();
//       const parsed = JSON.parse(data);

//       if (parsed.type === "offer") {
//         console.log("📩 Offer received");
//         await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         ws.send(JSON.stringify({ type: "answer", answer }));
//       } else if (parsed.type === "candidate") {
//         console.log("📩 Candidate received");
//         await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate && ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({ type: "candidate", candidate: event.candidate })
//         );
//       }
//     };
//   };

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   const fetchMedia = async () => {
//     const imgRes = await fetch("/api/list-images");
//     const vidRes = await fetch("/api/list-videos");
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     setImages(imgData.files);
//     setVideos(vidData.files);
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, `capture_${Date.now()}.png`);
//       await fetch("/api/save-image", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     }, "image/png");
//   };

//   const startRecording = () => {
//     const stream = videoRef.current.srcObject;
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) recordedChunksRef.current.push(event.data);
//     };

//     recorder.onstop = async () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("file", blob, `recording_${Date.now()}.webm`);

//       await fetch("/api/save-video", {
//         method: "POST",
//         body: formData,
//       });
//       fetchMedia();
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

//   // 🔍 Real-time tracking with bounding box - FIXED: Added empty dependency array
//   useEffect(() => {
//     let net;
//     let intervalId;

//     const trackMovement = async () => {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       if (!video || video.readyState < 2 || !canvas || !net) return;

//       // Set canvas resolution
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       const segmentation = await net.segmentPerson(video, {
//         flipHorizontal: false,
//         internalResolution: "high", // Higher resolution for better distant detection
//         segmentationThreshold: 0.5, // Lower threshold for better sensitivity
//         maxDetections: 1, // Focus on single person
//         scoreThreshold: 0.3, // Lower score threshold for distant detection
//         nmsRadius: 20,
//       });

//       // Enhanced mask processing for better body detection
//       const mask = bodyPix.toMask(segmentation);
//       const xCoords = [];
//       const yCoords = [];

//       // More aggressive pixel detection with lower alpha threshold
//       for (let y = 0; y < mask.height; y++) {
//         for (let x = 0; x < mask.width; x++) {
//           const idx = (y * mask.width + x) * 4;
//           // Lower threshold for detecting faint body parts
//           if (mask.data[idx + 3] > 50) {
//             // Reduced from previous implicit 255
//             xCoords.push(x);
//             yCoords.push(y);
//           }
//         }
//       }

//       // Only proceed if we have a reasonable number of pixels (full body should have more pixels)
//       if (xCoords.length > 50 && yCoords.length > 50) {
//         const currentX =
//           xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length;

//         if (previousX.current !== null) {
//           const dx = currentX - previousX.current;
//           if (dx > 10) setDirection("➡️ Moving Right");
//           else if (dx < -10) setDirection("⬅️ Moving Left");
//           else setDirection("⏹️ Centered");
//         }

//         previousX.current = currentX;

//         // Enhanced bounding box with padding for better visibility
//         const minX = Math.min(...xCoords);
//         const maxX = Math.max(...xCoords);
//         const minY = Math.min(...yCoords);
//         const maxY = Math.max(...yCoords);

//         const ctx = canvas.getContext("2d");
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         const scaleX = canvas.width / mask.width;
//         const scaleY = canvas.height / mask.height;

//         // Add some padding to the bounding box
//         const padding = 10;
//         const boundingX = Math.max(0, minX * scaleX - padding);
//         const boundingY = Math.max(0, minY * scaleY - padding);
//         const boundingWidth = Math.min(
//           canvas.width - boundingX,
//           (maxX - minX) * scaleX + padding * 2
//         );
//         const boundingHeight = Math.min(
//           canvas.height - boundingY,
//           (maxY - minY) * scaleY + padding * 2
//         );

//         // Enhanced visual styling
//         ctx.strokeStyle = "lime";
//         ctx.lineWidth = 3;
//         ctx.setLineDash([5, 5]); // Dashed line for better visibility
//         ctx.strokeRect(boundingX, boundingY, boundingWidth, boundingHeight);

//         // Add corner markers for better visibility
//         const cornerSize = 20;
//         ctx.setLineDash([]); // Solid lines for corners
//         ctx.lineWidth = 4;

//         // Top-left corner
//         ctx.beginPath();
//         ctx.moveTo(boundingX, boundingY + cornerSize);
//         ctx.lineTo(boundingX, boundingY);
//         ctx.lineTo(boundingX + cornerSize, boundingY);
//         ctx.stroke();

//         // Top-right corner
//         ctx.beginPath();
//         ctx.moveTo(boundingX + boundingWidth - cornerSize, boundingY);
//         ctx.lineTo(boundingX + boundingWidth, boundingY);
//         ctx.lineTo(boundingX + boundingWidth, boundingY + cornerSize);
//         ctx.stroke();

//         // Bottom-left corner
//         ctx.beginPath();
//         ctx.moveTo(boundingX, boundingY + boundingHeight - cornerSize);
//         ctx.lineTo(boundingX, boundingY + boundingHeight);
//         ctx.lineTo(boundingX + cornerSize, boundingY + boundingHeight);
//         ctx.stroke();

//         // Bottom-right corner
//         ctx.beginPath();
//         ctx.moveTo(
//           boundingX + boundingWidth - cornerSize,
//           boundingY + boundingHeight
//         );
//         ctx.lineTo(boundingX + boundingWidth, boundingY + boundingHeight);
//         ctx.lineTo(
//           boundingX + boundingWidth,
//           boundingY + boundingHeight - cornerSize
//         );
//         ctx.stroke();
//       } else {
//         // Clear canvas if no person detected
//         const ctx = canvas.getContext("2d");
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         setDirection("❌ No Person Detected");
//       }
//     };

//     const loadModelAndStart = async () => {
//       // Load with higher accuracy model for better distant detection
//       net = await bodyPix.load({
//         architecture: "MobileNetV1",
//         outputStride: 16, // Lower output stride for better precision
//         multiplier: 1.0, // Higher multiplier for better accuracy
//         quantBytes: 4, // Higher precision
//       });
//       intervalId = setInterval(trackMovement, 300); // Faster detection
//     };

//     loadModelAndStart();

//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, []); // ← CRITICAL FIX: Added empty dependency array here

//   return (
//     <div>
//       <h1>💻 Desktop Viewer</h1>
//       <h2>🧭 Movement: {direction}</h2>

//       <div style={{ position: "relative", width: "100%" }}>
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           controls
//           style={{ width: "100%", backgroundColor: "#000" }}
//         />
//         <canvas
//           ref={canvasRef}
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             pointerEvents: "none",
//           }}
//         />
//       </div>

//       <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
//         {!connected && (
//           <button onClick={initConnection}>🔌 Connect to Stream</button>
//         )}
//         <button onClick={captureImage} disabled={!connected}>
//           📸 Capture Image
//         </button>
//         {!recording ? (
//           <button onClick={startRecording} disabled={!connected}>
//             ⏺️ Start Recording
//           </button>
//         ) : (
//           <button onClick={stopRecording}>⏹️ Stop Recording</button>
//         )}
//       </div>

//       <h2 style={{ marginTop: 24 }}>📷 Captured Images</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {images.map((img, i) => (
//           <img
//             key={i}
//             src={img}
//             style={{ width: 200, border: "1px solid #ccc" }}
//             alt={`Captured ${i}`}
//           />
//         ))}
//       </div>

//       <h2 style={{ marginTop: 24 }}>🎥 Recorded Videos</h2>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
//         {videos.map((vid, i) => (
//           <video
//             key={i}
//             src={`/data/videos/${vid}`}
//             controls
//             style={{ width: 200, border: "1px solid #ccc" }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const previousX = useRef(null);

//   const [recording, setRecording] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [direction, setDirection] = useState("Idle");
//   const [stabilizationActive, setStabilizationActive] = useState(false);
//   const [obstacleSignals, setObstacleSignals] = useState({
//     front: false,
//     back: false,
//     left: false,
//     right: false,
//   });
//   const [panValue, setPanValue] = useState(90);
//   const [tiltValue, setTiltValue] = useState(90);

//   // WebSocket & Peer Connection
//   const initConnection = async () => {
//     const pc = new RTCPeerConnection();
//     peerRef.current = pc;

//     pc.ontrack = (event) => {
//       videoRef.current.srcObject = event.streams[0];
//     };

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     wsRef.current = ws;

//     ws.onopen = () => setConnected(true);

//     ws.onmessage = async (msg) => {
//       const data =
//         typeof msg.data === "string" ? msg.data : await msg.data.text();
//       const parsed = JSON.parse(data);

//       if (parsed.type === "offer") {
//         await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         ws.send(JSON.stringify({ type: "answer", answer }));
//       } else if (parsed.type === "candidate") {
//         await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate && ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({ type: "candidate", candidate: event.candidate })
//         );
//       }
//     };
//   };

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   const fetchMedia = async () => {
//     const imgRes = await fetch("/api/list-images");
//     const vidRes = await fetch("/api/list-videos");
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     setImages(imgData.files);
//     setVideos(vidData.files);
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, `capture_${Date.now()}.png`);
//       await fetch("/api/save-image", { method: "POST", body: formData });
//       fetchMedia();
//     }, "image/png");
//   };

//   const startRecording = () => {
//     const stream = videoRef.current.srcObject;
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (e) =>
//       e.data.size > 0 && recordedChunksRef.current.push(e.data);
//     recorder.onstop = async () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("file", blob, `recording_${Date.now()}.webm`);
//       await fetch("/api/save-video", { method: "POST", body: formData });
//       fetchMedia();
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current?.stop();
//     setRecording(false);
//   };

//   // BodyPix tracking
//   useEffect(() => {
//     let net, intervalId;
//     const trackMovement = async () => {
//       if (!videoRef.current || videoRef.current.readyState < 2 || !net) return;
//       const segmentation = await net.segmentPerson(videoRef.current);
//       const mask = bodyPix.toMask(segmentation);
//       const xCoords = [];
//       for (let y = 0; y < mask.height; y++) {
//         for (let x = 0; x < mask.width; x++) {
//           if (mask.data[(y * mask.width + x) * 4 + 3] > 0) xCoords.push(x);
//         }
//       }
//       if (xCoords.length > 0) {
//         const currentX = xCoords.reduce((a, b) => a + b) / xCoords.length;
//         if (previousX.current !== null) {
//           const dx = currentX - previousX.current;
//           setDirection(
//             dx > 10 ? "➡️ Right" : dx < -10 ? "⬅️ Left" : "⏹️ Centered"
//           );
//         }
//         previousX.current = currentX;
//       }
//     };

//     const load = async () => {
//       net = await bodyPix.load();
//       intervalId = setInterval(trackMovement, 500);
//     };
//     load();

//     return () => clearInterval(intervalId);
//   }, []);

//   return (
//     <div className="min-h-screen bg-slate-50 px-3 py-6 font-sans text-slate-800">
//       {/* Main Container - Stacked for Mobile */}
//       <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
//         {/* Header */}
//         <div className="bg-blue-600 text-white p-4 text-center">
//           <h1 className="text-xl font-bold">📹 Tripod Control</h1>
//           <p className="text-blue-100 text-sm">Live Stream & Controls</p>
//         </div>

//         {/* Connection Status */}
//         <div
//           className={`p-2 text-center text-sm font-medium ${
//             connected
//               ? "bg-green-100 text-green-800"
//               : "bg-red-100 text-red-800"
//           }`}
//         >
//           {connected ? "🟢 Connected" : "🔴 Not Connected"}
//         </div>

//         {/* Live Stream (Smaller) */}
//         <div className="p-3">
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             muted
//             className="w-full h-40 object-cover bg-black rounded-lg"
//           />
//         </div>

//         {/* Movement Indicator */}
//         <div className="px-4 py-2 text-center text-sm font-semibold">
//           🧭 {direction}
//         </div>

//         {/* Action Buttons */}
//         <div className="grid grid-cols-3 gap-2 px-3 pb-3">
//           {!connected ? (
//             <button
//               onClick={initConnection}
//               className="col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm"
//             >
//               🔌 Connect
//             </button>
//           ) : (
//             <>
//               <button
//                 onClick={captureImage}
//                 className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm"
//               >
//                 📸
//               </button>
//               {!recording ? (
//                 <button
//                   onClick={startRecording}
//                   className="bg-amber-500 hover:bg-amber-600 text-white py-2 rounded text-sm"
//                 >
//                   ⏺️
//                 </button>
//               ) : (
//                 <button
//                   onClick={stopRecording}
//                   className="bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm"
//                 >
//                   ⏹️
//                 </button>
//               )}
//               <button
//                 onClick={() => alert("Reboot")}
//                 className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm"
//               >
//                 🔁
//               </button>
//             </>
//           )}
//         </div>

//         {/* Omnidirectional Base */}
//         <div className="border-t p-3">
//           <h3 className="text-center text-sm font-semibold mb-2">🔄 Base</h3>
//           <div className="grid grid-cols-3 gap-2">
//             <button
//               className="bg-blue-600 text-white text-xl rounded py-2"
//               onClick={() => alert("Left")}
//             >
//               ◀️
//             </button>
//             <button
//               className="bg-blue-600 text-white text-xl rounded py-2"
//               onClick={() => alert("Forward")}
//             >
//               ▲
//             </button>
//             <button
//               className="bg-blue-600 text-white text-xl rounded py-2"
//               onClick={() => alert("Right")}
//             >
//               ▶️
//             </button>
//             <button
//               className="bg-blue-600 text-white text-xl rounded py-2"
//               onClick={() => alert("Rotate L")}
//             >
//               ↺
//             </button>
//             <button
//               className="bg-gray-500 text-white rounded py-2"
//               onClick={() => alert("Stop")}
//             >
//               ⏹️
//             </button>
//             <button
//               className="bg-blue-600 text-white text-xl rounded py-2"
//               onClick={() => alert("Rotate R")}
//             >
//               ↻
//             </button>
//             <div></div>
//             <button
//               className="bg-blue-600 text-white text-xl rounded py-2"
//               onClick={() => alert("Back")}
//             >
//               ▼
//             </button>
//             <div></div>
//           </div>
//         </div>

//         {/* Height Controls */}
//         <div className="border-t p-3">
//           <h3 className="text-center text-sm font-semibold mb-2">📏 Height</h3>
//           <div className="grid grid-cols-4 gap-2 text-xs">
//             <div>
//               <div>M1</div>
//               <button
//                 className="w-full bg-blue-600 text-white text-lg rounded py-1 mt-1"
//                 onClick={() => alert("M1 Up")}
//               >
//                 ▲
//               </button>
//               <button
//                 className="w-full bg-blue-600 text-white text-lg rounded py-1 mt-1"
//                 onClick={() => alert("M1 Down")}
//               >
//                 ▼
//               </button>
//             </div>
//             <div>
//               <div>M2</div>
//               <button
//                 className="w-full bg-blue-600 text-white text-lg rounded py-1 mt-1"
//                 onClick={() => alert("M2 Up")}
//               >
//                 ▲
//               </button>
//               <button
//                 className="w-full bg-blue-600 text-white text-lg rounded py-1 mt-1"
//                 onClick={() => alert("M2 Down")}
//               >
//                 ▼
//               </button>
//             </div>
//             <div>
//               <div>M3</div>
//               <button
//                 className="w-full bg-blue-600 text-white text-lg rounded py-1 mt-1"
//                 onClick={() => alert("M3 Up")}
//               >
//                 ▲
//               </button>
//               <button
//                 className="w-full bg-blue-600 text-white text-lg rounded py-1 mt-1"
//                 onClick={() => alert("M3 Down")}
//               >
//                 ▼
//               </button>
//             </div>
//             <div className="flex flex-col justify-end gap-1">
//               <button
//                 className="bg-green-600 text-white text-xs rounded py-1"
//                 onClick={() => alert("All Up")}
//               >
//                 All Up
//               </button>
//               <button
//                 className="bg-red-600 text-white text-xs rounded py-1"
//                 onClick={() => alert("All Down")}
//               >
//                 All Down
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stabilization */}
//         <div className="border-t p-3">
//           <h3 className="text-center text-sm font-semibold mb-2">
//             ⚖️ Stabilization
//           </h3>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setStabilizationActive(true)}
//               className={`flex-1 py-2 rounded text-white text-sm ${
//                 stabilizationActive ? "bg-green-600" : "bg-gray-400"
//               }`}
//             >
//               Start
//             </button>
//             <button
//               onClick={() => setStabilizationActive(false)}
//               className={`flex-1 py-2 rounded text-white text-sm ${
//                 !stabilizationActive ? "bg-red-600" : "bg-gray-400"
//               }`}
//             >
//               Stop
//             </button>
//           </div>
//         </div>

//         {/* Pan/Tilt */}
//         <div className="border-t p-3">
//           <h3 className="text-center text-sm font-semibold mb-2">
//             🔄 Pan/Tilt
//           </h3>
//           <div className="space-y-2">
//             <div>
//               <label className="block text-xs">Pan ({panValue}°)</label>
//               <input
//                 type="range"
//                 min="0"
//                 max="180"
//                 value={panValue}
//                 onChange={(e) => setPanValue(Number(e.target.value))}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//               />
//             </div>
//             <div>
//               <label className="block text-xs">Tilt ({tiltValue}°)</label>
//               <input
//                 type="range"
//                 min="0"
//                 max="180"
//                 value={tiltValue}
//                 onChange={(e) => setTiltValue(Number(e.target.value))}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//               />
//             </div>
//             <button
//               onClick={() => {
//                 setPanValue(90);
//                 setTiltValue(90);
//               }}
//               className="w-full bg-blue-600 text-white text-xs py-1 rounded"
//             >
//               Center
//             </button>
//           </div>
//         </div>

//         {/* Obstacle Detection */}
//         <div className="border-t p-3">
//           <h3 className="text-center text-sm font-semibold mb-2">
//             🚨 Obstacles
//           </h3>
//           <div className="grid grid-cols-4 gap-1 text-xs">
//             {["front", "back", "left", "right"].map((dir) => (
//               <div
//                 key={dir}
//                 className={`p-2 rounded text-center text-white text-xs ${
//                   obstacleSignals[dir] ? "bg-green-600" : "bg-gray-500"
//                 }`}
//               >
//                 {dir.charAt(0).toUpperCase() + dir.slice(1)}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Media Gallery (Mini) */}
//         <div className="border-t p-3">
//           <h3 className="text-center text-sm font-semibold mb-2">📷 Media</h3>
//           <div className="flex gap-1 overflow-x-auto pb-1">
//             {images.slice(-3).map((img, i) => (
//               <img
//                 key={i}
//                 src={img}
//                 alt="img"
//                 className="w-14 h-14 object-cover rounded border"
//               />
//             ))}
//             {videos.slice(-3).map((vid, i) => (
//               <video
//                 key={i}
//                 src={`/data/videos/${vid}`}
//                 className="w-14 h-14 object-cover rounded border"
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useRef, useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";

export default function DesktopViewPage() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const previousX = useRef(null);

  const [recording, setRecording] = useState(false);
  const [connected, setConnected] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [direction, setDirection] = useState("Idle");
  const [stabilizationActive, setStabilizationActive] = useState(false);
  const [obstacleSignals, setObstacleSignals] = useState({
    front: false,
    back: false,
    left: false,
    right: false,
  });
  const [panValue, setPanValue] = useState(90);
  const [tiltValue, setTiltValue] = useState(90);

  // WebSocket & Peer Connection
  const initConnection = async () => {
    const pc = new RTCPeerConnection();
    peerRef.current = pc;

    pc.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0];
    };

    const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = async (msg) => {
      const data =
        typeof msg.data === "string" ? msg.data : await msg.data.text();
      const parsed = JSON.parse(data);

      if (parsed.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "answer", answer }));
      } else if (parsed.type === "candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({ type: "candidate", candidate: event.candidate })
        );
      }
    };
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    const imgRes = await fetch("/api/list-images");
    const vidRes = await fetch("/api/list-videos");
    const imgData = await imgRes.json();
    const vidData = await vidRes.json();
    setImages(imgData.files);
    setVideos(vidData.files);
  };

  const captureImage = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, `capture_${Date.now()}.png`);
      await fetch("/api/save-image", { method: "POST", body: formData });
      fetchMedia();
    }, "image/png");
  };

  const startRecording = () => {
    const stream = videoRef.current.srcObject;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recordedChunksRef.current = [];

    recorder.ondataavailable = (e) =>
      e.data.size > 0 && recordedChunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const formData = new FormData();
      formData.append("file", blob, `recording_${Date.now()}.webm`);
      await fetch("/api/save-video", { method: "POST", body: formData });
      fetchMedia();
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // BodyPix tracking
  useEffect(() => {
    let net, intervalId;
    const trackMovement = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || !net) return;
      const segmentation = await net.segmentPerson(videoRef.current);
      const mask = bodyPix.toMask(segmentation);
      const xCoords = [];
      for (let y = 0; y < mask.height; y++) {
        for (let x = 0; x < mask.width; x++) {
          if (mask.data[(y * mask.width + x) * 4 + 3] > 0) xCoords.push(x);
        }
      }
      if (xCoords.length > 0) {
        const currentX = xCoords.reduce((a, b) => a + b) / xCoords.length;
        if (previousX.current !== null) {
          const dx = currentX - previousX.current;
          setDirection(
            dx > 10 ? "➡️ Right" : dx < -10 ? "⬅️ Left" : "⏹️ Centered"
          );
        }
        previousX.current = currentX;
      }
    };

    const load = async () => {
      net = await bodyPix.load();
      intervalId = setInterval(trackMovement, 500);
    };
    load();

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-6 font-sans text-slate-800">
      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
          <h1 className="text-2xl font-bold">📹 Tripod Control Panel</h1>
          <p className="text-blue-100 text-sm">Live Stream & Full Controls</p>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
          {/* Column 1: Live Stream + Status + Actions */}
          <div className="md:col-span-1 space-y-4">
            {/* Connection Status */}
            <div
              className={`text-center py-2 rounded-lg text-sm font-medium ${
                connected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {connected ? "🟢 Connected" : "🔴 Not Connected"}
            </div>

            {/* Live Stream */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* Movement Indicator */}
            <div className="text-center py-2 text-sm font-semibold text-slate-700">
              🧭 {direction}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {!connected ? (
                <button
                  onClick={initConnection}
                  className="col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition"
                >
                  🔌 Connect
                </button>
              ) : (
                <>
                  <button
                    onClick={captureImage}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm font-medium transition"
                  >
                    📸
                  </button>
                  {!recording ? (
                    <button
                      onClick={startRecording}
                      className="bg-amber-500 hover:bg-amber-600 text-white py-2 rounded text-sm font-medium transition"
                    >
                      ⏺️
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-medium transition"
                    >
                      ⏹️
                    </button>
                  )}
                  <button
                    onClick={() => alert("Reboot")}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition"
                  >
                    🔁
                  </button>
                </>
              )}
            </div>

            {/* Media Gallery (Mini) */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-center">
                📷 Media
              </h3>
              <div className="flex gap-1 overflow-x-auto py-1 max-w-full">
                {images.slice(-4).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="img"
                    className="w-16 h-16 object-cover rounded border flex-shrink-0"
                  />
                ))}
                {videos.slice(-4).map((vid, i) => (
                  <video
                    key={i}
                    src={`/data/videos/${vid}`}
                    className="w-16 h-16 object-cover rounded border flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Controls (Stacked on mobile, side-by-side on desktop) */}
          <div className="md:col-span-2 space-y-5">
            {/* Omnidirectional Base */}
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h3 className="text-center font-semibold text-slate-700 mb-3">
                🔄 Omnidirectional Base
              </h3>
              <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
                <button
                  className="bg-blue-600 text-white text-xl rounded-lg py-3"
                  onClick={() => alert("Rotate Left")}
                >
                  ↺
                </button>
                <button
                  className="bg-blue-600 text-white text-2xl rounded-lg py-3"
                  onClick={() => alert("Forward")}
                >
                  ▲
                </button>
                <button
                  className="bg-blue-600 text-white text-xl rounded-lg py-3"
                  onClick={() => alert("Rotate Right")}
                >
                  ↻
                </button>
                <button
                  className="bg-blue-600 text-white text-2xl rounded-lg py-3"
                  onClick={() => alert("Left")}
                >
                  ◀
                </button>
                <button
                  className="bg-gray-500 text-white text-xl rounded-lg py-3"
                  onClick={() => alert("Stop")}
                >
                  ⏹️
                </button>
                <button
                  className="bg-blue-600 text-white text-2xl rounded-lg py-3"
                  onClick={() => alert("Right")}
                >
                  ▶
                </button>
                <div></div>
                <button
                  className="bg-blue-600 text-white text-2xl rounded-lg py-3"
                  onClick={() => alert("Back")}
                >
                  ▼
                </button>
                <div></div>
              </div>
            </div>

            {/* Height Controls */}
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h3 className="text-center font-semibold text-slate-700 mb-3">
                📏 Height Control (Motors)
              </h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                {["M1", "M2", "M3"].map((motor, i) => (
                  <div key={motor}>
                    <div className="font-medium text-slate-700">{motor}</div>
                    <button
                      onClick={() => alert(`${motor} Up`)}
                      className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => alert(`${motor} Down`)}
                      className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
                    >
                      ▼
                    </button>
                  </div>
                ))}
                <div className="space-y-2">
                  <button
                    onClick={() => alert("All Up")}
                    className="w-full bg-green-600 text-white text-sm py-2 rounded"
                  >
                    All Up
                  </button>
                  <button
                    onClick={() => alert("All Down")}
                    className="w-full bg-red-600 text-white text-sm py-2 rounded"
                  >
                    All Down
                  </button>
                </div>
              </div>
            </div>

            {/* Stabilization */}
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h3 className="text-center font-semibold text-slate-700 mb-3">
                ⚖️ Stabilization
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStabilizationActive(true)}
                  className={`flex-1 py-3 rounded font-medium text-white transition ${
                    stabilizationActive
                      ? "bg-green-600"
                      : "bg-gray-400 hover:bg-gray-500"
                  }`}
                >
                  Start Stabilize
                </button>
                <button
                  onClick={() => setStabilizationActive(false)}
                  className={`flex-1 py-3 rounded font-medium text-white transition ${
                    !stabilizationActive
                      ? "bg-red-600"
                      : "bg-gray-400 hover:bg-gray-500"
                  }`}
                >
                  Stop Stabilize
                </button>
              </div>
            </div>

            {/* Pan/Tilt */}
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h3 className="text-center font-semibold text-slate-700 mb-3">
                🔄 Pan / Tilt
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Pan ({panValue}°)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={panValue}
                    onChange={(e) => setPanValue(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Tilt ({tiltValue}°)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={tiltValue}
                    onChange={(e) => setTiltValue(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => {
                    setPanValue(90);
                    setTiltValue(90);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded font-medium"
                >
                  Center
                </button>
              </div>
            </div>

            {/* Obstacle Detection */}
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h3 className="text-center font-semibold text-slate-700 mb-3">
                🚨 Obstacle Detection
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(obstacleSignals).map(([dir, active]) => (
                  <div
                    key={dir}
                    className={`p-3 rounded-lg text-center font-medium text-white ${
                      active ? "bg-green-600" : "bg-gray-500"
                    }`}
                  >
                    {dir.charAt(0).toUpperCase() + dir.slice(1)}
                    <div className="text-xs mt-1">
                      {active ? "Detected" : "Clear"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
