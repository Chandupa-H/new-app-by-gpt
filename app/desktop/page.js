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

// //             {/* Media Gallery (Mini) */}
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
// //             </div>
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

//
// qwen only version
// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   ArrowUp,
//   ArrowDown,
//   ArrowLeft,
//   ArrowRight,
//   RotateCw,
//   RotateCcw,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";
// import { sendMotorCommand } from "@/src/services/esp32Api";

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const previousX = useRef(null);

//   const { toast } = useToast();

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
//   const [activeDirection, setActiveDirection] =
//     (useState < string) | (null > null);

//   // WebSocket & Peer Connection
//   const initConnection = async () => {
//     const pc = new RTCPeerConnection();
//     peerRef.current = pc;

//     pc.ontrack = (event) => {
//       if (videoRef.current) {
//         videoRef.current.srcObject = event.streams[0];
//       }
//     };

//     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//     wsRef.current = ws;

//     ws.onopen = () => setConnected(true);

//     ws.onmessage = async (msg) => {
//       const data =
//         typeof msg.data === "string" ? msg.data : await msg.data.text();
//       try {
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
//       } catch (err) {
//         console.error("WebSocket message error:", err);
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
//     try {
//       const imgRes = await fetch("/api/list-images");
//       const vidRes = await fetch("/api/list-videos");
//       const imgData = await imgRes.json();
//       const vidData = await vidRes.json();
//       setImages(imgData.files || []);
//       setVideos(vidData.files || []);
//     } catch (err) {
//       console.error("Failed to fetch media:", err);
//     }
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     if (!video || !video.srcObject) return;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       if (!blob) return;
//       const formData = new FormData();
//       formData.append("file", blob, `capture_${Date.now()}.png`);
//       try {
//         await fetch("/api/save-image", { method: "POST", body: formData });
//         fetchMedia();
//       } catch (err) {
//         toast({
//           title: "Error",
//           description: "Failed to save image.",
//           variant: "destructive",
//         });
//       }
//     }, "image/png");
//   };

//   const startRecording = () => {
//     const stream = videoRef.current?.srcObject;
//     if (!stream) return;

//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     recordedChunksRef.current = [];

//     recorder.ondataavailable = (e) =>
//       e.data.size > 0 && recordedChunksRef.current.push(e.data);
//     recorder.onstop = async () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("file", blob, `recording_${Date.now()}.webm`);
//       try {
//         await fetch("/api/save-video", { method: "POST", body: formData });
//         fetchMedia();
//       } catch (err) {
//         toast({
//           title: "Error",
//           description: "Failed to save video.",
//           variant: "destructive",
//         });
//       }
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current?.state === "recording") {
//       mediaRecorderRef.current.stop();
//     }
//     setRecording(false);
//   };

//   // BodyPix tracking
//   useEffect(() => {
//     let net, intervalId;
//     const trackMovement = async () => {
//       if (!videoRef.current || videoRef.current.readyState < 2 || !net) return;
//       try {
//         const segmentation = await net.segmentPerson(videoRef.current);
//         const mask = bodyPix.toMask(segmentation);
//         const xCoords = [];
//         for (let y = 0; y < mask.height; y++) {
//           for (let x = 0; x < mask.width; x++) {
//             if (mask.data[(y * mask.width + x) * 4 + 3] > 0) xCoords.push(x);
//           }
//         }
//         if (xCoords.length > 0) {
//           const currentX = xCoords.reduce((a, b) => a + b) / xCoords.length;
//           if (previousX.current !== null) {
//             const dx = currentX - previousX.current;
//             setDirection(
//               dx > 10 ? "➡️ Right" : dx < -10 ? "⬅️ Left" : "⏹️ Centered"
//             );
//           }
//           previousX.current = currentX;
//         }
//       } catch (err) {
//         console.error("BodyPix tracking error:", err);
//       }
//     };

//     const load = async () => {
//       try {
//         net = await bodyPix.load();
//         intervalId = setInterval(trackMovement, 500);
//       } catch (err) {
//         console.error("Failed to load BodyPix model:", err);
//       }
//     };
//     load();

//     return () => clearInterval(intervalId);
//   }, []);

//   // Motor Control Handlers
//   const handleDirectionDown = (dir) => {
//     console.log(`Sending Base Control ESP32 command: ${dir}`);
//     setActiveDirection(dir);

//     sendMotorCommand(dir, 100)
//       .then((response) => {
//         console.log(`ESP32 response: ${response}`);
//       })
//       .catch((error) => {
//         console.error("Command failed:", error);
//         toast({
//           title: "Command Failed",
//           description: `Could not send '${dir}' command.`,
//           variant: "destructive",
//         });
//       });
//   };

//   const handleDirectionUp = () => {
//     if (activeDirection) {
//       sendMotorCommand("stop", 0).catch((err) =>
//         console.error("Stop command failed:", err)
//       );
//       setActiveDirection(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-6 font-sans text-slate-800">
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
//           <h1 className="text-2xl font-bold">📹 Tripod Control Panel</h1>
//           <p className="text-blue-100 text-sm">Live Stream & Full Controls</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
//           {/* Left Column: Video & Capture */}
//           <div className="md:col-span-1 space-y-4">
//             <div
//               className={`text-center py-2 rounded-lg text-sm font-medium ${
//                 connected
//                   ? "bg-green-100 text-green-800"
//                   : "bg-red-100 text-red-800"
//               }`}
//             >
//               {connected ? "🟢 Connected" : "🔴 Not Connected"}
//             </div>

//             <div className="aspect-video bg-black rounded-xl overflow-hidden">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             <div className="text-center py-2 text-sm font-semibold text-slate-700">
//               🧭 {direction}
//             </div>

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
//                     onClick={() => sendMotorCommand("reboot")}
//                     className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition"
//                   >
//                     🔁
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Right Column: All Controls */}
//           <div className="md:col-span-2 space-y-5">
//             {/* Omnidirectional Base */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 🔄 Omnidirectional Base
//               </h3>
//               <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
//                 {/* Top Row */}
//                 <button
//                   className={`p-3 rounded-lg transition ${
//                     activeDirection === "rLeft"
//                       ? "bg-blue-700 ring-2 ring-yellow-400"
//                       : "bg-blue-600 hover:bg-blue-700"
//                   } text-white active:scale-95`}
//                   onMouseDown={() => handleDirectionDown("rLeft")}
//                   onMouseUp={handleDirectionUp}
//                   onTouchStart={() => handleDirectionDown("rLeft")}
//                   onTouchEnd={handleDirectionUp}
//                   title="Rotate Left"
//                 >
//                   <RotateCcw size={24} />
//                 </button>
//                 <button
//                   className={`p-3 rounded-lg transition ${
//                     activeDirection === "forward"
//                       ? "bg-blue-700 ring-2 ring-yellow-400"
//                       : "bg-blue-600 hover:bg-blue-700"
//                   } text-white active:scale-95`}
//                   onMouseDown={() => handleDirectionDown("forward")}
//                   onMouseUp={handleDirectionUp}
//                   onTouchStart={() => handleDirectionDown("forward")}
//                   onTouchEnd={handleDirectionUp}
//                   title="Move Forward"
//                 >
//                   <ArrowUp size={24} />
//                 </button>
//                 <button
//                   className={`p-3 rounded-lg transition ${
//                     activeDirection === "rRight"
//                       ? "bg-blue-700 ring-2 ring-yellow-400"
//                       : "bg-blue-600 hover:bg-blue-700"
//                   } text-white active:scale-95`}
//                   onMouseDown={() => handleDirectionDown("rRight")}
//                   onMouseUp={handleDirectionUp}
//                   onTouchStart={() => handleDirectionDown("rRight")}
//                   onTouchEnd={handleDirectionUp}
//                   title="Rotate Right"
//                 >
//                   <RotateCw size={24} />
//                 </button>

