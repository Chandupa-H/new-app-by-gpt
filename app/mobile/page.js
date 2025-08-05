// // "use client";

// // import { useRef, useState } from "react";

// // export default function MobileStreamPage() {
// //   const videoRef = useRef(null);
// //   const peerRef = useRef(null);
// //   const wsRef = useRef(null);
// //   const iceQueue = useRef([]);
// //   const [ready, setReady] = useState(false);

// //   const handleStart = async () => {
// //     console.log("📱 Mobile: Starting stream...");

// //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
// //     videoRef.current.srcObject = stream;
// //     console.log("📱 Mobile: Got media stream");

// //     const pc = new RTCPeerConnection();
// //     stream.getTracks().forEach((track) => pc.addTrack(track, stream));
// //     peerRef.current = pc;
// //     console.log("📱 Mobile: PeerConnection created and tracks added");

// //     const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
// //     wsRef.current = ws;

// //     pc.onicecandidate = (event) => {
// //       if (event.candidate) {
// //         const candidateMsg = JSON.stringify({
// //           type: "candidate",
// //           candidate: event.candidate,
// //         });
// //         if (ws.readyState === WebSocket.OPEN) {
// //           console.log("📱 Mobile: Sending ICE candidate");
// //           ws.send(candidateMsg);
// //         } else {
// //           console.log("📱 Mobile: Queued ICE candidate");
// //           iceQueue.current.push(candidateMsg);
// //         }
// //       }
// //     };

// //     ws.onopen = async () => {
// //       console.log("📱 Mobile: WebSocket connected ✅");

// //       const offer = await pc.createOffer();
// //       await pc.setLocalDescription(offer);
// //       console.log("📱 Mobile: Created and set local offer");

// //       ws.send(JSON.stringify({ type: "offer", offer }));
// //       console.log("📱 Mobile: Sent offer");

// //       // Send queued ICE candidates
// //       iceQueue.current.forEach((msg) => {
// //         ws.send(msg);
// //         console.log("📱 Mobile: Sent queued ICE candidate");
// //       });
// //       iceQueue.current = [];
// //     };

// //     ws.onmessage = async (msg) => {
// //       const data =
// //         typeof msg.data === "string" ? msg.data : await msg.data.text();
// //       const parsed = JSON.parse(data);
// //       console.log("📩 Mobile: Received message", parsed);

// //       if (parsed.type === "answer") {
// //         await pc.setRemoteDescription(new RTCSessionDescription(parsed.answer));
// //         console.log("📱 Mobile: Set remote description from desktop");
// //       }
// //     };
// //   };

// //   return (
// //     <div>
// //       <h1>📱 Mobile Streaming</h1>
// //       <video
// //         ref={videoRef}
// //         autoPlay
// //         muted
// //         playsInline
// //         style={{ width: "100%" }}
// //       />
// //       <button
// //         onClick={handleStart}
// //         disabled={ready}
// //         style={{ marginTop: 16, padding: "10px 20px", fontSize: "16px" }}
// //       >
// //         Start Streaming
// //       </button>
// //     </div>
// //   );
// // }
// "use client";

// import { useRef, useState, useEffect } from "react";
// import {
//   RotateCcw,
//   Video,
//   VideoOff,
//   Zap,
//   ZapOff,
//   Grid3X3,
//   Maximize2,
// } from "lucide-react";

// export default function MobileStreamPage() {
//   const videoRef = useRef(null);
//   const peerRef = useRef(null);
//   const wsRef = useRef(null);
//   const iceQueue = useRef([]);
//   const streamRef = useRef(null);
//   const focusRingRef = useRef(null);

//   const [ready, setReady] = useState(false);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [orientation, setOrientation] = useState("portrait");
//   const [facingMode, setFacingMode] = useState("user");
//   const [showControls, setShowControls] = useState(true);
//   const [flashMode, setFlashMode] = useState(false);
//   const [gridLines, setGridLines] = useState(false);
//   const [focusPoint, setFocusPoint] = useState(null);
//   const [isAutoFocusing, setIsAutoFocusing] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [batteryLevel] = useState(87); // Mock battery level

//   // Hide controls after 4 seconds
//   useEffect(() => {
//     let timeout;
//     if (isStreaming && showControls) {
//       timeout = setTimeout(() => setShowControls(false), 4000);
//     }
//     return () => clearTimeout(timeout);
//   }, [showControls, isStreaming]);

