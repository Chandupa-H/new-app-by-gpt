// // "use client";

// // import { useEffect, useRef, useState } from "react";
// // import * as bodyPix from "@tensorflow-models/body-pix";
// // import "@tensorflow/tfjs";

// // export default function DesktopViewPage() {
// //   const videoRef = useRef(null);
// //   const peerRef = useRef(null);
// //   const wsRef = useRef(null);
// //   const mediaRecorderRef = useRef(null);
// //   const recordedChunksRef = useRef([]);
// //   const previousX = useRef(null);

// //   const [recording, setRecording] = useState(false);
// //   const [connected, setConnected] = useState(false);
// //   const [images, setImages] = useState([]);
// //   const [videos, setVideos] = useState([]);
// //   const [direction, setDirection] = useState("Idle");

// //   const initConnection = async () => {
// //     console.log("💻 Desktop: Initializing WebRTC");

// //     const pc = new RTCPeerConnection();
// //     peerRef.current = pc;

// //     pc.ontrack = (event) => {
// //       console.log("💻 Received track");
// //       videoRef.current.srcObject = event.streams[0];
// //     };

// //     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
// //     wsRef.current = ws;

// //     ws.onopen = () => {
// //       console.log("WebSocket connected ✅");
// //       setConnected(true);
// //     };

// //     ws.onmessage = async (msg) => {
// //       const data =
// //         typeof msg.data === "string" ? msg.data : await msg.data.text();
// //       const parsed = JSON.parse(data);

// //       if (parsed.type === "offer") {
// //         console.log("📩 Offer received");
// //         await pc.setRemoteDescription(new RTCSessionDescription(parsed.offer));
// //         const answer = await pc.createAnswer();
// //         await pc.setLocalDescription(answer);
// //         ws.send(JSON.stringify({ type: "answer", answer }));
// //       } else if (parsed.type === "candidate") {
// //         console.log("📩 Candidate received");
// //         await pc.addIceCandidate(new RTCIceCandidate(parsed.candidate));
// //       }
// //     };

// //     pc.onicecandidate = (event) => {
// //       if (event.candidate && ws.readyState === WebSocket.OPEN) {
// //         ws.send(
// //           JSON.stringify({ type: "candidate", candidate: event.candidate })
// //         );
// //       }
// //     };
// //   };

// //   useEffect(() => {
// //     fetchMedia();
// //   }, []);

// //   const fetchMedia = async () => {
// //     const imgRes = await fetch("/api/list-images");
// //     const vidRes = await fetch("/api/list-videos");
// //     const imgData = await imgRes.json();
// //     const vidData = await vidRes.json();
// //     setImages(imgData.files);
// //     setVideos(vidData.files);
// //   };

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
// //       fetchMedia();
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
// //       fetchMedia();
// //     };

// //     recorder.start();
// //     setRecording(true);
// //   };

// //   const stopRecording = () => {
// //     mediaRecorderRef.current.stop();
// //     setRecording(false);
// //   };

// //   // 🔍 Real-time tracking effect
// //   useEffect(() => {
// //     let net;
// //     let intervalId;

// //     const trackMovement = async () => {
// //       if (!videoRef.current || videoRef.current.readyState < 2) return;
// //       if (!net) return;

// //       const segmentation = await net.segmentPerson(videoRef.current, {
// //         flipHorizontal: false,
// //         internalResolution: "medium",
// //       });

// //       const mask = bodyPix.toMask(segmentation);
// //       const xCoords = [];

// //       for (let y = 0; y < mask.height; y++) {
// //         for (let x = 0; x < mask.width; x++) {
// //           const idx = (y * mask.width + x) * 4;
// //           if (mask.data[idx + 3] > 0) xCoords.push(x);
// //         }
// //       }

// //       if (xCoords.length > 0) {
// //         const currentX =
// //           xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length;

// //         if (previousX.current !== null) {
// //           const dx = currentX - previousX.current;
// //           if (dx > 10) setDirection("➡️ Moving Right");
// //           else if (dx < -10) setDirection("⬅️ Moving Left");
// //           else setDirection("⏹️ Centered");
// //         }

// //         previousX.current = currentX;
// //       }
// //     };

// //     const loadModelAndStart = async () => {
// //       net = await bodyPix.load();
// //       intervalId = setInterval(trackMovement, 500);
// //     };