//                 {/* Middle Row */}
//                 <button
//                   className={`p-3 rounded-lg transition ${
//                     activeDirection === "left"
//                       ? "bg-blue-700 ring-2 ring-yellow-400"
//                       : "bg-blue-600 hover:bg-blue-700"
//                   } text-white active:scale-95`}
//                   onMouseDown={() => handleDirectionDown("left")}
//                   onMouseUp={handleDirectionUp}
//                   onTouchStart={() => handleDirectionDown("left")}
//                   onTouchEnd={handleDirectionUp}
//                   title="Strafe Left"
//                 >
//                   <ArrowLeft size={24} />
//                 </button>
//                 <div className="bg-gray-500 flex items-center justify-center rounded-lg">
//                   <span className="w-2 h-2 rounded-full bg-white"></span>
//                 </div>
//                 <button
//                   className={`p-3 rounded-lg transition ${
//                     activeDirection === "right"
//                       ? "bg-blue-700 ring-2 ring-yellow-400"
//                       : "bg-blue-600 hover:bg-blue-700"
//                   } text-white active:scale-95`}
//                   onMouseDown={() => handleDirectionDown("right")}
//                   onMouseUp={handleDirectionUp}
//                   onTouchStart={() => handleDirectionDown("right")}
//                   onTouchEnd={handleDirectionUp}
//                   title="Strafe Right"
//                 >
//                   <ArrowRight size={24} />
//                 </button>

//                 {/* Bottom Row */}
//                 <div></div>
//                 <button
//                   className={`p-3 rounded-lg transition ${
//                     activeDirection === "backward"
//                       ? "bg-blue-700 ring-2 ring-yellow-400"
//                       : "bg-blue-600 hover:bg-blue-700"
//                   } text-white active:scale-95`}
//                   onMouseDown={() => handleDirectionDown("backward")}
//                   onMouseUp={handleDirectionUp}
//                   onTouchStart={() => handleDirectionDown("backward")}
//                   onTouchEnd={handleDirectionUp}
//                   title="Move Backward"
//                 >
//                   <ArrowDown size={24} />
//                 </button>
//                 <div></div>
//               </div>
//               <div className="mt-4 text-center">
//                 <p className="text-xs text-slate-500">
//                   3-Motor Omnidirectional Base Control
//                 </p>
//               </div>
//             </div>

//             {/* Height Controls */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 📏 Height Control (Motors)
//               </h3>
//               <div className="grid grid-cols-4 gap-3 text-center">
//                 {["M1", "M2", "M3"].map((motor) => (
//                   <div key={motor}>
//                     <div className="font-medium text-slate-700">{motor}</div>
//                     <button
//                       onClick={() =>
//                         sendMotorCommand(`${motor.toLowerCase()}Up`)
//                       }
//                       className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1 hover:bg-blue-700 transition"
//                     >
//                       ▲
//                     </button>
//                     <button
//                       onClick={() =>
//                         sendMotorCommand(`${motor.toLowerCase()}Down`)
//                       }
//                       className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1 hover:bg-blue-700 transition"
//                     >
//                       ▼
//                     </button>
//                   </div>
//                 ))}
//                 <div className="space-y-2">
//                   <button
//                     onClick={() => sendMotorCommand("allUp")}
//                     className="w-full bg-green-600 text-white text-sm py-2 rounded hover:bg-green-700 transition"
//                   >
//                     All Up
//                   </button>
//                   <button
//                     onClick={() => sendMotorCommand("allDown")}
//                     className="w-full bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 transition"
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
//                   onClick={() => {
//                     setStabilizationActive(true);
//                     sendMotorCommand("startStabilize");
//                   }}
//                   className={`flex-1 py-3 rounded font-medium text-white transition ${
//                     stabilizationActive
//                       ? "bg-green-600"
//                       : "bg-gray-400 hover:bg-gray-500"
//                   }`}
//                 >
//                   Start Stabilize
//                 </button>
//                 <button
//                   onClick={() => {
//                     setStabilizationActive(false);
//                     sendMotorCommand("stopStabilize");
//                   }}
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
//                     onChange={(e) => {
//                       const value = Number(e.target.value);
//                       setPanValue(value);
//                       sendMotorCommand(`pan:${value}`);
//                     }}
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
//                     onChange={(e) => {
//                       const value = Number(e.target.value);
//                       setTiltValue(value);
//                       sendMotorCommand(`tilt:${value}`);
//                     }}
//                     className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
//                   />
//                 </div>
//                 <button
//                   onClick={() => {
//                     setPanValue(90);
//                     setTiltValue(90);
//                     sendMotorCommand("centerServos");
//                   }}
//                   className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
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

//
// claude only version
// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";
// // import { sendMotorCommand } from "@/services/esp32Api"; // Import our JS API
// import { sendMotorCommand } from "@/src/services/esp32Api";

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
//       <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
//           <h1 className="text-2xl font-bold">📹 Tripod Control Panel</h1>
//           <p className="text-blue-100 text-sm">Live Stream & Full Controls</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-5">
//           {/* Video Stream Section */}
//           <div className="lg:col-span-1 space-y-4">
//             <div
//               className={`text-center py-2 rounded-lg text-sm font-medium ${
//                 connected
//                   ? "bg-green-100 text-green-800"
//                   : "bg-red-100 text-red-800"
//               }`}
//             >
//               {connected ? "🟢 Connected" : "🔴 Not Connected"}
//             </div>

//             <div className="aspect-video bg-black rounded-xl overflow-hidden">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             <div className="text-center py-2 text-sm font-semibold text-slate-700">
//               🧭 {direction}
//             </div>

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
//                     onClick={() => sendMotorCommand("reboot")}
//                     className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition"
//                   >
//                     🔁
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Controls Section */}
//           <div className="lg:col-span-3 space-y-5">
//             {/* Omnidirectional Base */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 🔄 Omnidirectional Base
//               </h3>
//               <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
//                 <button
//                   className="bg-blue-600 text-white text-xl rounded-lg py-3"
//                   onClick={() => sendMotorCommand("rLeft")}
//                 >
//                   ↺
//                 </button>
//                 <button
//                   className="bg-blue-600 text-white text-2xl rounded-lg py-3"
//                   onClick={() => sendMotorCommand("forward")}
//                 >
//                   ▲
//                 </button>
//                 <button
//                   className="bg-blue-600 text-white text-xl rounded-lg py-3"
//                   onClick={() => sendMotorCommand("rRight")}
//                 >
//                   ↻
//                 </button>
//                 <button
//                   className="bg-blue-600 text-white text-2xl rounded-lg py-3"
//                   onClick={() => sendMotorCommand("left")}
//                 >
//                   ◀
//                 </button>
//                 <button
//                   className="bg-gray-500 text-white text-xl rounded-lg py-3"
//                   onClick={() => sendMotorCommand("stop")}
//                 >
//                   ⏹️
//                 </button>
//                 <button
//                   className="bg-blue-600 text-white text-2xl rounded-lg py-3"
//                   onClick={() => sendMotorCommand("right")}
//                 >
//                   ▶
//                 </button>
//                 <div></div>
//                 <button
//                   className="bg-blue-600 text-white text-2xl rounded-lg py-3"
//                   onClick={() => sendMotorCommand("backward")}
//                 >
//                   ▼
//                 </button>
//                 <div></div>
//               </div>
//             </div>

//             {/* Two Column Layout for Additional Controls */}
//             <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
//               {/* Height Controls */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   📏 Height Control (Motors)
//                 </h3>
//                 <div className="grid grid-cols-4 gap-3 text-center">
//                   {["M1", "M2", "M3"].map((motor, i) => (
//                     <div key={motor}>
//                       <div className="font-medium text-slate-700">{motor}</div>
//                       <button
//                         onClick={() => alert(`${motor} Up`)}
//                         className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
//                       >
//                         ▲
//                       </button>
//                       <button
//                         onClick={() => alert(`${motor} Down`)}
//                         className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
//                       >
//                         ▼
//                       </button>
//                     </div>
//                   ))}
//                   <div className="space-y-2">
//                     <button
//                       onClick={() => alert("All Up")}
//                       className="w-full bg-green-600 text-white text-sm py-2 rounded"
//                     >
//                       All Up
//                     </button>
//                     <button
//                       onClick={() => alert("All Down")}
//                       className="w-full bg-red-600 text-white text-sm py-2 rounded"
//                     >
//                       All Down
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Stabilization */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   ⚖️ Stabilization
//                 </h3>
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <button
//                     onClick={() => setStabilizationActive(true)}
//                     className={`flex-1 py-3 rounded font-medium text-white transition ${
//                       stabilizationActive
//                         ? "bg-green-600"
//                         : "bg-gray-400 hover:bg-gray-500"
//                     }`}
//                   >
//                     Start Stabilize
//                   </button>
//                   <button
//                     onClick={() => setStabilizationActive(false)}
//                     className={`flex-1 py-3 rounded font-medium text-white transition ${
//                       !stabilizationActive
//                         ? "bg-red-600"
//                         : "bg-gray-400 hover:bg-gray-500"
//                     }`}
//                   >
//                     Stop Stabilize
//                   </button>
//                 </div>
//               </div>

