import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  QrCode,
  RefreshCw,
  SwitchCamera,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useQRScanner } from "../qr-code/useQRScanner";

interface QRScanScreenProps {
  onBack: () => void;
  onScanResult: (upiId: string) => void;
}

export default function QRScanScreen({
  onBack,
  onScanResult,
}: QRScanScreenProps) {
  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    switchCamera,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 150,
    maxResults: 3,
  });

  // Start scanning on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  // Handle scan results
  useEffect(() => {
    if (qrResults.length > 0) {
      const data = qrResults[0].data;
      // Parse UPI ID from QR data
      // QR format: upi://pay?pa=upiid@provider or just upiid@provider
      let upiId = data;
      try {
        if (data.startsWith("upi://")) {
          const url = new URL(data);
          upiId = url.searchParams.get("pa") ?? data;
        } else if (data.includes("@")) {
          upiId = data.trim();
        }
      } catch {
        // not a URL, use as-is
      }
      toast.success(`UPI ID found: ${upiId}`);
      clearResults();
      onScanResult(upiId);
    }
  }, [qrResults, clearResults, onScanResult]);

  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  return (
    <div className="flex flex-col min-h-screen bg-foreground text-background relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            stopScanning();
            onBack();
          }}
          className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-white" />
        </button>
        <h1 className="font-display font-bold text-xl text-white flex-1">
          Scan & Pay
        </h1>
        {isMobile && isActive && (
          <button
            type="button"
            onClick={switchCamera}
            disabled={isLoading}
            className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center"
          >
            <SwitchCamera className="w-4.5 h-4.5 text-white" />
          </button>
        )}
      </div>

      {/* Camera view */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          style={{ minHeight: "100vh" }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Not supported */}
        {isSupported === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/90 px-8 text-center">
            <QrCode className="w-16 h-16 text-white/40 mb-4" />
            <p className="font-display font-bold text-xl text-white mb-2">
              Camera not supported
            </p>
            <p className="text-white/60 text-sm">
              Your browser doesn't support camera access. Try Chrome or Safari.
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/90 px-8 text-center">
            <QrCode className="w-16 h-16 text-white/40 mb-4" />
            <p className="font-display font-bold text-xl text-white mb-2">
              Camera error
            </p>
            <p className="text-white/60 text-sm mb-6">{error.message}</p>
            <Button
              onClick={() => startScanning()}
              className="bg-white text-foreground font-semibold rounded-xl hover:bg-white/90"
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Loading */}
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Scan overlay */}
        {isActive && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Corner brackets */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="relative"
              style={{ width: 220, height: 220 }}
            >
              {/* TL */}
              <div
                className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-white rounded-tl-lg"
                style={{ borderWidth: 3 }}
              />
              {/* TR */}
              <div
                className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-white rounded-tr-lg"
                style={{ borderWidth: 3 }}
              />
              {/* BL */}
              <div
                className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-white rounded-bl-lg"
                style={{ borderWidth: 3 }}
              />
              {/* BR */}
              <div
                className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-white rounded-br-lg"
                style={{ borderWidth: 3 }}
              />

              {/* Scan line */}
              <motion.div
                animate={{ y: [0, 196] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                  repeatType: "reverse",
                }}
                className="absolute left-2 right-2 h-0.5 bg-primary shadow-glow rounded-full"
                style={{ top: 12 }}
              />
            </motion.div>

            <p className="text-white/80 text-sm mt-6 font-medium">
              {isScanning
                ? "Scanning for QR code…"
                : "Point camera at a QR code"}
            </p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {!error && isSupported !== false && (
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-10 pt-4 flex gap-3">
          {!isActive && !isLoading && (
            <Button
              onClick={startScanning}
              disabled={!canStartScanning && !isLoading}
              className="flex-1 h-13 rounded-2xl bg-white text-foreground font-semibold hover:bg-white/90"
            >
              Start Scanning
            </Button>
          )}
          {isActive && (
            <Button
              onClick={() => {
                stopScanning();
                onBack();
              }}
              variant="outline"
              className="flex-1 h-13 rounded-2xl border-white/30 text-white bg-white/10 hover:bg-white/20 font-semibold"
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