//   // Auto-focus simulation
//   useEffect(() => {
//     if (focusPoint) {
//       setIsAutoFocusing(true);
//       const timer = setTimeout(() => {
//         setIsAutoFocusing(false);
//         // Clear focus point after animation
//         setTimeout(() => setFocusPoint(null), 500);
//       }, 800);
//       return () => clearTimeout(timer);
//     }
//   }, [focusPoint]);

//   const getMediaConstraints = () => {
//     const isPortrait = orientation === "portrait";
//     return {
//       video: {
//         facingMode: facingMode,
//         width: isPortrait ? { ideal: 720 } : { ideal: 1280 },
//         height: isPortrait ? { ideal: 1280 } : { ideal: 720 },
//         frameRate: { ideal: 30 },
//       },
//       audio: true,
//     };
//   };

//   const updateStream = async () => {
//     if (!streamRef.current) return;

//     try {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       const newStream = await navigator.mediaDevices.getUserMedia(
//         getMediaConstraints()
//       );
//       streamRef.current = newStream;

//       if (videoRef.current) {
//         videoRef.current.srcObject = newStream;
//       }

//       if (peerRef.current && isStreaming) {
//         const senders = peerRef.current.getSenders();
//         const videoTrack = newStream.getVideoTracks()[0];
//         const audioTrack = newStream.getAudioTracks()[0];

//         senders.forEach((sender) => {
//           if (sender.track?.kind === "video" && videoTrack) {
//             sender.replaceTrack(videoTrack);
//           }
//           if (sender.track?.kind === "audio" && audioTrack) {
//             sender.replaceTrack(audioTrack);
//           }
//         });
//       }
//     } catch (error) {
//       console.error("Error updating stream:", error);
//     }
//   };

//   const switchOrientation = () => {
//     setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
//   };

//   const switchCamera = () => {
//     setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
//     // Simulate camera switch focus
//     setIsAutoFocusing(true);
//     setTimeout(() => setIsAutoFocusing(false), 1000);
//   };

//   const handleTapToFocus = (e) => {
//     if (!isStreaming) return;

//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     setFocusPoint({ x, y });
//   };

//   const getCurrentTime = () => {
//     return new Date().toLocaleTimeString("en-US", {
//       hour12: false,
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Update stream when orientation or camera changes
//   useEffect(() => {
//     if (isStreaming) {
//       updateStream();
//     }
//   }, [orientation, facingMode]);