//               {/* Pan/Tilt */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   🔄 Pan / Tilt
//                 </h3>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700">
//                       Pan ({panValue}°)
//                     </label>
//                     <input
//                       type="range"
//                       min="0"
//                       max="180"
//                       value={panValue}
//                       onChange={(e) => setPanValue(Number(e.target.value))}
//                       className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700">
//                       Tilt ({tiltValue}°)
//                     </label>
//                     <input
//                       type="range"
//                       min="0"
//                       max="180"
//                       value={tiltValue}
//                       onChange={(e) => setTiltValue(Number(e.target.value))}
//                       className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                   </div>
//                   <button
//                     onClick={() => {
//                       setPanValue(90);
//                       setTiltValue(90);
//                     }}
//                     className="w-full bg-blue-600 text-white py-2 rounded font-medium"
//                   >
//                     Center
//                   </button>
//                 </div>
//               </div>

//               {/* Obstacle Detection */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   🚨 Obstacle Detection
//                 </h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                   {Object.entries(obstacleSignals).map(([dir, active]) => (
//                     <div
//                       key={dir}
//                       className={`p-3 rounded-lg text-center font-medium text-white ${
//                         active ? "bg-green-600" : "bg-gray-500"
//                       }`}
//                     >
//                       {dir.charAt(0).toUpperCase() + dir.slice(1)}
//                       <div className="text-xs mt-1">
//                         {active ? "Detected" : "Clear"}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//
//
// second claude only version
// working properly
// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";
// import {
//   ArrowUp,
//   ArrowDown,
//   ArrowLeft,
//   ArrowRight,
//   RotateCw,
//   RotateCcw,
// } from "lucide-react";
// // import { sendMotorCommand } from "@/services/esp32Api"; // Import our JS API
// import { sendMotorCommand } from "@/src/services/esp32Api";

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
//     console.log("imageRes", imgRes);
//     console.log("videoRes", vidRes);
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     console.log("imgdata", imgData);
//     console.log("vidData", vidData);

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

//   // Enhanced motor control handlers
//   const handleDirectionClick = (direction) => {
//     console.log(`Sending Base Control ESP32 command: ${direction}`);

//     sendMotorCommand(direction, 100)
//       .then((response) => {
//         console.log(`Base Control ESP32 response: ${response}`);
//       })
//       .catch((error) => {
//         console.error("Base Control command failed:", error);
//       });
//   };

//   const handleButtonDown = (direction) => {
//     handleDirectionClick(direction);
//   };

//   const handleButtonUp = () => {
//     handleDirectionClick("stop");
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
//       <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
//           <h1 className="text-2xl font-bold">📹 Tripod Control Panel</h1>
//           <p className="text-blue-100 text-sm">Live Stream & Full Controls</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-5">
//           {/* Video Stream Section */}
//           <div className="lg:col-span-1 space-y-4">
//             <div
//               className={`text-center py-2 rounded-lg text-sm font-medium ${
//                 connected
//                   ? "bg-green-100 text-green-800"
//                   : "bg-red-100 text-red-800"
//               }`}
//             >
//               {connected ? "🟢 Connected" : "🔴 Not Connected"}
//             </div>

//             <div className="aspect-video bg-black rounded-xl overflow-hidden">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             <div className="text-center py-2 text-sm font-semibold text-slate-700">
//               🧭 {direction}
//             </div>

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
//                     onClick={() => sendMotorCommand("reboot")}
//                     className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition"
//                   >
//                     🔁
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Media Gallery (Mini) */}
//           <div>
//             <h3 className="text-sm font-semibold mb-2 text-center">📷 Media</h3>
//             <div className="flex gap-1 overflow-x-auto py-1 max-w-full">
//               {images.slice(-4).map((img, i) => (
//                 <img
//                   key={i}
//                   src={img}
//                   alt="img"
//                   className="w-16 h-16 object-cover rounded border flex-shrink-0"
//                 />
//               ))}
//               {videos.slice(-4).map((vid, i) => (
//                 <video
//                   key={i}
//                   src={vid}
//                   className="w-16 h-16 object-cover rounded border flex-shrink-0"
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Controls Section */}
//           <div className="lg:col-span-3 space-y-5">
//             {/* Omnidirectional Base */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 🔄 Omnidirectional Base
//               </h3>
//               <div className="grid grid-cols-3 gap-3 max-w-48 mx-auto">
//                 {/* Top row */}
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("rLeft")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("rLeft")}
//                   onTouchEnd={handleButtonUp}
//                   title="Rotate Left"
//                 >
//                   <RotateCcw size={24} />
//                 </div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("forward")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("forward")}
//                   onTouchEnd={handleButtonUp}
//                   title="Move Forward"
//                 >
//                   <ArrowUp size={28} />
//                 </div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("rRight")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("rRight")}
//                   onTouchEnd={handleButtonUp}
//                   title="Rotate Right"
//                 >
//                   <RotateCw size={24} />
//                 </div>

//                 {/* Middle row */}
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("left")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("left")}
//                   onTouchEnd={handleButtonUp}
//                   title="Strafe Left"
//                 >
//                   <ArrowLeft size={28} />
//                 </div>
//                 <div
//                   className="bg-gray-500 text-white text-xl rounded-lg py-3 flex items-center justify-center"
//                   title="Base Center"
//                 >
//                   <span className="w-2 h-2 rounded-full bg-white"></span>
//                 </div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("right")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("right")}
//                   onTouchEnd={handleButtonUp}
//                   title="Strafe Right"
//                 >
//                   <ArrowRight size={28} />
//                 </div>

//                 {/* Bottom row */}
//                 <div></div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("backward")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("backward")}
//                   onTouchEnd={handleButtonUp}
//                   title="Move Backward"
//                 >
//                   <ArrowDown size={28} />
//                 </div>
//                 <div></div>
//               </div>

//               <div className="mt-4 text-center">
//                 <p className="text-xs text-gray-500">
//                   3-Motor Omnidirectional Base Control
//                 </p>
//               </div>
//             </div>

//             {/* Two Column Layout for Additional Controls */}
//             <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
//               {/* Height Controls */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   📏 Height Control (Motors)
//                 </h3>
//                 <div className="grid grid-cols-4 gap-3 text-center">
//                   {["M1", "M2", "M3"].map((motor, i) => (
//                     <div key={motor}>
//                       <div className="font-medium text-slate-700">{motor}</div>
//                       <button
//                         onClick={() => alert(`${motor} Up`)}
//                         className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
//                       >
//                         ▲
//                       </button>
//                       <button
//                         onClick={() => alert(`${motor} Down`)}
//                         className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
//                       >
//                         ▼
//                       </button>
//                     </div>
//                   ))}
//                   <div className="space-y-2">
//                     <button
//                       onClick={() => alert("All Up")}
//                       className="w-full bg-green-600 text-white text-sm py-2 rounded"
//                     >
//                       All Up
//                     </button>
//                     <button
//                       onClick={() => alert("All Down")}
//                       className="w-full bg-red-600 text-white text-sm py-2 rounded"
//                     >
//                       All Down
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Stabilization */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   ⚖️ Stabilization
//                 </h3>
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <button
//                     onClick={() => setStabilizationActive(true)}
//                     className={`flex-1 py-3 rounded font-medium text-white transition ${
//                       stabilizationActive
//                         ? "bg-green-600"
//                         : "bg-gray-400 hover:bg-gray-500"
//                     }`}
//                   >
//                     Start Stabilize
//                   </button>
//                   <button
//                     onClick={() => setStabilizationActive(false)}
//                     className={`flex-1 py-3 rounded font-medium text-white transition ${
//                       !stabilizationActive
//                         ? "bg-red-600"
//                         : "bg-gray-400 hover:bg-gray-500"
//                     }`}
//                   >
//                     Stop Stabilize
//                   </button>
//                 </div>
//               </div>

