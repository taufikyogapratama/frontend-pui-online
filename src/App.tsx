// import { useState, useCallback } from "react";
// import { CameraView } from "@/components/camera-view";
// import { ControlPanel } from "@/components/control-panel";
// import { ResultSheet, type RipenessResult } from "@/components/result-sheet";
// import { Header } from "@/components/header";
// import { ThemeProvider } from "@/components/theme-provider";
// import { Apple, Ban } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogMedia,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";

// // Fungsi compressImage yang disempurnakan (tanpa merusak warna asli)
// const compressImage = (imageSrc: string): Promise<Blob> => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       // Hanya ubah ukuran jika terlalu besar, tapi jangan terlalu kecil
//       // 800px adalah batas aman agar OpenCV tidak kehilangan detail penting
//       // 800 => 500
//       const max_size = 500;
//       let width = img.width;
//       let height = img.height;

//       if (width > height) {
//         if (width > max_size) {
//           height *= max_size / width;
//           width = max_size;
//         }
//       } else {
//         if (height > max_size) {
//           width *= max_size / height;
//           height = max_size;
//         }
//       }

//       canvas.width = width;
//       canvas.height = height;
//       const ctx = canvas.getContext("2d");

//       if (ctx) {
//         // Menggambar ulang dengan kualitas terbaik (tanpa smoothing yang merusak warna)
//         // ctx.imageSmoothingEnabled = true;
//         // ctx.imageSmoothingQuality = "high";
//         ctx.drawImage(img, 0, 0, width, height);

//         // Ubah menjadi PNG untuk mempertahankan warna asli (Lossless)
//         // atau tetap JPEG tapi dengan kualitas maksimal (1.0)
//         canvas.toBlob(
//           (blob: Blob | null) => {
//             if (blob) resolve(blob);
//             else reject(new Error("Canvas to Blob failed"));
//           },
//           "image/jpeg",
//           0.8,
//           /* "image/png" */ // PNG jauh lebih baik untuk OpenCV masking daripada JPEG
//         );
//       } else {
//         reject(new Error("Canvas context is null"));
//       }
//     };
//     img.onerror = (err: string | Event) => reject(err);
//     img.src = imageSrc;
//   });
// };

// interface ApiResponse {
//   hasil_slp: string;
//   hasil_mlp: string;
// }

// const App = () => {
//   const [isScanning, setIsScanning] = useState<boolean>(false);
//   const [result, setResult] = useState<RipenessResult>(null);
//   const [rawLabel, setRawLabel] = useState<string | null>(null);
//   const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [captureTrigger, setCaptureTrigger] = useState<number>(0);
//   const [isTomat, setIsTomat] = useState<boolean>(false);

//   const classifyTomato = useCallback(async (imageData: string) => {
//     setImagePreview(imageData);
//     setIsScanning(true);

//     try {
//       const compressedBlob: Blob = await compressImage(imageData);

//       const formData = new FormData();
//       formData.append("file", compressedBlob, "tomat.jpg");

//       // ===== Production ======
//       // const response = await fetch(`${import.meta.env.VITE_API_URL}/prediksi`, {
//       //   method: "POST",
//       //   headers: { "ngrok-skip-browser-warning": "69420" },
//       //   body: formData,
//       // });

//       // ===== Development =====
//       const response = await fetch(`http://127.0.0.1:8000/prediksi`, {
//         method: "POST",
//         body: formData,
//       });
//       //
//       if (!response.ok) {
//         throw new Error("Gagal merespons dari server");
//       }

//       const data: ApiResponse = await response.json();
//       if (data.hasil_mlp === "Bukan Tomat") {
//         setIsTomat(true);
//         setIsScanning(false);
//       } else {
//         const isRipe = data.hasil_mlp === "Matang";

//         setResult(isRipe ? "ripe" : "unripe");
//         setRawLabel(data.hasil_mlp);

//         setIsScanning(false);
//         setIsResultOpen(true);
//       }
//     } catch (error) {
//       console.error("Error saat klasifikasi:", error);
//       alert("Gagal terhubung ke server backend");
//       setIsScanning(false);
//     }
//   }, []);

//   const handleCapture = useCallback(() => {
//     setCaptureTrigger((prev) => prev + 1);
//   }, []);

//   const handleCameraCapture = useCallback(
//     (imageData: string) => classifyTomato(imageData),
//     [classifyTomato],
//   );

//   const handleFileUpload = useCallback(
//     (file: File) => {
//       const reader = new FileReader();
//       reader.onload = (e: ProgressEvent<FileReader>) => {
//         const imageData = e.target?.result as string;
//         if (imageData) {
//           classifyTomato(imageData);
//         }
//       };
//       reader.readAsDataURL(file);
//     },
//     [classifyTomato],
//   );

//   const handleCancel = useCallback(() => setIsScanning(false), []);

