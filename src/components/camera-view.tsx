// import { useRef, useEffect, useCallback } from "react";

// export interface CameraViewProps {
//   onCapture: (imageData: string) => void;
//   isScanning: boolean;
//   triggerCapture: number;
// }

// export function CameraView({
//   onCapture,
//   isScanning,
//   triggerCapture,
// }: CameraViewProps) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     async function startCamera() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             facingMode: "environment",
//             width: { ideal: 1920 },
//             height: { ideal: 1080 },
//           },
//         });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       } catch (err) {
//         console.error("[v0] Camera access denied or not available:", err);
//       }
//     }
//     startCamera();

//     return () => {
//       if (videoRef.current?.srcObject) {
//         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   const captureImage = useCallback(() => {
//     if (videoRef.current && canvasRef.current) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         ctx.drawImage(video, 0, 0);
//         const imageData = canvas.toDataURL("image/jpeg", 0.8);
//         onCapture(imageData);
//       }
//     }
//   }, [onCapture]);

//   useEffect(() => {
//     if (triggerCapture > 0) {
//       captureImage();
//     }
//   }, [triggerCapture, captureImage]);

//   return (
//     <div className="absolute inset-0 overflow-hidden">
//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         muted
//         className="h-full w-full object-cover"
//         aria-label="Live camera feed for tomato scanning"
//       />
//       <canvas ref={canvasRef} className="hidden" />

//       {isScanning && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="relative">
//             <div className="h-64 w-64 rounded-3xl border-4 border-primary/80 md:h-80 md:w-80">
//               <div className="absolute -left-1 -top-1 h-8 w-8 rounded-tl-3xl border-l-4 border-t-4 border-primary" />
//               <div className="absolute -right-1 -top-1 h-8 w-8 rounded-tr-3xl border-r-4 border-t-4 border-primary" />
//               <div className="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-primary" />
//               <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-primary" />
//             </div>
//             <div className="absolute inset-0 overflow-hidden rounded-3xl">
//               <div className="animate-scan absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
//             </div>
//           </div>
//         </div>
//       )}
//       <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
//     </div>
//   );
// }

// ===========================================================================
// ===========================================================================
// ===========================================================================

import { useRef, useEffect, useCallback } from "react";

export interface CameraViewProps {
  onCapture: (imageData: string) => void;
  isScanning: boolean;
  triggerCapture: number;
  facingMode: "user" | "environment"; // TAMBAHAN: Menerima instruksi arah kamera
}

export function CameraView({
  onCapture,
  isScanning,
  triggerCapture,
  facingMode, // Destrukturisasi prop baru
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      try {
        // Hentikan stream kamera lama sebelum membuka yang baru (wajib saat switch)
        if (videoRef.current?.srcObject) {
          const tracks = (
            videoRef.current.srcObject as MediaStream
          ).getTracks();
          tracks.forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode, // Gunakan nilai dinamis dari prop
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied or not available:", err);
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]); // Hook ini akan otomatis dipanggil ulang setiap kali facingMode berubah

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(imageData);
      }
    }
  }, [onCapture]);

  useEffect(() => {
    if (triggerCapture > 0) {
      captureImage();
    }
  }, [triggerCapture, captureImage]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
        aria-label="Live camera feed for tomato scanning"
      />
      <canvas ref={canvasRef} className="hidden" />

      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="h-64 w-64 rounded-3xl border-4 border-primary/80 md:h-80 md:w-80">
              <div className="absolute -left-1 -top-1 h-8 w-8 rounded-tl-3xl border-l-4 border-t-4 border-primary" />
              <div className="absolute -right-1 -top-1 h-8 w-8 rounded-tr-3xl border-r-4 border-t-4 border-primary" />
              <div className="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-primary" />
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-primary" />
            </div>
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="animate-scan absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
    </div>
  );
}