//               {/* Pan/Tilt */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   🔄 Pan / Tilt
//                 </h3>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700">
//                       Pan ({panValue}°)
//                     </label>
//                     <input
//                       type="range"
//                       min="0"
//                       max="180"
//                       value={panValue}
//                       onChange={(e) => setPanValue(Number(e.target.value))}
//                       className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700">
//                       Tilt ({tiltValue}°)
//                     </label>
//                     <input
//                       type="range"
//                       min="0"
//                       max="180"
//                       value={tiltValue}
//                       onChange={(e) => setTiltValue(Number(e.target.value))}
//                       className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                   </div>
//                   <button
//                     onClick={() => {
//                       setPanValue(90);
//                       setTiltValue(90);
//                     }}
//                     className="w-full bg-blue-600 text-white py-2 rounded font-medium"
//                   >
//                     Center
//                   </button>
//                 </div>
//               </div>

//               {/* Obstacle Detection */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   🚨 Obstacle Detection
//                 </h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                   {Object.entries(obstacleSignals).map(([dir, active]) => (
//                     <div
//                       key={dir}
//                       className={`p-3 rounded-lg text-center font-medium text-white ${
//                         active ? "bg-green-600" : "bg-gray-500"
//                       }`}
//                     >
//                       {dir.charAt(0).toUpperCase() + dir.slice(1)}
//                       <div className="text-xs mt-1">
//                         {active ? "Detected" : "Clear"}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//.4321
//
// new claude version with image and video popups
// "use client";
// import { useEffect, useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";
// import {
//   ArrowUp,
//   ArrowDown,
//   ArrowLeft,
//   ArrowRight,
//   RotateCw,
//   RotateCcw,
//   X,
//   Play,
//   Pause,
//   FastForward,
//   Rewind,
// } from "lucide-react";
// // import { sendMotorCommand } from "@/services/esp32Api"; // Import our JS API
// import { sendMotorCommand } from "@/src/services/esp32Api";
// import { sendActuatorCommand } from "@/src/services/actuator";

// export default function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const modalVideoRef = useRef(null);
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

//   // Modal states - NEW ADDITION
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [showVideoModal, setShowVideoModal] = useState(false);
//   const [selectedImage, setSelectedImage] = useState("");
//   const [selectedVideo, setSelectedVideo] = useState("");
//   const [videoPlaying, setVideoPlaying] = useState(false);

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
//     console.log("imageRes", imgRes);
//     console.log("videoRes", vidRes);
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     console.log("imgdata", imgData);
//     console.log("vidData", vidData);

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

//   // Enhanced motor control handlers
//   const handleDirectionClick = (direction) => {
//     console.log(`Sending Base Control ESP32 command: ${direction}`);

//     sendMotorCommand(direction, 100)
//       .then((response) => {
//         console.log(`Base Control ESP32 response: ${response}`);
//       })
//       .catch((error) => {
//         console.error("Base Control command failed:", error);
//       });
//   };

//   const handleButtonDown = (direction) => {
//     handleDirectionClick(direction);
//   };

//   const handleButtonUp = () => {
//     handleDirectionClick("stop");
//   };

//   // Media modal handlers - NEW ADDITION
//   const openImageModal = (imageSrc) => {
//     setSelectedImage(imageSrc);
//     setShowImageModal(true);
//   };

//   const closeImageModal = () => {
//     setShowImageModal(false);
//     setSelectedImage("");
//   };

//   const openVideoModal = (videoSrc) => {
//     setSelectedVideo(videoSrc);
//     setShowVideoModal(true);
//     setVideoPlaying(false);
//   };

//   const closeVideoModal = () => {
//     setShowVideoModal(false);
//     setSelectedVideo("");
//     setVideoPlaying(false);
//     if (modalVideoRef.current) {
//       modalVideoRef.current.pause();
//     }
//   };

//   const toggleVideoPlayback = () => {
//     if (modalVideoRef.current) {
//       if (videoPlaying) {
//         modalVideoRef.current.pause();
//       } else {
//         modalVideoRef.current.play();
//       }
//       setVideoPlaying(!videoPlaying);
//     }
//   };

//   const fastForwardVideo = () => {
//     if (modalVideoRef.current) {
//       modalVideoRef.current.currentTime += 10;
//     }
//   };

//   const rewindVideo = () => {
//     if (modalVideoRef.current) {
//       modalVideoRef.current.currentTime -= 10;
//     }
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
//       <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
//           <h1 className="text-2xl font-bold">📹 Tripod Control Panel</h1>
//           <p className="text-blue-100 text-sm">Live Stream & Full Controls</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-5">
//           {/* Video Stream Section */}
//           <div className="lg:col-span-1 space-y-4">
//             <div
//               className={`text-center py-2 rounded-lg text-sm font-medium ${
//                 connected
//                   ? "bg-green-100 text-green-800"
//                   : "bg-red-100 text-red-800"
//               }`}
//             >
//               {connected ? "🟢 Connected" : "🔴 Not Connected"}
//             </div>

//             <div className="aspect-video bg-black rounded-xl overflow-hidden">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             <div className="text-center py-2 text-sm font-semibold text-slate-700">
//               🧭 {direction}
//             </div>

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
//                     onClick={() => sendMotorCommand("reboot")}
//                     className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition"
//                   >
//                     🔁
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Media Gallery (Mini) - ENHANCED WITH POPUP FUNCTIONALITY */}
//           <div>
//             <h3 className="text-sm font-semibold mb-2 text-center">📷 Media</h3>
//             <div className="flex gap-1 overflow-x-auto py-1 max-w-full">
//               {images.slice(-4).map((img, i) => (
//                 <img
//                   key={i}
//                   src={img}
//                   alt="img"
//                   className="w-16 h-16 object-cover rounded border flex-shrink-0 cursor-pointer hover:opacity-80 transition"
//                   onClick={() => openImageModal(img)}
//                 />
//               ))}
//               {videos.slice(-4).map((vid, i) => (
//                 <div
//                   key={i}
//                   className="relative w-16 h-16 cursor-pointer hover:opacity-80 transition"
//                   onClick={() => openVideoModal(vid)}
//                 >
//                   <video
//                     src={vid}
//                     className="w-full h-full object-cover rounded border flex-shrink-0"
//                   />
//                   <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
//                     <Play className="text-white" size={16} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Controls Section */}
//           <div className="lg:col-span-3 space-y-5">
//             {/* Omnidirectional Base */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 🔄 Omnidirectional Base
//               </h3>
//               <div className="grid grid-cols-3 gap-3 max-w-48 mx-auto">
//                 {/* Top row */}
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("rLeft")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("rLeft")}
//                   onTouchEnd={handleButtonUp}
//                   title="Rotate Left"
//                 >
//                   <RotateCcw size={24} />
//                 </div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("forward")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("forward")}
//                   onTouchEnd={handleButtonUp}
//                   title="Move Forward"
//                 >
//                   <ArrowUp size={28} />
//                 </div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("rRight")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("rRight")}
//                   onTouchEnd={handleButtonUp}
//                   title="Rotate Right"
//                 >
//                   <RotateCw size={24} />
//                 </div>

//                 {/* Middle row */}
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("left")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("left")}
//                   onTouchEnd={handleButtonUp}
//                   title="Strafe Left"
//                 >
//                   <ArrowLeft size={28} />
//                 </div>
//                 <div
//                   className="bg-gray-500 text-white text-xl rounded-lg py-3 flex items-center justify-center"
//                   title="Base Center"
//                 >
//                   <span className="w-2 h-2 rounded-full bg-white"></span>
//                 </div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("right")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("right")}
//                   onTouchEnd={handleButtonUp}
//                   title="Strafe Right"
//                 >
//                   <ArrowRight size={28} />
//                 </div>

//                 {/* Bottom row */}
//                 <div></div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("backward")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("backward")}
//                   onTouchEnd={handleButtonUp}
//                   title="Move Backward"
//                 >
//                   <ArrowDown size={28} />
//                 </div>
//                 <div></div>
//               </div>

//               <div className="mt-4 text-center">
//                 <p className="text-xs text-gray-500">
//                   3-Motor Omnidirectional Base Control
//                 </p>
//               </div>
//             </div>

