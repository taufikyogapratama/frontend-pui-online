import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, SwitchCamera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlPanelProps {
  onCapture: () => void;
  onFileUpload: (file: File) => void;
  isScanning: boolean;
  onCancel: () => void;
}

export function ControlPanel({
  onCapture,
  onFileUpload,
  isScanning,
  onCancel,
}: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const switchCamera = async (): Promise<void> => {
    // 1. Tentukan kamera tujuan dengan tipe data eksplisit
    const newMode: "user" | "environment" =
      facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);

    // 2. Wajib matikan kamera sebelumnya
    if (streamRef.current) {
      // Beri tahu TS bahwa 'track' adalah MediaStreamTrack
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    }

    // 3. Nyalakan kamera dengan mode yang baru
    try {
      // Beri tahu TS bahwa hasil kembaliannya adalah MediaStream
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode },
      });

      streamRef.current = stream;

      // Pengecekan null yang disukai TypeScript sebelum memasukkan nilai
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      // TS versi baru kadang meminta kita memastikan tipe error, tapi menggunakan 'unknown' atau 'any' secara implisit lewat console.error sudah cukup aman di sini.
      console.error("Gagal mengganti kamera:", error);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 pb-safe">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Control panel content */}
      <div className="relative px-6 pb-8 pt-12">
        {/* Helper text */}
        <p className="mb-6 text-center text-sm font-medium tracking-wide text-white/70">
          {isScanning ? "Sedang diproses" : "Arahkan ke tomat dan tekan foto"}
        </p>

        {/* Controls row */}
        <div className="flex items-center justify-center gap-8">
          {/* Gallery button */}
          <Button
            variant="ghost"
            size="icon"
            className="group h-14 w-14 rounded-full bg-white/10 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload image from gallery"
            disabled={isScanning}
          >
            <ImageIcon className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Select image file"
          />

          {/* Main capture button */}
          {isScanning ? (
            <Button
              variant="ghost"
              size="icon"
              className="relative h-20 w-20 rounded-full bg-white/20 backdrop-blur-md transition-all hover:bg-white/30"
              onClick={onCancel}
              aria-label="Cancel scanning"
            >
              <X className="h-8 w-8 text-white" />
              {/* Pulsing ring */}
              <span className="absolute inset-0 animate-ping rounded-full border-4 border-primary/50" />
            </Button>
          ) : (
            <button
              className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-white transition-all hover:scale-105 active:scale-95"
              onClick={onCapture}
              aria-label="Capture and scan tomato"
            >
              {/* Outer ring */}
              <span className="absolute inset-0 rounded-full border-4 border-white/30" />
              {/* Inner circle */}
              <span className="h-16 w-16 rounded-full bg-white shadow-lg transition-transform group-hover:scale-95" />
              {/* Camera icon */}
              <Camera className="absolute h-7 w-7 text-background" />
            </button>
          )}

          {/* Switch camera button (placeholder) */}
          <Button
            variant="ghost"
            size="icon"
            className="group h-14 w-14 md:hidden rounded-full bg-white/10 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
            aria-label="Switch camera"
            disabled={isScanning}
            onClick={switchCamera}
          >
            <SwitchCamera className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
          </Button>
        </div>
      </div>
    </div>
  );
}