// //     loadModelAndStart();

// //     return () => {
// //       if (intervalId) clearInterval(intervalId);
// //     };
// //   }, []);

// //   return (
// //     <div>
// //       <h1>💻 Desktop Viewer</h1>
// //       <h2>🧭 Movement: {direction}</h2>

// //       <video
// //         ref={videoRef}
// //         autoPlay
// //         playsInline
// //         controls
// //         style={{ width: "100%", backgroundColor: "#000" }}
// //       />

// //       <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
// //         {!connected && (
// //           <button onClick={initConnection}>🔌 Connect to Stream</button>
// //         )}
// //         <button onClick={captureImage} disabled={!connected}>
// //           📸 Capture Image
// //         </button>
// //         {!recording ? (
// //           <button onClick={startRecording} disabled={!connected}>
// //             ⏺️ Start Recording
// //           </button>
// //         ) : (
// //           <button onClick={stopRecording}>⏹️ Stop Recording</button>
// //         )}
// //       </div>

// //       <h2 style={{ marginTop: 24 }}>📷 Captured Images</h2>
// //       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
// //         {images.map((img, i) => (
// //           <img
// //             key={i}
// //             src={img}
// //             style={{ width: 200, border: "1px solid #ccc" }}
// //             alt={`Captured ${i}`}
// //           />
// //         ))}
// //       </div>

// //       <h2 style={{ marginTop: 24 }}>🎥 Recorded Videos</h2>
// //       <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
// //         {videos.map((vid, i) => (
// //           <video
// //             key={i}
// //             src={`/data/videos/${vid}`}
// //             controls
// //             style={{ width: 200, border: "1px solid #ccc" }}
// //           />
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

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
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-6 font-sans text-slate-800">
//       {/* Main Container */}
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
//           <h1 className="text-2xl font-bold">📹 Tripod Control Panel</h1>
//           <p className="text-blue-100 text-sm">Live Stream & Full Controls</p>
//         </div>

//         {/* Responsive Grid Layout */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
//           {/* Column 1: Live Stream + Status + Actions */}
//           <div className="md:col-span-1 space-y-4">
//             {/* Connection Status */}
//             <div
//               className={`text-center py-2 rounded-lg text-sm font-medium ${
//                 connected
//                   ? "bg-green-100 text-green-800"
//                   : "bg-red-100 text-red-800"
//               }`}
//             >
//               {connected ? "🟢 Connected" : "🔴 Not Connected"}
//             </div>

//             {/* Live Stream */}
//             <div className="aspect-video bg-black rounded-xl overflow-hidden">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             {/* Movement Indicator */}
//             <div className="text-center py-2 text-sm font-semibold text-slate-700">
//               🧭 {direction}
//             </div>

//             {/* Action Buttons */}
//             <div className="grid grid-cols-3 gap-2">
//               {!connected ? (
//                 <button
//                   onClick={initConnection}
//                   className="col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition"
//                 >
//                   🔌 Connect
//                 </button>
//               ) : (
//                 <>
//                   <button
//                     onClick={captureImage}
//                     className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm font-medium transition"
//                   >
//                     📸
//                   </button>
//                   {!recording ? (
//                     <button
//                       onClick={startRecording}
//                       className="bg-amber-500 hover:bg-amber-600 text-white py-2 rounded text-sm font-medium transition"
//                     >
//                       ⏺️
//                     </button>
//                   ) : (
//                     <button
//                       onClick={stopRecording}
//                       className="bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-medium transition"
//                     >
//                       ⏹️
//                     </button>
//                   )}
//                   <button
//                     onClick={() => alert("Reboot")}
//                     className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition"
//                   >
//                     🔁
//                   </button>
//                 </>
//               )}
//             </div>