//             {/* Two Column Layout for Additional Controls */}
//             <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
//               {/* Height Controls */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   📏 Height Control (Motors)
//                 </h3>
//                 <div className="grid grid-cols-4 gap-3 text-center">
//                   {["m1", "m2", "m3"].map((motor, i) => (
//                     <div key={motor}>
//                       <div className="font-medium text-slate-700">{motor}</div>
//                       <button
//                         onClick={() => sendActuatorCommand(motor, "up")}
//                         className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
//                       >
//                         ▲
//                       </button>
//                       <button
//                         onClick={() => sendActuatorCommand(motor, "down")}
//                         className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
//                       >
//                         ▼
//                       </button>
//                     </div>
//                   ))}
//                   <div className="space-y-2">
//                     <button
//                       onClick={() => sendActuatorCommand("all", "up")}
//                       className="w-full bg-green-600 text-white text-sm py-2 rounded"
//                     >
//                       All Up
//                     </button>
//                     <button
//                       onClick={() => sendActuatorCommand("all", "up")}
//                       className="w-full bg-red-600 text-white text-sm py-2 rounded"
//                     >
//                       All Down
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Stabilization */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   ⚖️ Stabilization
//                 </h3>
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <button
//                     onClick={() => {
//                       setStabilizationActive(true);
//                       sendActuatorCommand("stabilize", "start");
//                     }}
//                     className={`flex-1 py-3 rounded font-medium text-white transition ${
//                       stabilizationActive
//                         ? "bg-green-600"
//                         : "bg-gray-400 hover:bg-gray-500"
//                     }`}
//                   >
//                     Start Stabilize
//                   </button>
//                   <button
//                     onClick={() => {
//                       setStabilizationActive(false);
//                       sendActuatorCommand("stabilize", "stop");
//                     }}
//                     className={`flex-1 py-3 rounded font-medium text-white transition ${
//                       !stabilizationActive
//                         ? "bg-red-600"
//                         : "bg-gray-400 hover:bg-gray-500"
//                     }`}
//                   >
//                     Stop Stabilize
//                   </button>
//                 </div>
//               </div>

//               {/* Obstacle Detection */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   🚨 Obstacle Detection
//                 </h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                   {Object.entries(obstacleSignals).map(([dir, active]) => (
//                     <div
//                       key={dir}
//                       className={`p-3 rounded-lg text-center font-medium text-white ${
//                         active ? "bg-green-600" : "bg-gray-500"
//                       }`}
//                     >
//                       {dir.charAt(0).toUpperCase() + dir.slice(1)}
//                       <div className="text-xs mt-1">
//                         {active ? "Detected" : "Clear"}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Image Modal - NEW ADDITION */}
//       {showImageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//           <div className="relative max-w-4xl max-h-full">
//             <button
//               onClick={closeImageModal}
//               className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
//             >
//               <X size={32} />
//             </button>
//             <img
//               src={selectedImage}
//               alt="Full size"
//               className="max-w-full max-h-screen object-contain rounded-lg"
//             />
//           </div>
//         </div>
//       )}

//       {/* Video Modal - NEW ADDITION */}
//       {showVideoModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//           <div className="relative max-w-4xl max-h-full">
//             <button
//               onClick={closeVideoModal}
//               className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
//             >
//               <X size={32} />
//             </button>
//             <div className="relative">
//               <video
//                 ref={modalVideoRef}
//                 src={selectedVideo}
//                 className="max-w-full max-h-screen object-contain rounded-lg"
//                 onPlay={() => setVideoPlaying(true)}
//                 onPause={() => setVideoPlaying(false)}
//               />
//               <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black bg-opacity-50 rounded-lg p-3">
//                 <button
//                   onClick={rewindVideo}
//                   className="text-white hover:text-gray-300 transition"
//                   title="Rewind 10s"
//                 >
//                   <Rewind size={24} />
//                 </button>
//                 <button
//                   onClick={toggleVideoPlayback}
//                   className="text-white hover:text-gray-300 transition"
//                   title={videoPlaying ? "Pause" : "Play"}
//                 >
//                   {videoPlaying ? <Pause size={24} /> : <Play size={24} />}
//                 </button>
//                 <button
//                   onClick={fastForwardVideo}
//                   className="text-white hover:text-gray-300 transition"
//                   title="Fast Forward 10s"
//                 >
//                   <FastForward size={24} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

//
//
//
//
//newest version with panaroma with claude
// "use client";
// import { useEffect, useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";
// import {
//   ArrowUp,
//   ArrowDown,
//   ArrowLeft,
//   ArrowRight,
//   RotateCw,
//   RotateCcw,
//   X,
//   Play,
//   Pause,
//   FastForward,
//   Rewind,
//   Camera,
//   Panorama,
// } from "lucide-react";
// // import { sendMotorCommand } from "@/services/esp32Api"; // Import our JS API
// import { sendMotorCommand } from "@/src/services/esp32Api";
// import { sendActuatorCommand } from "@/src/services/actuator";

// function DesktopViewPage() {
//   const videoRef = useRef(null);
//   const modalVideoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const previousX = useRef(null);
//   const panoramaCanvasRef = useRef(null);

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

//   // Modal states - NEW ADDITION
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [showVideoModal, setShowVideoModal] = useState(false);
//   const [selectedImage, setSelectedImage] = useState("");
//   const [selectedVideo, setSelectedVideo] = useState("");
//   const [videoPlaying, setVideoPlaying] = useState(false);

//   // Panorama states - NEW ADDITION
//   const [panoramaCapturing, setPanoramaCapturing] = useState(false);
//   const [panoramaProgress, setPanoramaProgress] = useState(0);
//   const [panoramaImages, setPanoramaImages] = useState([]);

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
//     console.log("imageRes", imgRes);
//     console.log("videoRes", vidRes);
//     const imgData = await imgRes.json();
//     const vidData = await vidRes.json();
//     console.log("imgdata", imgData);
//     console.log("vidData", vidData);

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

//   // Panorama capture function - NEW ADDITION
//   const capturePanorama = async () => {
//     if (!videoRef.current || panoramaCapturing) return;

//     setPanoramaCapturing(true);
//     setPanoramaProgress(0);
//     setPanoramaImages([]);

//     const totalSteps = 8; // Number of images to capture (45 degrees each = 360 degrees)
//     const rotationAngle = 45; // Degrees to rotate between each capture
//     const captureDelay = 2000; // Wait 2 seconds between rotation and capture for stabilization

//     const capturedImages = [];

//     try {
//       for (let step = 0; step < totalSteps; step++) {
//         // Update progress
//         setPanoramaProgress((step / totalSteps) * 100);

//         // Wait for stabilization before capturing
//         if (step > 0) {
//           await new Promise((resolve) => setTimeout(resolve, captureDelay));
//         }

//         // Capture current frame
//         const canvas = document.createElement("canvas");
//         const video = videoRef.current;
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//         // Convert to blob and store
//         const blob = await new Promise((resolve) => {
//           canvas.toBlob(resolve, "image/png");
//         });

//         capturedImages.push(blob);
//         setPanoramaImages((prev) => [...prev, URL.createObjectURL(blob)]);

//         // Rotate for next capture (except on last step)
//         if (step < totalSteps - 1) {
//           // Send rotation command
//           await sendMotorCommand("rRight", 100);
//           await new Promise((resolve) => setTimeout(resolve, 1000)); // Rotation time
//           await sendMotorCommand("stop");
//         }
//       }

//       // Stitch images together
//       await stitchPanorama(capturedImages);
//     } catch (error) {
//       console.error("Panorama capture failed:", error);
//     } finally {
//       setPanoramaCapturing(false);
//       setPanoramaProgress(100);

//       // Clean up temporary URLs
//       setTimeout(() => {
//         panoramaImages.forEach((url) => URL.revokeObjectURL(url));
//         setPanoramaImages([]);
//         setPanoramaProgress(0);
//       }, 3000);
//     }
//   };

//   // Stitch panorama images - NEW ADDITION
//   const stitchPanorama = async (imageBlobs) => {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     // Load all images
//     const images = await Promise.all(
//       imageBlobs.map((blob) => {
//         return new Promise((resolve) => {
//           const img = new Image();
//           img.onload = () => resolve(img);
//           img.src = URL.createObjectURL(blob);
//         });
//       })
//     );

//     // Calculate canvas size for panorama
//     const imageWidth = images[0].width;
//     const imageHeight = images[0].height;
//     const overlapRatio = 0.2; // 20% overlap between images

