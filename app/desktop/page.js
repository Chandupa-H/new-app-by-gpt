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
"use client";

import { useEffect, useRef, useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";

export default function DesktopViewPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
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

  const initConnection = async () => {
    console.log("💻 Desktop: Initializing WebRTC");

    const pc = new RTCPeerConnection();
    peerRef.current = pc;

    pc.ontrack = (event) => {
      console.log("💻 Received track");
      videoRef.current.srcObject = event.streams[0];
    };

    const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected ✅");
      setConnected(true);
    };

    ws.onmessage = async (msg) => {
      const data =
        typeof msg.data === "string" ? msg.data : await msg.data.text();
      const parsed = JSON.parse(data);

      if (parsed.type === "offer") {
        console.log("📩 Offer received");
        await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "answer", answer }));
      } else if (parsed.type === "candidate") {
        console.log("📩 Candidate received");
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
      await fetch("/api/save-image", {
        method: "POST",
        body: formData,
      });
      fetchMedia();
    }, "image/png");
  };

  const startRecording = () => {
    const stream = videoRef.current.srcObject;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recordedChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const formData = new FormData();
      formData.append("file", blob, `recording_${Date.now()}.webm`);

      await fetch("/api/save-video", {
        method: "POST",
        body: formData,
      });
      fetchMedia();
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // 🔍 Real-time tracking with bounding box
  useEffect(() => {
    let net;
    let intervalId;

    const trackMovement = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || video.readyState < 2 || !canvas || !net) return;

      // Set canvas resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const segmentation = await net.segmentPerson(video, {
        flipHorizontal: false,
        internalResolution: "medium",
      });

      const mask = bodyPix.toMask(segmentation);
      const xCoords = [];
      const yCoords = [];

      for (let y = 0; y < mask.height; y++) {
        for (let x = 0; x < mask.width; x++) {
          const idx = (y * mask.width + x) * 4;
          if (mask.data[idx + 3] > 0) {
            xCoords.push(x);
            yCoords.push(y);
          }
        }
      }

      if (xCoords.length > 0 && yCoords.length > 0) {
        const currentX =
          xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length;

        if (previousX.current !== null) {
          const dx = currentX - previousX.current;
          if (dx > 10) setDirection("➡️ Moving Right");
          else if (dx < -10) setDirection("⬅️ Moving Left");
          else setDirection("⏹️ Centered");
        }

        previousX.current = currentX;

        // Bounding box
        const minX = Math.min(...xCoords);
        const maxX = Math.max(...xCoords);
        const minY = Math.min(...yCoords);
        const maxY = Math.max(...yCoords);

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaleX = canvas.width / mask.width;
        const scaleY = canvas.height / mask.height;

        ctx.strokeStyle = "lime";
        ctx.lineWidth = 3;
        ctx.strokeRect(
          minX * scaleX,
          minY * scaleY,
          (maxX - minX) * scaleX,
          (maxY - minY) * scaleY
        );
      }
    };

    const loadModelAndStart = async () => {
      net = await bodyPix.load();
      intervalId = setInterval(trackMovement, 500);
    };

    loadModelAndStart();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      <h1>💻 Desktop Viewer</h1>
      <h2>🧭 Movement: {direction}</h2>

      <div style={{ position: "relative", width: "100%" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          style={{ width: "100%", backgroundColor: "#000" }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        {!connected && (
          <button onClick={initConnection}>🔌 Connect to Stream</button>
        )}
        <button onClick={captureImage} disabled={!connected}>
          📸 Capture Image
        </button>
        {!recording ? (
          <button onClick={startRecording} disabled={!connected}>
            ⏺️ Start Recording
          </button>
        ) : (
          <button onClick={stopRecording}>⏹️ Stop Recording</button>
        )}
      </div>

      <h2 style={{ marginTop: 24 }}>📷 Captured Images</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            style={{ width: 200, border: "1px solid #ccc" }}
            alt={`Captured ${i}`}
          />
        ))}
      </div>

      <h2 style={{ marginTop: 24 }}>🎥 Recorded Videos</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {videos.map((vid, i) => (
          <video
            key={i}
            src={`/data/videos/${vid}`}
            controls
            style={{ width: 200, border: "1px solid #ccc" }}
          />
        ))}
      </div>
    </div>
  );
}