//   const handleCloseResult = useCallback(() => {
//     setIsResultOpen(false);
//     setResult(null);
//     setRawLabel(null);
//     setImagePreview(null);
//   }, []);

//   return (
//     <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
//       <main className="relative h-dvh w-full overflow-hidden bg-background">
//         <a
//           href="#main-controls"
//           className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
//         >
//           Skip to controls
//         </a>

//         <CameraView
//           onCapture={handleCameraCapture}
//           isScanning={isScanning}
//           triggerCapture={captureTrigger}
//         />

//         <Header />

//         <div id="main-controls">
//           <ControlPanel
//             onCapture={handleCapture}
//             onFileUpload={handleFileUpload}
//             isScanning={isScanning}
//             onCancel={handleCancel}
//           />
//         </div>

//         <ResultSheet
//           result={result}
//           rawLabel={rawLabel}
//           isOpen={isResultOpen}
//           onClose={handleCloseResult}
//           imagePreview={imagePreview}
//         />

//         <AlertDialog open={isTomat} onOpenChange={setIsTomat}>
//           <AlertDialogContent size="sm" className="rounded-xl">
//             <AlertDialogHeader>
//               <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive rounded-md">
//                 {/* Ikon Buah di belakang */}
//                 <Apple className="h-6 w-6 opacity-70" />
//                 {/* Ikon Coretan Merah di depan (tumpang tindih) */}
//                 <Ban className="h-10 w-10 absolute text-destructive stroke-[2.5]" />{" "}
//               </AlertDialogMedia>
//               <AlertDialogTitle>Bukan Tomat</AlertDialogTitle>
//               <AlertDialogDescription>
//                 Sistem mendeteksi bahwa objek tidak memiliki warna atau bentuk
//                 yang memenuhi kriteria tomat. Silakan coba objek lain.
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel asChild>
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setIsTomat(false);
//                   }}
//                   className="rounded-md"
//                 >
//                   Coba Lagi
//                 </Button>
//               </AlertDialogCancel>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       </main>
//     </ThemeProvider>
//   );
// };

// export default App;

// ===============================================================================
// ===============================================================================
// ===============================================================================