//     canvas.width =
//       imageWidth * images.length * (1 - overlapRatio) +
//       imageWidth * overlapRatio;
//     canvas.height = imageHeight;

//     // Draw images with overlap
//     let xOffset = 0;
//     images.forEach((img, index) => {
//       ctx.drawImage(img, xOffset, 0, imageWidth, imageHeight);
//       xOffset += imageWidth * (1 - overlapRatio);

//       // Clean up temporary URL
//       URL.revokeObjectURL(img.src);
//     });

//     // Convert to blob and save
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, `panorama_${Date.now()}.png`);
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

//   // Enhanced motor control handlers
//   const handleDirectionClick = (direction) => {
//     console.log(`Sending Base Control ESP32 command: ${direction}`);

//     sendMotorCommand(direction, 100)
//       .then((response) => {
//         console.log(`Base Control ESP32 response: ${response}`);
//       })
//       .catch((error) => {
//         console.error("Base Control command failed:", error);
//       });
//   };

//   const handleButtonDown = (direction) => {
//     handleDirectionClick(direction);
//   };

//   const handleButtonUp = () => {
//     handleDirectionClick("stop");
//   };

//   // Media modal handlers - NEW ADDITION
//   const openImageModal = (imageSrc) => {
//     setSelectedImage(imageSrc);
//     setShowImageModal(true);
//   };

//   const closeImageModal = () => {
//     setShowImageModal(false);
//     setSelectedImage("");
//   };

//   const openVideoModal = (videoSrc) => {
//     setSelectedVideo(videoSrc);
//     setShowVideoModal(true);
//     setVideoPlaying(false);
//   };

//   const closeVideoModal = () => {
//     setShowVideoModal(false);
//     setSelectedVideo("");
//     setVideoPlaying(false);
//     if (modalVideoRef.current) {
//       modalVideoRef.current.pause();
//     }
//   };

//   const toggleVideoPlayback = () => {
//     if (modalVideoRef.current) {
//       if (videoPlaying) {
//         modalVideoRef.current.pause();
//       } else {
//         modalVideoRef.current.play();
//       }
//       setVideoPlaying(!videoPlaying);
//     }
//   };

//   const fastForwardVideo = () => {
//     if (modalVideoRef.current) {
//       modalVideoRef.current.currentTime += 10;
//     }
//   };

//   const rewindVideo = () => {
//     if (modalVideoRef.current) {
//       modalVideoRef.current.currentTime -= 10;
//     }
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
//       <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
//           <h1 className="text-2xl font-bold">📹 Tripod Control Panel</h1>
//           <p className="text-blue-100 text-sm">Live Stream & Full Controls</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-5">
//           {/* Video Stream Section */}
//           <div className="lg:col-span-1 space-y-4">
//             <div
//               className={`text-center py-2 rounded-lg text-sm font-medium ${
//                 connected
//                   ? "bg-green-100 text-green-800"
//                   : "bg-red-100 text-red-800"
//               }`}
//             >
//               {connected ? "🟢 Connected" : "🔴 Not Connected"}
//             </div>

//             <div className="aspect-video bg-black rounded-xl overflow-hidden">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             <div className="text-center py-2 text-sm font-semibold text-slate-700">
//               🧭 {direction}
//             </div>

//             {/* Panorama Progress Bar - NEW ADDITION */}
//             {panoramaCapturing && (
//               <div className="bg-blue-50 p-3 rounded-lg">
//                 <div className="text-center text-sm font-medium text-blue-800 mb-2">
//                   📸 Capturing Panorama... {Math.round(panoramaProgress)}%
//                 </div>
//                 <div className="w-full bg-blue-200 rounded-full h-2">
//                   <div
//                     className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${panoramaProgress}%` }}
//                   ></div>
//                 </div>
//                 <div className="flex gap-1 mt-2 justify-center">
//                   {panoramaImages.map((img, i) => (
//                     <img
//                       key={i}
//                       src={img}
//                       className="w-8 h-8 object-cover rounded border"
//                       alt={`Panorama ${i + 1}`}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="grid grid-cols-4 gap-2">
//               {!connected ? (
//                 <button
//                   onClick={initConnection}
//                   className="col-span-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition"
//                 >
//                   🔌 Connect
//                 </button>
//               ) : (
//                 <>
//                   <button
//                     onClick={captureImage}
//                     className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm font-medium transition"
//                     title="Capture Image"
//                   >
//                     <Camera size={16} className="mx-auto" />
//                   </button>
//                   <button
//                     onClick={capturePanorama}
//                     disabled={panoramaCapturing}
//                     className={`${
//                       panoramaCapturing
//                         ? "bg-gray-400 cursor-not-allowed"
//                         : "bg-purple-600 hover:bg-purple-700"
//                     } text-white py-2 rounded text-sm font-medium transition`}
//                     title="Capture Panorama"
//                   >
//                     <Panorama size={16} className="mx-auto" />
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
//                     onClick={() => sendMotorCommand("reboot")}
//                     className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition"
//                   >
//                     🔁
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Media Gallery (Mini) - ENHANCED WITH POPUP FUNCTIONALITY */}
//           <div>
//             <h3 className="text-sm font-semibold mb-2 text-center">📷 Media</h3>
//             <div className="flex gap-1 overflow-x-auto py-1 max-w-full">
//               {images.slice(-4).map((img, i) => (
//                 <img
//                   key={i}
//                   src={img}
//                   alt="img"
//                   className="w-16 h-16 object-cover rounded border flex-shrink-0 cursor-pointer hover:opacity-80 transition"
//                   onClick={() => openImageModal(img)}
//                 />
//               ))}
//               {videos.slice(-4).map((vid, i) => (
//                 <div
//                   key={i}
//                   className="relative w-16 h-16 cursor-pointer hover:opacity-80 transition"
//                   onClick={() => openVideoModal(vid)}
//                 >
//                   <video
//                     src={vid}
//                     className="w-full h-full object-cover rounded border flex-shrink-0"
//                   />
//                   <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
//                     <Play className="text-white" size={16} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Controls Section */}
//           <div className="lg:col-span-3 space-y-5">
//             {/* Omnidirectional Base */}
//             <div className="bg-slate-50 p-4 rounded-xl border">
//               <h3 className="text-center font-semibold text-slate-700 mb-3">
//                 🔄 Omnidirectional Base
//               </h3>
//               <div className="grid grid-cols-3 gap-3 max-w-48 mx-auto">
//                 {/* Top row */}
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("rLeft")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("rLeft")}
//                   onTouchEnd={handleButtonUp}
//                   title="Rotate Left"
//                 >
//                   <RotateCcw size={24} />
//                 </div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("forward")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("forward")}
//                   onTouchEnd={handleButtonUp}
//                   title="Move Forward"
//                 >
//                   <ArrowUp size={28} />
//                 </div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("rRight")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("rRight")}
//                   onTouchEnd={handleButtonUp}
//                   title="Rotate Right"
//                 >
//                   <RotateCw size={24} />
//                 </div>

//                 {/* Middle row */}
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("left")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("left")}
//                   onTouchEnd={handleButtonUp}
//                   title="Strafe Left"
//                 >
//                   <ArrowLeft size={28} />
//                 </div>
//                 <div
//                   className="bg-gray-500 text-white text-xl rounded-lg py-3 flex items-center justify-center"
//                   title="Base Center"
//                 >
//                   <span className="w-2 h-2 rounded-full bg-white"></span>
//                 </div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("right")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("right")}
//                   onTouchEnd={handleButtonUp}
//                   title="Strafe Right"
//                 >
//                   <ArrowRight size={28} />
//                 </div>

//                 {/* Bottom row */}
//                 <div></div>
//                 <div
//                   className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
//                   onMouseDown={() => handleButtonDown("backward")}
//                   onMouseUp={handleButtonUp}
//                   onTouchStart={() => handleButtonDown("backward")}
//                   onTouchEnd={handleButtonUp}
//                   title="Move Backward"
//                 >
//                   <ArrowDown size={28} />
//                 </div>
//                 <div></div>
//               </div>

//               <div className="mt-4 text-center">
//                 <p className="text-xs text-gray-500">
//                   3-Motor Omnidirectional Base Control
//                 </p>
//               </div>
//             </div>

