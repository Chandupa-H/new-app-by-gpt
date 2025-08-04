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

"use client";
import { useEffect, useRef, useState } from "react";

export default function DesktopViewPage() {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [recording, setRecording] = useState(false);
  const [connected, setConnected] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

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

  return (
    <div>
      <h1>💻 Desktop Viewer</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls
        style={{ width: "100%", backgroundColor: "#000" }}
      />

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
            src={`/data/images/${img}`}
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
