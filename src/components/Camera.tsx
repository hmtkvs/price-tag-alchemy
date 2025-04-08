
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Aperture, Image as ImageIcon, CircleX, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface CameraProps {
  onCapture: (imageData: string) => void;
  className?: string;
  onPriceDetected?: (imageData: string) => void;
  autoDetect?: boolean;
}

const CameraCapture: React.FC<CameraProps> = ({ 
  onCapture, 
  className, 
  onPriceDetected,
  autoDetect = false
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);

        // If autoDetect is enabled, start the detection interval
        if (autoDetect && onPriceDetected) {
          startAutoDetection();
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCameraAvailable(false);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    
    // Clear detection interval if it exists
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
        stopCamera();
      }
    }
  };

  const startAutoDetection = () => {
    if (detectionIntervalRef.current) return;

    setIsDetecting(true);
    detectionIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && canvasRef.current && onPriceDetected) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = canvas.toDataURL('image/jpeg');
          // Call the price detection handler
          onPriceDetected(imageData);
        }
      }
    }, 2000); // Check every 2 seconds
  };

  const stopAutoDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
      setIsDetecting(false);
    }
  };

  const handleToggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const toggleDetection = () => {
    if (isDetecting) {
      stopAutoDetection();
    } else {
      startAutoDetection();
    }
  };

  const useDemoImage = () => {
    // Using the provided Turkish price tag image
    const demoImage = "/lovable-uploads/a6e5d0e0-0f29-40a9-beac-d8eb1b10e6ba.png";
    onCapture(demoImage);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className={cn("w-full relative", className)}>
      {isActive ? (
        <div className="relative animate-fade-in">
          <video 
            ref={videoRef} 
            className="w-full rounded-2xl border-2 border-primary/30 shadow-xl" 
            autoPlay 
            playsInline
          />
          
          {/* AR detection overlay when scanning */}
          {isDetecting && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 ar-recognition-frame"></div>
              <motion.div 
                className="absolute left-0 right-0 h-[2px] bg-blue-400/60"
                style={{ boxShadow: '0 0 10px 2px rgba(59, 130, 246, 0.6)' }}
                animate={{
                  top: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm">
                Scanning for price tags...
              </div>
            </div>
          )}
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button 
              onClick={captureImage} 
              size="lg" 
              className="bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-lg rounded-full px-6"
            >
              <Aperture className="mr-2 h-5 w-5" />
              Capture
            </Button>
            
            {autoDetect && onPriceDetected && (
              <Button 
                onClick={toggleDetection} 
                size="lg" 
                className={cn(
                  "backdrop-blur-md border border-white/20 text-white shadow-lg rounded-full px-6",
                  isDetecting 
                    ? "bg-primary/80 hover:bg-primary/90" 
                    : "bg-black/50 hover:bg-black/70"
                )}
              >
                <CircleDollarSign className="mr-2 h-5 w-5" />
                {isDetecting ? "Stop Scanning" : "Scan Price"}
              </Button>
            )}
            
            <Button 
              onClick={stopCamera} 
              size="lg" 
              className="bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-lg rounded-full px-6"
            >
              <CircleX className="mr-2 h-5 w-5" />
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in flex flex-col items-center">
          {isCameraAvailable ? (
            <>
              <div className="my-4 glass-panel p-10 flex flex-col items-center">
                <Camera className="h-24 w-24 mb-4 text-primary" />
                <p className="text-lg text-center mb-6">Capture a price tag to convert its currency</p>
                <div className="flex flex-col space-y-3 w-full">
                  <Button 
                    onClick={handleToggleCamera} 
                    variant="default"
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Open Camera
                  </Button>
                  <Button 
                    onClick={useDemoImage} 
                    variant="outline" 
                    size="lg"
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20"
                  >
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Use Demo Image
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="my-4 glass-panel p-10 flex flex-col items-center">
              <p className="text-center text-lg text-red-500 mb-4">
                Camera access is required for this feature.
              </p>
              <Button 
                onClick={useDemoImage} 
                variant="outline" 
                size="lg"
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20"
              >
                <ImageIcon className="mr-2 h-5 w-5" />
                Use Demo Image
              </Button>
            </div>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