import { useState, useCallback } from "react";
import { CameraView } from "@/components/camera-view";
import { ControlPanel } from "@/components/control-panel";
import { ResultSheet, type RipenessResult } from "@/components/result-sheet";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Apple, Ban } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const dataURItoBlob = (dataURI: string): Blob => {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

// Fungsi compressImage yang disempurnakan (tanpa merusak warna asli)
// const compressImage = (imageSrc: string): Promise<Blob> => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       // Hanya ubah ukuran jika terlalu besar, tapi jangan terlalu kecil
//       // 800px adalah batas aman agar OpenCV tidak kehilangan detail penting
//       // 800 => 500
//       const max_size = 500;
//       let width = img.width;
//       let height = img.height;

//       if (width > height) {
//         if (width > max_size) {
//           height *= max_size / width;
//           width = max_size;
//         }
//       } else {
//         if (height > max_size) {
//           width *= max_size / height;
//           height = max_size;
//         }
//       }

//       canvas.width = width;
//       canvas.height = height;
//       const ctx = canvas.getContext("2d");

//       if (ctx) {
//         // Menggambar ulang dengan kualitas terbaik (tanpa smoothing yang merusak warna)
//         // ctx.imageSmoothingEnabled = true;
//         // ctx.imageSmoothingQuality = "high";
//         ctx.drawImage(img, 0, 0, width, height);

//         // Ubah menjadi PNG untuk mempertahankan warna asli (Lossless)
//         // atau tetap JPEG tapi dengan kualitas maksimal (1.0)
//         canvas.toBlob(
//           (blob: Blob | null) => {
//             if (blob) resolve(blob);
//             else reject(new Error("Canvas to Blob failed"));
//           },
//           "image/png",
//           0.8,
//           /* "image/png" */ // PNG jauh lebih baik untuk OpenCV masking daripada JPEG
//         );
//       } else {
//         reject(new Error("Canvas context is null"));
//       }
//     };
//     img.onerror = (err: string | Event) => reject(err);
//     img.src = imageSrc;
//   });
// };

interface ApiResponse {
  status: string;
  message?: string;
  hasil_slp?: string;
  hasil_mlp?: string;
}

const App = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<RipenessResult>(null);
  const [rawLabel, setRawLabel] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [captureTrigger, setCaptureTrigger] = useState<number>(0);
  const [isTomat, setIsTomat] = useState<boolean>(false);

  // TAMBAHAN: State untuk melacak mode kamera (depan/belakang)
  const [cameraMode, setCameraMode] = useState<"environment" | "user">(
    "environment",
  );

  // TAMBAHAN: Fungsi untuk membalikkan mode kamera
  const handleSwitchCamera = useCallback(() => {
    setCameraMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  // const classifyTomato = useCallback(async (imageData: string) => {
  //   setImagePreview(imageData);
  //   setIsScanning(true);

  //   try {
  //     const compressedBlob: Blob = await compressImage(imageData);

  //     const formData = new FormData();
  //     formData.append("file", compressedBlob, "tomat.jpg");

  const classifyTomato = useCallback(
    async (imageBlob: Blob, previewUrl: string) => {
      setImagePreview(previewUrl);
      setIsScanning(true);

      try {
        const formData = new FormData();
        formData.append("file", imageBlob, "tomat_raw.jpg");

        // ===== Production ======
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/prediksi`,
          {
            method: "POST",
            headers: { "ngrok-skip-browser-warning": "69420" },
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error("Gagal merespons dari server");
        }

        const data: ApiResponse = await response.json();

        // Pengecekan respons yang sangat tegas
        if (data.status === "error") {
          alert(data.message || "Terjadi kesalahan saat memproses gambar.");
          setIsScanning(false);
          return;
        }

        if (data.hasil_mlp === "Matang") {
          setResult("ripe");
          setRawLabel(data.hasil_mlp);
          setIsScanning(false);
          setIsResultOpen(true);
        } else if (data.hasil_mlp === "Belum Matang") {
          setResult("unripe");
          setRawLabel(data.hasil_mlp);
          setIsScanning(false);
          setIsResultOpen(true);
        } else if (data.hasil_mlp === "Bukan Tomat") {
          setIsTomat(true);
          setIsScanning(false);
        } else {
          alert("Respons klasifikasi tidak valid atau tidak dikenali.");
          setIsScanning(false);
        }
      } catch (error) {
        console.error("Error saat klasifikasi:", error);
        alert("Gagal terhubung ke server backend");
        setIsScanning(false);
      }
    },
    [],
  );

  const handleCapture = useCallback(() => {
    setCaptureTrigger((prev) => prev + 1);
  }, []);

  // const handleCameraCapture = useCallback(
  //   (imageData: string) => classifyTomato(imageData),
  //   [classifyTomato],
  // );

  const handleCameraCapture = useCallback(
    (imageData: string) => {
      const rawBlob = dataURItoBlob(imageData);
      classifyTomato(rawBlob, imageData);
    },
    [classifyTomato],
  );

  // const handleFileUpload = useCallback(
  //   (file: File) => {
  //     const reader = new FileReader();
  //     reader.onload = (e: ProgressEvent<FileReader>) => {
  //       const imageData = e.target?.result as string;
  //       if (imageData) {
  //         classifyTomato(imageData);
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   },
  //   [classifyTomato],
  // );

  const handleFileUpload = useCallback(
    (file: File) => {
      // File yang diunggah sudah berupa Blob, langsung kirim ke backend
      const previewUrl = URL.createObjectURL(file);
      classifyTomato(file, previewUrl);
    },
    [classifyTomato],
  );

  const handleCancel = useCallback(() => setIsScanning(false), []);

  const handleCloseResult = useCallback(() => {
    setIsResultOpen(false);
    setResult(null);
    setRawLabel(null);
    setImagePreview(null);
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="relative h-dvh w-full overflow-hidden bg-background">
        <a
          href="#main-controls"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to controls
        </a>

        <CameraView
          onCapture={handleCameraCapture}
          isScanning={isScanning}
          triggerCapture={captureTrigger}
          facingMode={cameraMode} // REVISI: Mengoper state arah kamera ke dalam CameraView
        />

        <Header />

        <div id="main-controls">
          <ControlPanel
            onCapture={handleCapture}
            onFileUpload={handleFileUpload}
            isScanning={isScanning}
            onCancel={handleCancel}
            onSwitchCamera={handleSwitchCamera} // REVISI: Mengoper fungsi switch ke ControlPanel
          />
        </div>

        <ResultSheet
          result={result}
          rawLabel={rawLabel}
          isOpen={isResultOpen}
          onClose={handleCloseResult}
          imagePreview={imagePreview}
        />

        <AlertDialog open={isTomat} onOpenChange={setIsTomat}>
          <AlertDialogContent size="sm" className="rounded-xl">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive rounded-md">
                {/* Ikon Buah di belakang */}
                <Apple className="h-6 w-6 opacity-70" />
                {/* Ikon Coretan Merah di depan (tumpang tindih) */}
                <Ban className="h-10 w-10 absolute text-destructive stroke-[2.5]" />{" "}
              </AlertDialogMedia>
              <AlertDialogTitle>Bukan Tomat</AlertDialogTitle>
              <AlertDialogDescription>
                Sistem mendeteksi bahwa objek tidak memiliki warna atau bentuk
                yang memenuhi kriteria tomat. Silakan coba objek lain.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTomat(false);
                  }}
                  className="rounded-md"
                >
                  Coba Lagi
                </Button>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </ThemeProvider>
  );
};

export default App;