//             {/* Media Gallery (Mini) */}
//             <div>
//               <h3 className="text-sm font-semibold mb-2 text-center">
//                 📷 Media
//               </h3>
//               <div className="flex gap-1 overflow-x-auto py-1 max-w-full">
//                 {images.slice(-4).map((img, i) => (
//                   <img
//                     key={i}
//                     src={img}
//                     alt="img"
//                     className="w-16 h-16 object-cover rounded border flex-shrink-0"
//                   />
//                 ))}
//                 {videos.slice(-4).map((vid, i) => (
//                   <video
//                     key={i}
//                     src={`/data/videos/${vid}`}
//                     className="w-16 h-16 object-cover rounded border flex-shrink-0"
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Column 2: Controls (Stacked on mobile, side-by-side on desktop) */}
//           <div className="md:col-span-2 space-y-5">
//             {/* Omnidirectional Base */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 🔄 Omnidirectional Base
//               </h3>
//               <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
//                 <button
//                   className="bg-blue-600 text-white text-xl rounded-lg py-3"
//                   onClick={() => alert("Rotate Left")}
//                 >
//                   ↺
//                 </button>
//                 <button
//                   className="bg-blue-600 text-white text-2xl rounded-lg py-3"
//                   onClick={() => alert("Forward")}
//                 >
//                   ▲
//                 </button>
//                 <button
//                   className="bg-blue-600 text-white text-xl rounded-lg py-3"
//                   onClick={() => alert("Rotate Right")}
//                 >
//                   ↻
//                 </button>
//                 <button
//                   className="bg-blue-600 text-white text-2xl rounded-lg py-3"
//                   onClick={() => alert("Left")}
//                 >
//                   ◀
//                 </button>
//                 <button
//                   className="bg-gray-500 text-white text-xl rounded-lg py-3"
//                   onClick={() => alert("Stop")}
//                 >
//                   ⏹️
//                 </button>
//                 <button
//                   className="bg-blue-600 text-white text-2xl rounded-lg py-3"
//                   onClick={() => alert("Right")}
//                 >
//                   ▶
//                 </button>
//                 <div></div>
//                 <button
//                   className="bg-blue-600 text-white text-2xl rounded-lg py-3"
//                   onClick={() => alert("Back")}
//                 >
//                   ▼
//                 </button>
//                 <div></div>
//               </div>
//             </div>

//             {/* Height Controls */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 📏 Height Control (Motors)
//               </h3>
//               <div className="grid grid-cols-4 gap-3 text-center">
//                 {["M1", "M2", "M3"].map((motor, i) => (
//                   <div key={motor}>
//                     <div className="font-medium text-slate-700">{motor}</div>
//                     <button
//                       onClick={() => alert(`${motor} Up`)}
//                       className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
//                     >
//                       ▲
//                     </button>
//                     <button
//                       onClick={() => alert(`${motor} Down`)}
//                       className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
//                     >
//                       ▼
//                     </button>
//                   </div>
//                 ))}
//                 <div className="space-y-2">
//                   <button
//                     onClick={() => alert("All Up")}
//                     className="w-full bg-green-600 text-white text-sm py-2 rounded"
//                   >
//                     All Up
//                   </button>
//                   <button
//                     onClick={() => alert("All Down")}
//                     className="w-full bg-red-600 text-white text-sm py-2 rounded"
//                   >
//                     All Down
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Stabilization */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 ⚖️ Stabilization
//               </h3>
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   onClick={() => setStabilizationActive(true)}
//                   className={`flex-1 py-3 rounded font-medium text-white transition ${
//                     stabilizationActive
//                       ? "bg-green-600"
//                       : "bg-gray-400 hover:bg-gray-500"
//                   }`}
//                 >
//                   Start Stabilize
//                 </button>
//                 <button
//                   onClick={() => setStabilizationActive(false)}
//                   className={`flex-1 py-3 rounded font-medium text-white transition ${
//                     !stabilizationActive
//                       ? "bg-red-600"
//                       : "bg-gray-400 hover:bg-gray-500"
//                   }`}
//                 >
//                   Stop Stabilize
//                 </button>
//               </div>
//             </div>

//             {/* Pan/Tilt */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 🔄 Pan / Tilt
//               </h3>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700">
//                     Pan ({panValue}°)
//                   </label>
//                   <input
//                     type="range"
//                     min="0"
//                     max="180"
//                     value={panValue}
//                     onChange={(e) => setPanValue(Number(e.target.value))}
//                     className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700">
//                     Tilt ({tiltValue}°)
//                   </label>
//                   <input
//                     type="range"
//                     min="0"
//                     max="180"
//                     value={tiltValue}
//                     onChange={(e) => setTiltValue(Number(e.target.value))}
//                     className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
//                   />
//                 </div>
//                 <button
//                   onClick={() => {
//                     setPanValue(90);
//                     setTiltValue(90);
//                   }}
//                   className="w-full bg-blue-600 text-white py-2 rounded font-medium"
//                 >
//                   Center
//                 </button>
//               </div>
//             </div>

