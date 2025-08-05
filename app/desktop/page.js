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
import {
  Play,
  Square,
  Camera,
  Video,
  Wifi,
  WifiOff,
  Download,
  Trash2,
  Maximize2,
  RotateCcw,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Circle,
  Triangle,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("stream"); // stream, images, videos
  const [fullscreen, setFullscreen] = useState(false);

  // Omnidirectional controls state
  const [isMoving, setIsMoving] = useState(false);
  const [currentDirection, setCurrentDirection] = useState("");

  // Height controls state
  const [motorStates, setMotorStates] = useState({
    motor1: "idle",
    motor2: "idle",
    motor3: "idle",
  });
  const [stabilizing, setStabilizing] = useState(false);

  // Obstacle detection state
  const [obstacles, setObstacles] = useState({
    front: false,
    back: false,
    left: false,
    right: false,
  });

  // Mock data for demo purposes
  useEffect(() => {
    setImages([
      "/api/placeholder/300/200",
      "/api/placeholder/300/200",
      "/api/placeholder/300/200",
    ]);
    setVideos(["video1.webm", "video2.webm"]);
  }, []);

  const initConnection = async () => {
    console.log("💻 Desktop: Initializing WebRTC");
    setConnected(true); // Mock connection for demo
  };

  const captureImage = () => {
    // Mock capture functionality
    console.log("Capturing image...");
  };

  const startRecording = () => {
    setRecording(true);
    console.log("Recording started...");
  };

  const stopRecording = () => {
    setRecording(false);
    console.log("Recording stopped...");
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Omnidirectional control functions
  const handleDirectionPress = (direction) => {
    setIsMoving(true);
    setCurrentDirection(direction);
    console.log(`Moving ${direction}`);
  };

  const handleDirectionRelease = () => {
    setIsMoving(false);
    setCurrentDirection("");
    console.log("Movement stopped");
  };

  // Height control functions
  const handleMotorControl = (motor, direction) => {
    setMotorStates((prev) => ({
      ...prev,
      [motor]: direction,
    }));
    setTimeout(() => {
      setMotorStates((prev) => ({
        ...prev,
        [motor]: "idle",
      }));
    }, 200);
    console.log(`Motor ${motor} moving ${direction}`);
  };

  const handleAllMotors = (direction) => {
    setMotorStates({
      motor1: direction,
      motor2: direction,
      motor3: direction,
    });
    setTimeout(() => {
      setMotorStates({
        motor1: "idle",
        motor2: "idle",
        motor3: "idle",
      });
    }, 200);
    console.log(`All motors moving ${direction}`);
  };

  const toggleStabilization = () => {
    setStabilizing(!stabilizing);
    console.log(`Stabilization ${!stabilizing ? "started" : "stopped"}`);
  };

  const getDirectionColor = () => {
    if (direction.includes("Right")) return "text-green-400";
    if (direction.includes("Left")) return "text-blue-400";
    return "text-yellow-400";
  };

  const getDirectionIcon = () => {
    if (direction.includes("Right")) return "→";
    if (direction.includes("Left")) return "←";
    return "⏸";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Desktop Viewer
              </h1>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  connected
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {connected ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span>{connected ? "Connected" : "Disconnected"}</span>
              </div>

              {/* Movement Status */}
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-700/50 border border-gray-600/50 ${getDirectionColor()}`}
              >
                <span className="text-lg">{getDirectionIcon()}</span>
                <span>{direction}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl mb-6 backdrop-blur-sm">
          {[
            { id: "stream", label: "Live Stream", icon: Video },
            { id: "controls", label: "Controls", icon: Circle },
            { id: "images", label: "Images", icon: Camera },
            { id: "videos", label: "Videos", icon: Play },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Stream Tab */}
        {activeTab === "stream" && (
          <div className="space-y-6">
            {/* Video Container */}
            <div
              className={`relative bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 transition-all duration-300 ${
                fullscreen ? "fixed inset-4 z-50" : ""
              }`}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                controls
                className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-contain bg-black"
                style={{ backgroundColor: "#000" }}
              />

              {/* Video Overlay Controls */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Recording Indicator */}
              {recording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 bg-red-600/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>REC</span>
                </div>
              )}

              {/* Controls Tab */}
              {activeTab === "controls" && (
                <div className="space-y-8">
                  {/* Omnidirectional Base */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold mb-6 text-white flex items-center space-x-2">
                      <Circle className="w-5 h-5 text-blue-400" />
                      <span>Omnidirectional Base</span>
                    </h3>

                    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                      {/* Top Row */}
                      <button
                        onMouseDown={() => handleDirectionPress("rotate-left")}
                        onMouseUp={handleDirectionRelease}
                        onTouchStart={() => handleDirectionPress("rotate-left")}
                        onTouchEnd={handleDirectionRelease}
                        className={`p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-150 active:scale-95 ${
                          currentDirection === "rotate-left"
                            ? "bg-blue-600 scale-95"
                            : ""
                        }`}
                      >
                        <RotateCcw className="w-6 h-6 text-white mx-auto" />
                      </button>

                      <button
                        onMouseDown={() => handleDirectionPress("forward")}
                        onMouseUp={handleDirectionRelease}
                        onTouchStart={() => handleDirectionPress("forward")}
                        onTouchEnd={handleDirectionRelease}
                        className={`p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-150 active:scale-95 ${
                          currentDirection === "forward"
                            ? "bg-blue-600 scale-95"
                            : ""
                        }`}
                      >
                        <ArrowUp className="w-6 h-6 text-white mx-auto" />
                      </button>

                      <button
                        onMouseDown={() => handleDirectionPress("rotate-right")}
                        onMouseUp={handleDirectionRelease}
                        onTouchStart={() =>
                          handleDirectionPress("rotate-right")
                        }
                        onTouchEnd={handleDirectionRelease}
                        className={`p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-150 active:scale-95 ${
                          currentDirection === "rotate-right"
                            ? "bg-blue-600 scale-95"
                            : ""
                        }`}
                      >
                        <RefreshCw className="w-6 h-6 text-white mx-auto" />
                      </button>

                      {/* Middle Row */}
                      <button
                        onMouseDown={() => handleDirectionPress("left")}
                        onMouseUp={handleDirectionRelease}
                        onTouchStart={() => handleDirectionPress("left")}
                        onTouchEnd={handleDirectionRelease}
                        className={`p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-150 active:scale-95 ${
                          currentDirection === "left"
                            ? "bg-blue-600 scale-95"
                            : ""
                        }`}
                      >
                        <ArrowLeft className="w-6 h-6 text-white mx-auto" />
                      </button>

                      <div className="p-4 bg-gray-800 rounded-xl flex items-center justify-center">
                        <div
                          className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                            isMoving ? "bg-blue-400" : "bg-gray-500"
                          }`}
                        ></div>
                      </div>

                      <button
                        onMouseDown={() => handleDirectionPress("right")}
                        onMouseUp={handleDirectionRelease}
                        onTouchStart={() => handleDirectionPress("right")}
                        onTouchEnd={handleDirectionRelease}
                        className={`p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-150 active:scale-95 ${
                          currentDirection === "right"
                            ? "bg-blue-600 scale-95"
                            : ""
                        }`}
                      >
                        <ArrowRight className="w-6 h-6 text-white mx-auto" />
                      </button>

                      {/* Bottom Row */}
                      <div></div>
                      <button
                        onMouseDown={() => handleDirectionPress("backward")}
                        onMouseUp={handleDirectionRelease}
                        onTouchStart={() => handleDirectionPress("backward")}
                        onTouchEnd={handleDirectionRelease}
                        className={`p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-150 active:scale-95 ${
                          currentDirection === "backward"
                            ? "bg-blue-600 scale-95"
                            : ""
                        }`}
                      >
                        <ArrowDown className="w-6 h-6 text-white mx-auto" />
                      </button>
                      <div></div>
                    </div>
                  </div>

                  {/* Height Controls */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold mb-6 text-white flex items-center space-x-2">
                      <Triangle className="w-5 h-5 text-green-400" />
                      <span>Height Controls</span>
                    </h3>

                    {/* Individual Motor Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                      {["motor1", "motor2", "motor3"].map((motor, index) => (
                        <div key={motor} className="text-center">
                          <h4 className="text-sm font-medium text-gray-300 mb-3">
                            Motor {index + 1}
                          </h4>
                          <div className="space-y-2">
                            <button
                              onClick={() => handleMotorControl(motor, "up")}
                              className={`w-full p-3 bg-gray-700 hover:bg-green-600 rounded-lg transition-all duration-150 ${
                                motorStates[motor] === "up"
                                  ? "bg-green-600 scale-95"
                                  : ""
                              }`}
                            >
                              <ArrowUp className="w-5 h-5 text-white mx-auto" />
                            </button>
                            <button
                              onClick={() => handleMotorControl(motor, "down")}
                              className={`w-full p-3 bg-gray-700 hover:bg-red-600 rounded-lg transition-all duration-150 ${
                                motorStates[motor] === "down"
                                  ? "bg-red-600 scale-95"
                                  : ""
                              }`}
                            >
                              <ArrowDown className="w-5 h-5 text-white mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Combined Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => handleAllMotors("up")}
                        className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl text-white font-medium transition-all duration-200"
                      >
                        <ArrowUp className="w-5 h-5" />
                        <span>All Up</span>
                      </button>
                      <button
                        onClick={() => handleAllMotors("down")}
                        className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-medium transition-all duration-200"
                      >
                        <ArrowDown className="w-5 h-5" />
                        <span>All Down</span>
                      </button>
                    </div>

                    {/* Stabilization */}
                    <div className="border-t border-gray-700/50 pt-6">
                      <h4 className="text-lg font-medium text-white mb-4">
                        Stabilization
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={toggleStabilization}
                          className={`flex items-center justify-center space-x-2 p-4 rounded-xl font-medium transition-all duration-200 ${
                            stabilizing
                              ? "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
                              : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                          }`}
                        >
                          <Play className="w-5 h-5" />
                          <span>
                            {stabilizing ? "Stop Stabilize" : "Start Stabilize"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Obstacle Detection */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold mb-6 text-white flex items-center space-x-2">
                      <div className="w-5 h-5 text-orange-400">🚧</div>
                      <span>Obstacle Detection</span>
                      <div className="flex-1"></div>
                      <div className="text-orange-400">📡</div>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(obstacles).map(
                        ([direction, detected]) => (
                          <div
                            key={direction}
                            className={`p-4 rounded-xl border transition-all duration-200 ${
                              detected
                                ? "bg-red-500/20 border-red-500/50 text-red-400"
                                : "bg-green-500/20 border-green-500/50 text-green-400"
                            }`}
                          >
                            <div className="text-center">
                              <div
                                className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                                  detected ? "bg-red-400" : "bg-green-400"
                                }`}
                              ></div>
                              <div className="font-medium capitalize">
                                {direction}
                              </div>
                              <div className="text-sm opacity-75">
                                {detected ? "Obstacle" : "No signal"}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {!connected && (
                <button
                  onClick={initConnection}
                  className="col-span-2 sm:col-span-4 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-600/25"
                >
                  <Wifi className="w-5 h-5" />
                  <span>Connect to Stream</span>
                </button>
              )}

              {connected && (
                <>
                  <button
                    onClick={captureImage}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-600/25"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="hidden sm:inline">Capture</span>
                  </button>

                  {!recording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-600/25"
                    >
                      <div className="w-5 h-5 bg-white rounded-full"></div>
                      <span className="hidden sm:inline">Record</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      <Square className="w-5 h-5" />
                      <span className="hidden sm:inline">Stop</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Captured Images
              </h2>
              <div className="text-sm text-gray-400">
                {images.length} images
              </div>
            </div>

            {images.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No images captured yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start streaming and capture some moments!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="group relative bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <img
                      src={img}
                      className="w-full h-48 object-cover"
                      alt={`Captured ${i + 1}`}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                      <button className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                      Image {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Recorded Videos
              </h2>
              <div className="text-sm text-gray-400">
                {videos.length} videos
              </div>
            </div>

            {videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No videos recorded yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start recording to capture video moments!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid, i) => (
                  <div
                    key={i}
                    className="group relative bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <video
                      src={`/data/videos/${vid}`}
                      controls
                      className="w-full h-48 object-cover bg-black"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2 pointer-events-none">
                      <div className="flex space-x-2 pointer-events-auto">
                        <button className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                      {vid}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