//             {/* Two Column Layout for Additional Controls */}
//             <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
//               {/* Height Controls */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   📏 Height Control (Motors)
//                 </h3>
//                 <div className="grid grid-cols-4 gap-3 text-center">
//                   {["m1", "m2", "m3"].map((motor, i) => (
//                     <div key={motor}>
//                       <div className="font-medium text-slate-700">{motor}</div>
//                       <button
//                         onClick={() => sendActuatorCommand(motor, "up")}
//                         className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
//                       >
//                         ▲
//                       </button>
//                       <button
//                         onClick={() => sendActuatorCommand(motor, "down")}
//                         className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
//                       >
//                         ▼
//                       </button>
//                     </div>
//                   ))}
//                   <div className="space-y-2">
//                     <button
//                       onClick={() => sendActuatorCommand("all", "up")}
//                       className="w-full bg-green-600 text-white text-sm py-2 rounded"
//                     >
//                       All Up
//                     </button>
//                     <button
//                       onClick={() => sendActuatorCommand("all", "up")}
//                       className="w-full bg-red-600 text-white text-sm py-2 rounded"
//                     >
//                       All Down
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Stabilization */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   ⚖️ Stabilization
//                 </h3>
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <button
//                     onClick={() => {
//                       setStabilizationActive(true);
//                       sendActuatorCommand("stabilize", "start");
//                     }}
//                     className={`flex-1 py-3 rounded font-medium text-white transition ${
//                       stabilizationActive
//                         ? "bg-green-600"
//                         : "bg-gray-400 hover:bg-gray-500"
//                     }`}
//                   >
//                     Start Stabilize
//                   </button>
//                   <button
//                     onClick={() => {
//                       setStabilizationActive(false);
//                       sendActuatorCommand("stabilize", "stop");
//                     }}
//                     className={`flex-1 py-3 rounded font-medium text-white transition ${
//                       !stabilizationActive
//                         ? "bg-red-600"
//                         : "bg-gray-400 hover:bg-gray-500"
//                     }`}
//                   >
//                     Stop Stabilize
//                   </button>
//                 </div>
//               </div>

//               {/* Obstacle Detection */}
//               <div className="bg-slate-50 p-4 rounded-xl border">
//                 <h3 className="text-center font-semibold text-slate-700 mb-3">
//                   🚨 Obstacle Detection
//                 </h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                   {Object.entries(obstacleSignals).map(([dir, active]) => (
//                     <div
//                       key={dir}
//                       className={`p-3 rounded-lg text-center font-medium text-white ${
//                         active ? "bg-green-600" : "bg-gray-500"
//                       }`}
//                     >
//                       {dir.charAt(0).toUpperCase() + dir.slice(1)}
//                       <div className="text-xs mt-1">
//                         {active ? "Detected" : "Clear"}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Image Modal - NEW ADDITION */}
//       {showImageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//           <div className="relative max-w-4xl max-h-full">
//             <button
//               onClick={closeImageModal}
//               className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
//             >
//               <X size={32} />
//             </button>
//             <img
//               src={selectedImage}
//               alt="Full size"
//               className="max-w-full max-h-screen object-contain rounded-lg"
//             />
//           </div>
//         </div>
//       )}

//       {/* Video Modal - NEW ADDITION */}
//       {showVideoModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//           <div className="relative max-w-4xl max-h-full">
//             <button
//               onClick={closeVideoModal}
//               className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
//             >
//               <X size={32} />
//             </button>
//             <div className="relative">
//               <video
//                 ref={modalVideoRef}
//                 src={selectedVideo}
//                 className="max-w-full max-h-screen object-contain rounded-lg"
//                 onPlay={() => setVideoPlaying(true)}
//                 onPause={() => setVideoPlaying(false)}
//               />
//               <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black bg-opacity-50 rounded-lg p-3">
//                 <button
//                   onClick={rewindVideo}
//                   className="text-white hover:text-gray-300 transition"
//                   title="Rewind 10s"
//                 >
//                   <Rewind size={24} />
//                 </button>
//                 <button
//                   onClick={toggleVideoPlayback}
//                   className="text-white hover:text-gray-300 transition"
//                   title={videoPlaying ? "Pause" : "Play"}
//                 >
//                   {videoPlaying ? <Pause size={24} /> : <Play size={24} />}
//                 </button>
//                 <button
//                   onClick={fastForwardVideo}
//                   className="text-white hover:text-gray-300 transition"
//                   title="Fast Forward 10s"
//                 >
//                   <FastForward size={24} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DesktopViewPage;

//
//
//
//
//
// new version with deepseek
// panaroma features
"use client";
import { useEffect, useRef, useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  RotateCcw,
  X,
  Play,
  Pause,
  FastForward,
  Rewind,
  Camera,
} from "lucide-react";
import { sendMotorCommand } from "@/src/services/esp32Api";
import { sendActuatorCommand } from "@/src/services/actuator";