//             {/* Obstacle Detection */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 🚨 Obstacle Detection
//               </h3>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 {Object.entries(obstacleSignals).map(([dir, active]) => (
//                   <div
//                     key={dir}
//                     className={`p-3 rounded-lg text-center font-medium text-white ${
//                       active ? "bg-green-600" : "bg-gray-500"
//                     }`}
//                   >
//                     {dir.charAt(0).toUpperCase() + dir.slice(1)}
//                     <div className="text-xs mt-1">
//                       {active ? "Detected" : "Clear"}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
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
import { sendMotorCommand } from "@/src/services/esp32Api";

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
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
          <h1 className="text-2xl font-bold">📹 Tripod Control Panel</h1>
          <p className="text-blue-100 text-sm">Live Stream & Full Controls</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
          {/* Left Column: Video & Capture Controls */}
          <div className="md:col-span-1 space-y-4">
            <div
              className={`text-center py-2 rounded-lg text-sm font-medium ${
                connected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {connected ? "🟢 Connected" : "🔴 Not Connected"}
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center py-2 text-sm font-semibold text-slate-700">
              🧭 {direction}
            </div>

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
                    onClick={() => sendMotorCommand("reboot")}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition"
                  >
                    🔁
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: All Controls */}
          <div className="md:col-span-2 space-y-5">
            {/* Omnidirectional Base */}
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h3 className="text-center font-semibold text-slate-700 mb-3">
                🔄 Omnidirectional Base
              </h3>
              <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
                <button
                  className="bg-blue-600 text-white text-xl rounded-lg py-3"
                  onClick={() => sendMotorCommand("rLeft")}
                >
                  ↺
                </button>
                <button
                  className="bg-blue-600 text-white text-2xl rounded-lg py-3"
                  onClick={() => sendMotorCommand("forward")}
                >
                  ▲
                </button>
                <button
                  className="bg-blue-600 text-white text-xl rounded-lg py-3"
                  onClick={() => sendMotorCommand("rRight")}
                >
                  ↻
                </button>
                <button
                  className="bg-blue-600 text-white text-2xl rounded-lg py-3"
                  onClick={() => sendMotorCommand("left")}
                >
                  ◀
                </button>
                <button
                  className="bg-gray-500 text-white text-xl rounded-lg py-3"
                  onClick={() => sendMotorCommand("stop")}
                >
                  ⏹️
                </button>
                <button
                  className="bg-blue-600 text-white text-2xl rounded-lg py-3"
                  onClick={() => sendMotorCommand("right")}
                >
                  ▶
                </button>
                <div></div>
                <button
                  className="bg-blue-600 text-white text-2xl rounded-lg py-3"
                  onClick={() => sendMotorCommand("backward")}
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
                      onClick={() =>
                        sendMotorCommand(`${motor.toLowerCase()}Up`)
                      }
                      className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() =>
                        sendMotorCommand(`${motor.toLowerCase()}Down`)
                      }
                      className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
                    >
                      ▼
                    </button>
                  </div>
                ))}
                <div className="space-y-2">
                  <button
                    onClick={() => sendMotorCommand("allUp")}
                    className="w-full bg-green-600 text-white text-sm py-2 rounded"
                  >
                    All Up
                  </button>
                  <button
                    onClick={() => sendMotorCommand("allDown")}
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
                  onClick={() => {
                    setStabilizationActive(true);
                    sendMotorCommand("startStabilize");
                  }}
                  className={`flex-1 py-3 rounded font-medium text-white transition ${
                    stabilizationActive
                      ? "bg-green-600"
                      : "bg-gray-400 hover:bg-gray-500"
                  }`}
                >
                  Start Stabilize
                </button>
                <button
                  onClick={() => {
                    setStabilizationActive(false);
                    sendMotorCommand("stopStabilize");
                  }}
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
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setPanValue(value);
                      sendMotorCommand(`pan:${value}`);
                    }}
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
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setTiltValue(value);
                      sendMotorCommand(`tilt:${value}`);
                    }}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => {
                    setPanValue(90);
                    setTiltValue(90);
                    sendMotorCommand("centerServos");
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