//   const handleStart = async () => {
//     console.log("📱 Mobile: Starting stream...");
//     setReady(true);

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia(
//         getMediaConstraints()
//       );
//       streamRef.current = stream;
//       videoRef.current.srcObject = stream;
//       console.log("📱 Mobile: Got media stream");

//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//       });

//       stream.getTracks().forEach((track) => pc.addTrack(track, stream));
//       peerRef.current = pc;
//       console.log("📱 Mobile: PeerConnection created and tracks added");

//       const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
//       wsRef.current = ws;

//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           const candidateMsg = JSON.stringify({
//             type: "candidate",
//             candidate: event.candidate,
//           });
//           if (ws.readyState === WebSocket.OPEN) {
//             console.log("📱 Mobile: Sending ICE candidate");
//             ws.send(candidateMsg);
//           } else {
//             console.log("📱 Mobile: Queued ICE candidate");
//             iceQueue.current.push(candidateMsg);
//           }
//         }
//       };

//       ws.onopen = async () => {
//         console.log("📱 Mobile: WebSocket connected ✅");

//         const offer = await pc.createOffer();
//         await pc.setLocalDescription(offer);
//         console.log("📱 Mobile: Created and set local offer");

//         ws.send(JSON.stringify({ type: "offer", offer }));
//         console.log("📱 Mobile: Sent offer");

//         iceQueue.current.forEach((msg) => {
//           ws.send(msg);
//           console.log("📱 Mobile: Sent queued ICE candidate");
//         });
//         iceQueue.current = [];
//         setIsStreaming(true);
//       };

//       ws.onmessage = async (msg) => {
//         const data =
//           typeof msg.data === "string" ? msg.data : await msg.data.text();
//         const parsed = JSON.parse(data);
//         console.log("📩 Mobile: Received message", parsed);

//         if (parsed.type === "answer") {
//           await pc.setRemoteDescription(
//             new RTCSessionDescription(parsed.answer)
//           );
//           console.log("📱 Mobile: Set remote description from desktop");
//         }
//       };
//     } catch (error) {
//       console.error("Error starting stream:", error);
//       setReady(false);
//     }
//   };

//   const handleStop = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//     }
//     if (wsRef.current) {
//       wsRef.current.close();
//     }
//     if (peerRef.current) {
//       peerRef.current.close();
//     }
//     setIsStreaming(false);
//     setReady(false);
//   };

//   const toggleControls = () => {
//     setShowControls((prev) => !prev);
//   };

//   return (
//     <div className="h-screen bg-black relative overflow-hidden">
//       {/* Camera Viewfinder */}
//       <div
//         className={`relative w-full h-full transition-transform duration-300 ${
//           orientation === "landscape" ? "rotate-90" : ""
//         }`}
//         onClick={handleTapToFocus}
//       >
//         <video
//           ref={videoRef}
//           autoPlay
//           muted
//           playsInline
//           className={`${
//             orientation === "portrait"
//               ? "w-full h-full object-cover"
//               : "h-full w-auto object-cover"
//           }`}
//           style={{
//             transform: facingMode === "user" ? "scaleX(-1)" : "none",
//             filter: isAutoFocusing ? "brightness(1.1) contrast(1.05)" : "none",
//             transition: "filter 0.3s ease",
//           }}
//         />

//         {/* Camera UI Overlay */}
//         <div className="absolute inset-0 pointer-events-none">
//           {/* Status Bar */}
//           <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between px-4 text-white text-sm">
//             <div className="flex items-center gap-2">
//               <div className="flex items-center gap-1">
//                 <div className="w-1 h-1 bg-white rounded-full"></div>
//                 <div className="w-1 h-1 bg-white rounded-full"></div>
//                 <div className="w-1 h-1 bg-white/50 rounded-full"></div>
//                 <span className="text-xs ml-1">Verizon</span>
//               </div>
//             </div>
//             <div className="text-xs font-mono">{getCurrentTime()}</div>
//             <div className="flex items-center gap-1">
//               <span className="text-xs">{batteryLevel}%</span>
//               <div className="w-6 h-3 border border-white/60 rounded-sm">
//                 <div
//                   className="h-full bg-white/80 rounded-sm transition-all"
//                   style={{ width: `${batteryLevel}%` }}
//                 ></div>
//               </div>
//             </div>
//           </div>

//           {/* Grid Lines */}
//           {gridLines && (
//             <div className="absolute inset-0">
//               <div className="w-full h-full grid grid-cols-3 grid-rows-3">
//                 {[...Array(9)].map((_, i) => (
//                   <div key={i} className="border border-white/30"></div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Focus Ring */}
//           {focusPoint && (
//             <div
//               className={`absolute pointer-events-none transition-all duration-300 ${
//                 isAutoFocusing ? "animate-pulse" : ""
//               }`}
//               style={{
//                 left: focusPoint.x - 40,
//                 top: focusPoint.y - 40,
//                 width: 80,
//                 height: 80,
//               }}
//             >
//               <div
//                 className={`w-full h-full border-2 border-yellow-400 rounded-full ${
//                   isAutoFocusing ? "scale-75 border-green-400" : "scale-100"
//                 } transition-all duration-800`}
//               >
//                 <div className="absolute inset-2 border border-yellow-400 rounded-full opacity-60"></div>
//               </div>
//             </div>
//           )}

//           {/* Auto-focus indicator */}
//           {isAutoFocusing && (
//             <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
//               <div className="bg-black/70 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium">
//                 AF
//               </div>
//             </div>
//           )}

//           {/* Recording Indicator */}
//           {isStreaming && (
//             <div className="absolute top-16 left-4">
//               <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
//                 <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//                 <span className="text-white text-xs font-medium">REC</span>
//               </div>
//             </div>
//           )}

//           {/* Camera Info */}
//           <div className="absolute top-16 right-4">
//             <div className="bg-black/60 text-white px-2 py-1 rounded text-xs">
//               {facingMode === "user" ? "1x" : `${zoomLevel}x`}
//             </div>
//           </div>
//         </div>

//         {/* Focus Animation Overlay */}
//         {isAutoFocusing && (
//           <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none"></div>
//         )}
//       </div>

//       {/* Camera Controls */}
//       {showControls && (
//         <div className="absolute inset-0 pointer-events-none">
//           {/* Top Controls */}
//           <div className="absolute top-20 left-0 right-0 flex justify-center pointer-events-auto">
//             <div className="flex items-center gap-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
//               <button
//                 onClick={() => setFlashMode(!flashMode)}
//                 className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
//                   flashMode
//                     ? "bg-yellow-500 text-black"
//                     : "bg-white/20 text-white hover:bg-white/30"
//                 }`}
//               >
//                 {flashMode ? (
//                   <Zap className="w-4 h-4" />
//                 ) : (
//                   <ZapOff className="w-4 h-4" />
//                 )}
//               </button>

//               <button
//                 onClick={() => setGridLines(!gridLines)}
//                 className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
//                   gridLines
//                     ? "bg-blue-500 text-white"
//                     : "bg-white/20 text-white hover:bg-white/30"
//                 }`}
//               >
//                 <Grid3X3 className="w-4 h-4" />
//               </button>

//               <button
//                 onClick={switchOrientation}
//                 className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors text-white"
//               >
//                 <Maximize2 className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           {/* Main Controls */}
//           <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
//             <div className="flex items-center gap-8">
//               {/* Camera Switch */}
//               <button
//                 onClick={switchCamera}
//                 className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 text-white"
//               >
//                 <RotateCcw className="w-6 h-6" />
//               </button>

//               {/* Record Button */}
//               {!isStreaming ? (
//                 <button
//                   onClick={handleStart}
//                   disabled={ready}
//                   className="w-20 h-20 bg-white border-4 border-red-500 hover:bg-red-50 disabled:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 relative"
//                 >
//                   <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleStop}
//                   className="w-20 h-20 bg-red-500 border-4 border-white rounded-full flex items-center justify-center transition-all duration-200 relative"
//                 >
//                   <div className="w-6 h-6 bg-white rounded-sm"></div>
//                 </button>
//               )}

//               {/* Gallery/Settings */}
//               <button className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors text-white">
//                 <div className="w-8 h-8 bg-white/30 rounded border-2 border-white/50"></div>
//               </button>
//             </div>
//           </div>

//           {/* Zoom Control */}
//           {facingMode === "environment" && (
//             <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
//               <div className="flex flex-col gap-2 bg-black/60 backdrop-blur-sm py-4 px-2 rounded-full">
//                 <button
//                   onClick={() => setZoomLevel(Math.min(zoomLevel + 0.5, 3))}
//                   className="w-8 h-8 text-white text-xs font-bold"
//                 >
//                   +
//                 </button>
//                 <div className="text-white text-xs text-center font-mono">
//                   {zoomLevel}x
//                 </div>
//                 <button
//                   onClick={() => setZoomLevel(Math.max(zoomLevel - 0.5, 1))}
//                   className="w-8 h-8 text-white text-xs font-bold"
//                 >
//                   −
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Tap to show controls hint */}
//       {!showControls && isStreaming && (
//         <div
//           className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
//           onClick={toggleControls}
//         >
//           <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm animate-fade-in-out">
//             Tap for controls
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes fade-in-out {
//           0%,
//           100% {
//             opacity: 0;
//           }
//           50% {
//             opacity: 1;
//           }
//         }
//         .animate-fade-in-out {
//           animation: fade-in-out 2s infinite;
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import { useRef, useState, useEffect } from "react";
import {
  RotateCcw,
  Video,
  VideoOff,
  Zap,
  ZapOff,
  Grid3X3,
  Maximize2,
} from "lucide-react";

export default function MobileStreamPage() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const wsRef = useRef(null);
  const iceQueue = useRef([]);
  const streamRef = useRef(null);
  const focusRingRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [orientation, setOrientation] = useState("portrait");
  const [facingMode, setFacingMode] = useState("user");
  const [showControls, setShowControls] = useState(true);
  const [flashMode, setFlashMode] = useState(false);
  const [gridLines, setGridLines] = useState(false);
  const [focusPoint, setFocusPoint] = useState(null);
  const [isAutoFocusing, setIsAutoFocusing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [batteryLevel] = useState(87); // Mock battery level

  // Hide controls after 4 seconds
  useEffect(() => {
    let timeout;
    if (isStreaming && showControls) {
      timeout = setTimeout(() => setShowControls(false), 4000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isStreaming]);

  // Auto-focus simulation
  useEffect(() => {
    if (focusPoint) {
      setIsAutoFocusing(true);
      const timer = setTimeout(() => {
        setIsAutoFocusing(false);
        // Clear focus point after animation
        setTimeout(() => setFocusPoint(null), 500);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [focusPoint]);

  const getMediaConstraints = () => {
    const isPortrait = orientation === "portrait";
    return {
      video: {
        facingMode: facingMode,
        width: isPortrait
          ? { ideal: 720, max: 720 }
          : { ideal: 1280, max: 1280 },
        height: isPortrait
          ? { ideal: 1280, max: 1280 }
          : { ideal: 720, max: 720 },
        frameRate: { ideal: 30 },
        aspectRatio: isPortrait ? 9 / 16 : 16 / 9,
      },
      audio: true,
    };
  };

  const updateStream = async () => {
    if (!streamRef.current) return;

    try {
      streamRef.current.getTracks().forEach((track) => track.stop());
      const newStream = await navigator.mediaDevices.getUserMedia(
        getMediaConstraints()
      );
      streamRef.current = newStream;

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      if (peerRef.current && isStreaming) {
        const senders = peerRef.current.getSenders();
        const videoTrack = newStream.getVideoTracks()[0];
        const audioTrack = newStream.getAudioTracks()[0];

        senders.forEach((sender) => {
          if (sender.track?.kind === "video" && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
          if (sender.track?.kind === "audio" && audioTrack) {
            sender.replaceTrack(audioTrack);
          }
        });
      }
    } catch (error) {
      console.error("Error updating stream:", error);
    }
  };

  const switchOrientation = () => {
    setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    // Simulate camera switch focus
    setIsAutoFocusing(true);
    setTimeout(() => setIsAutoFocusing(false), 1000);
  };

  const handleTapToFocus = (e) => {
    if (!isStreaming) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFocusPoint({ x, y });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Update stream when orientation or camera changes
  useEffect(() => {
    if (isStreaming) {
      updateStream();
    }
  }, [orientation, facingMode]);

  const handleStart = async () => {
    console.log("📱 Mobile: Starting stream...");
    setReady(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        getMediaConstraints()
      );
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      console.log("📱 Mobile: Got media stream");

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      peerRef.current = pc;
      console.log("📱 Mobile: PeerConnection created and tracks added");

      const ws = new WebSocket("wss://server-production-7da7.up.railway.app");
      wsRef.current = ws;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateMsg = JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
          });
          if (ws.readyState === WebSocket.OPEN) {
            console.log("📱 Mobile: Sending ICE candidate");
            ws.send(candidateMsg);
          } else {
            console.log("📱 Mobile: Queued ICE candidate");
            iceQueue.current.push(candidateMsg);
          }
        }
      };

      ws.onopen = async () => {
        console.log("📱 Mobile: WebSocket connected ✅");

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("📱 Mobile: Created and set local offer");

        ws.send(JSON.stringify({ type: "offer", offer }));
        console.log("📱 Mobile: Sent offer");

        iceQueue.current.forEach((msg) => {
          ws.send(msg);
          console.log("📱 Mobile: Sent queued ICE candidate");
        });
        iceQueue.current = [];
        setIsStreaming(true);
      };

      ws.onmessage = async (msg) => {
        const data =
          typeof msg.data === "string" ? msg.data : await msg.data.text();
        const parsed = JSON.parse(data);
        console.log("📩 Mobile: Received message", parsed);

        if (parsed.type === "answer") {
          await pc.setRemoteDescription(
            new RTCSessionDescription(parsed.answer)
          );
          console.log("📱 Mobile: Set remote description from desktop");
        }
      };
    } catch (error) {
      console.error("Error starting stream:", error);
      setReady(false);
    }
  };

  const handleStop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (peerRef.current) {
      peerRef.current.close();
    }
    setIsStreaming(false);
    setReady(false);
  };

  const toggleControls = () => {
    setShowControls((prev) => !prev);
  };

  return (
    <div className="h-screen bg-black relative overflow-hidden p-4">
      {/* Camera Viewfinder */}
      <div
        className="relative w-full h-full max-w-md mx-auto bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
        onClick={handleTapToFocus}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain bg-black"
          style={{
            transform: facingMode === "user" ? "scaleX(-1)" : "none",
            filter: isAutoFocusing ? "brightness(1.1) contrast(1.05)" : "none",
            transition: "filter 0.3s ease",
          }}
        />

        {/* Camera UI Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between px-4 text-white text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                <span className="text-xs ml-1">Verizon</span>
              </div>
            </div>
            <div className="text-xs font-mono">{getCurrentTime()}</div>
            <div className="flex items-center gap-1">
              <span className="text-xs">{batteryLevel}%</span>
              <div className="w-6 h-3 border border-white/60 rounded-sm">
                <div
                  className="h-full bg-white/80 rounded-sm transition-all"
                  style={{ width: `${batteryLevel}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Grid Lines */}
          {gridLines && (
            <div className="absolute inset-0">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-white/30"></div>
                ))}
              </div>
            </div>
          )}

          {/* Focus Ring */}
          {focusPoint && (
            <div
              className={`absolute pointer-events-none transition-all duration-300 ${
                isAutoFocusing ? "animate-pulse" : ""
              }`}
              style={{
                left: focusPoint.x - 40,
                top: focusPoint.y - 40,
                width: 80,
                height: 80,
              }}
            >
              <div
                className={`w-full h-full border-2 border-yellow-400 rounded-full ${
                  isAutoFocusing ? "scale-75 border-green-400" : "scale-100"
                } transition-all duration-800`}
              >
                <div className="absolute inset-2 border border-yellow-400 rounded-full opacity-60"></div>
              </div>
            </div>
          )}

          {/* Auto-focus indicator */}
          {isAutoFocusing && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/70 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium">
                AF • {orientation.toUpperCase()}
              </div>
            </div>
          )}

          {/* Recording Indicator */}
          {isStreaming && (
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-medium">
                  LIVE • {orientation.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Camera Info */}
          <div className="absolute top-4 right-4">
            <div className="bg-black/60 text-white px-2 py-1 rounded text-xs">
              {orientation.toUpperCase()} •{" "}
              {facingMode === "user" ? "1x" : `${zoomLevel}x`}
            </div>
          </div>
        </div>

        {/* Focus Animation Overlay */}
        {isAutoFocusing && (
          <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none"></div>
        )}
      </div>

      {/* Camera Controls */}
      {showControls && (
        <div className="absolute inset-4 pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <button
                onClick={() => setFlashMode(!flashMode)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  flashMode
                    ? "bg-yellow-500 text-black"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {flashMode ? (
                  <Zap className="w-4 h-4" />
                ) : (
                  <ZapOff className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setGridLines(!gridLines)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  gridLines
                    ? "bg-blue-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>

              <button
                onClick={switchOrientation}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors text-white relative"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="absolute -bottom-6 text-xs text-white/80 whitespace-nowrap">
                  {orientation === "portrait" ? "Landscape" : "Portrait"}
                </span>
              </button>
            </div>
          </div>

          {/* Main Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <div className="flex items-center gap-8">
              {/* Camera Switch */}
              <button
                onClick={switchCamera}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 text-white"
              >
                <RotateCcw className="w-6 h-6" />
              </button>

              {/* Record Button */}
              {!isStreaming ? (
                <button
                  onClick={handleStart}
                  disabled={ready}
                  className="w-20 h-20 bg-white border-4 border-red-500 hover:bg-red-50 disabled:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 relative"
                >
                  <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="w-20 h-20 bg-red-500 border-4 border-white rounded-full flex items-center justify-center transition-all duration-200 relative"
                >
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                </button>
              )}

              {/* Gallery/Settings */}
              <button className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors text-white">
                <div className="w-8 h-8 bg-white/30 rounded border-2 border-white/50"></div>
              </button>
            </div>
          </div>

          {/* Zoom Control */}
          {facingMode === "environment" && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
              <div className="flex flex-col gap-2 bg-black/60 backdrop-blur-sm py-3 px-2 rounded-full">
                <button
                  onClick={() => setZoomLevel(Math.min(zoomLevel + 0.5, 3))}
                  className="w-6 h-6 text-white text-xs font-bold hover:bg-white/20 rounded"
                >
                  +
                </button>
                <div className="text-white text-xs text-center font-mono py-1">
                  {zoomLevel}x
                </div>
                <button
                  onClick={() => setZoomLevel(Math.max(zoomLevel - 0.5, 1))}
                  className="w-6 h-6 text-white text-xs font-bold hover:bg-white/20 rounded"
                >
                  −
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stream Status Outside Preview */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div className="text-white/60 text-sm">
          {isStreaming ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>
                Streaming {orientation} •{" "}
                {facingMode === "user" ? "Front" : "Back"} Camera
              </span>
            </div>
          ) : (
            <span>Ready to stream • {orientation} mode</span>
          )}
        </div>
      </div>

      {/* Tap to show controls hint */}
      {!showControls && isStreaming && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
          onClick={toggleControls}
        >
          <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm animate-fade-in-out">
            Tap for controls
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-out {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s infinite;
        }
      `}</style>
    </div>
  );
}