export default function DesktopViewPage() {
  const videoRef = useRef(null);
  const modalVideoRef = useRef(null);
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
  const [capturingPanorama, setCapturingPanorama] = useState(false);
  const [panoramaProgress, setPanoramaProgress] = useState(0);

  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVideo, setSelectedVideo] = useState("");
  const [videoPlaying, setVideoPlaying] = useState(false);

  images ? console.log(images) : null;

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

  // const capturePanorama = async () => {
  //   setCapturingPanorama(true);
  //   setPanoramaProgress(0);

  //   try {
  //     const frames = [];
  //     const steps = 18; // Capture every 20 degrees for 360° panorama
  //     const canvas = document.createElement("canvas");
  //     const video = videoRef.current;
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  //     const ctx = canvas.getContext("2d");

  //     // Move to starting position (far left)
  //     // await sendActuatorCommand("pan", "left", 180);
  //     await new Promise((resolve) => setTimeout(resolve, 2000));

  //     // Capture frames while panning
  //     for (let i = 0; i < steps; i++) {
  //       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  //       const frameBlob = await new Promise((resolve) =>
  //         canvas.toBlob(resolve, "image/jpeg", 0.8)
  //       );
  //       frames.push(frameBlob);

  //       setPanoramaProgress(Math.round(((i + 1) / steps) * 100));

  //       // Pan right by 20 degrees
  //       // await sendActuatorCommand("pan", "right", 20);
  //       await new Promise((resolve) => setTimeout(resolve, 1000));
  //     }

  //     // Reset pan position
  //     // await sendActuatorCommand("pan", "center");

  //     // Upload individual frames
  //     for (let i = 0; i < frames.length; i++) {
  //       const formData = new FormData();
  //       formData.append("file", frames[i], `panorama_${Date.now()}_${i}.jpg`);
  //       await fetch("/api/save-image", { method: "POST", body: formData });
  //     }

  //     // Optionally: Call panorama stitching API
  //     // const stitchResponse = await fetch("/api/stitch-panorama", {
  //     //   method: "POST",
  //     //   headers: { "Content-Type": "application/json" },
  //     //   body: JSON.stringify({ frames })
  //     // });

  //     fetchMedia();
  //   } catch (error) {
  //     console.error("Panorama capture failed:", error);
  //   } finally {
  //     setCapturingPanorama(false);
  //     setPanoramaProgress(0);
  //   }
  // };

  const capturePanorama = async () => {
    setCapturingPanorama(true);
    setPanoramaProgress(0);

    try {
      const frames = [];
      const steps = 18; // Capture every 20 degrees for 360° panorama
      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      // Move to starting position (far left)
      // await sendActuatorCommand("pan", "left", 180);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Capture frames while panning
      for (let i = 0; i < steps; i++) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.8)
        );
        frames.push(frameBlob);

        setPanoramaProgress(Math.round(((i + 1) / steps) * 100));

        // Pan right by 20 degrees
        // await sendActuatorCommand("pan", "right", 20);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Reset pan position
      // await sendActuatorCommand("pan", "center");

      // Create panorama canvas (width is frame width * number of frames)
      const panoramaCanvas = document.createElement("canvas");
      panoramaCanvas.width = canvas.width * frames.length;
      panoramaCanvas.height = canvas.height;
      const panoramaCtx = panoramaCanvas.getContext("2d");

      // Stitch frames horizontally
      let xPos = 0;
      for (const frameBlob of frames) {
        const img = await createImageBitmap(frameBlob);
        panoramaCtx.drawImage(img, xPos, 0);
        xPos += img.width;
      }

      // Convert panorama to blob and upload
      panoramaCanvas.toBlob(
        async (panoramaBlob) => {
          const formData = new FormData();
          formData.append("file", panoramaBlob, `panorama_${Date.now()}.jpg`);
          await fetch("/api/save-image", { method: "POST", body: formData });
          fetchMedia();
        },
        "image/jpeg",
        0.9
      );
    } catch (error) {
      console.error("Panorama capture failed:", error);
    } finally {
      setCapturingPanorama(false);
      setPanoramaProgress(0);
    }
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

  const handleDirectionClick = (direction) => {
    console.log(`Sending Base Control ESP32 command: ${direction}`);

    sendMotorCommand(direction, 100)
      .then((response) => {
        console.log(`Base Control ESP32 response: ${response}`);
      })
      .catch((error) => {
        console.error("Base Control command failed:", error);
      });
  };

  const handleButtonDown = (direction) => {
    handleDirectionClick(direction);
  };

  const handleButtonUp = () => {
    handleDirectionClick("stop");
  };

  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage("");
  };

  const openVideoModal = (videoSrc) => {
    setSelectedVideo(videoSrc);
    setShowVideoModal(true);
    setVideoPlaying(false);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo("");
    setVideoPlaying(false);
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
  };

  const toggleVideoPlayback = () => {
    if (modalVideoRef.current) {
      if (videoPlaying) {
        modalVideoRef.current.pause();
      } else {
        modalVideoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const fastForwardVideo = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime += 10;
    }
  };

  const rewindVideo = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime -= 10;
    }
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
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 text-center">
          <h1 className="text-2xl font-bold">📹 Tripod Control Panel</h1>
          <p className="text-blue-100 text-sm">Live Stream & Full Controls</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-5">
          {/* Video Stream Section */}
          <div className="lg:col-span-1 space-y-4">
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

            <div className="grid grid-cols-4 gap-2">
              {!connected ? (
                <button
                  onClick={initConnection}
                  className="col-span-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition"
                >
                  🔌 Connect
                </button>
              ) : (
                <>
                  <button
                    onClick={captureImage}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm font-medium transition"
                    title="Capture Photo"
                  >
                    📸
                  </button>
                  <button
                    onClick={capturePanorama}
                    disabled={capturingPanorama}
                    className={`${
                      capturingPanorama
                        ? "bg-purple-600"
                        : "bg-purple-600 hover:bg-purple-700"
                    } text-white py-2 rounded text-sm font-medium transition flex items-center justify-center`}
                    title="Capture Panorama"
                  >
                    {capturingPanorama ? (
                      <span className="text-xs">{panoramaProgress}%</span>
                    ) : (
                      <Camera size={18} />
                    )}
                  </button>
                  {!recording ? (
                    <button
                      onClick={startRecording}
                      className="bg-amber-500 hover:bg-amber-600 text-white py-2 rounded text-sm font-medium transition"
                      title="Start Recording"
                    >
                      ⏺️
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-medium transition"
                      title="Stop Recording"
                    >
                      ⏹️
                    </button>
                  )}
                  <button
                    onClick={() => sendMotorCommand("reboot")}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition"
                    title="Reboot System"
                  >
                    🔁
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Media Gallery (Mini) */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-center">📷 Media</h3>
            <div className="flex gap-1 overflow-x-auto py-1 max-w-full">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="img"
                  className="w-16 h-16 object-cover rounded border flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                  onClick={() => openImageModal(img)}
                />
              ))}
              {videos.map((vid, i) => (
                <div
                  key={i}
                  className="relative w-16 h-16 cursor-pointer hover:opacity-80 transition"
                  onClick={() => openVideoModal(vid)}
                >
                  <video
                    src={vid}
                    className="w-full h-full object-cover rounded border flex-shrink-0"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                    <Play className="text-white" size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Section */}
          <div className="lg:col-span-3 space-y-5">
            {/* Omnidirectional Base */}
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h3 className="text-center font-semibold text-slate-700 mb-3">
                🔄 Omnidirectional Base
              </h3>
              <div className="grid grid-cols-3 gap-3 max-w-48 mx-auto">
                {/* Top row */}
                <div
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
                  onMouseDown={() => handleButtonDown("rLeft")}
                  onMouseUp={handleButtonUp}
                  onTouchStart={() => handleButtonDown("rLeft")}
                  onTouchEnd={handleButtonUp}
                  title="Rotate Left"
                >
                  <RotateCcw size={24} />
                </div>
                <div
                  className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
                  onMouseDown={() => handleButtonDown("forward")}
                  onMouseUp={handleButtonUp}
                  onTouchStart={() => handleButtonDown("forward")}
                  onTouchEnd={handleButtonUp}
                  title="Move Forward"
                >
                  <ArrowUp size={28} />
                </div>
                <div
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
                  onMouseDown={() => handleButtonDown("rRight")}
                  onMouseUp={handleButtonUp}
                  onTouchStart={() => handleButtonDown("rRight")}
                  onTouchEnd={handleButtonUp}
                  title="Rotate Right"
                >
                  <RotateCw size={24} />
                </div>

                {/* Middle row */}
                <div
                  className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
                  onMouseDown={() => handleButtonDown("left")}
                  onMouseUp={handleButtonUp}
                  onTouchStart={() => handleButtonDown("left")}
                  onTouchEnd={handleButtonUp}
                  title="Strafe Left"
                >
                  <ArrowLeft size={28} />
                </div>
                <div
                  className="bg-gray-500 text-white text-xl rounded-lg py-3 flex items-center justify-center"
                  title="Base Center"
                >
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </div>
                <div
                  className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
                  onMouseDown={() => handleButtonDown("right")}
                  onMouseUp={handleButtonUp}
                  onTouchStart={() => handleButtonDown("right")}
                  onTouchEnd={handleButtonUp}
                  title="Strafe Right"
                >
                  <ArrowRight size={28} />
                </div>

                {/* Bottom row */}
                <div></div>
                <div
                  className="bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-lg py-3 flex items-center justify-center cursor-pointer transition-colors select-none"
                  onMouseDown={() => handleButtonDown("backward")}
                  onMouseUp={handleButtonUp}
                  onTouchStart={() => handleButtonDown("backward")}
                  onTouchEnd={handleButtonUp}
                  title="Move Backward"
                >
                  <ArrowDown size={28} />
                </div>
                <div></div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  3-Motor Omnidirectional Base Control
                </p>
              </div>
            </div>

            {/* Two Column Layout for Additional Controls */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Height Controls */}
              <div className="bg-slate-50 p-4 rounded-xl border">
                <h3 className="text-center font-semibold text-slate-700 mb-3">
                  📏 Height Control (Motors)
                </h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {["m1", "m2", "m3"].map((motor, i) => (
                    <div key={motor}>
                      <div className="font-medium text-slate-700">{motor}</div>
                      <button
                        onClick={() => sendActuatorCommand(motor, "up")}
                        className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => sendActuatorCommand(motor, "down")}
                        className="w-full bg-blue-600 text-white text-lg rounded py-2 mt-1"
                      >
                        ▼
                      </button>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <button
                      onClick={() => sendActuatorCommand("all", "up")}
                      className="w-full bg-green-600 text-white text-sm py-2 rounded"
                    >
                      All Up
                    </button>
                    <button
                      onClick={() => sendActuatorCommand("all", "down")}
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
                      sendActuatorCommand("stabilize", "start");
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
                      sendActuatorCommand("stabilize", "stop");
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

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-screen object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeVideoModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>
            <div className="relative">
              <video
                ref={modalVideoRef}
                src={selectedVideo}
                className="max-w-full max-h-screen object-contain rounded-lg"
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black bg-opacity-50 rounded-lg p-3">
                <button
                  onClick={rewindVideo}
                  className="text-white hover:text-gray-300 transition"
                  title="Rewind 10s"
                >
                  <Rewind size={24} />
                </button>
                <button
                  onClick={toggleVideoPlayback}
                  className="text-white hover:text-gray-300 transition"
                  title={videoPlaying ? "Pause" : "Play"}
                >
                  {videoPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={fastForwardVideo}
                  className="text-white hover:text-gray-300 transition"
                  title="Fast Forward 10s"
                >
                  <FastForward size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
