import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Aperture, Image as ImageIcon, CircleX, CircleDollarSign, Receipt, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface CameraProps {
  onCapture: (imageData: string) => void;
  className?: string;
  onPriceDetected?: (imageData: string) => void;
  autoDetect?: boolean;
  scanMode?: 'price' | 'receipt' | 'menu';
  onScanModeChange?: (mode: 'price' | 'receipt' | 'menu') => void;
}

const CameraCapture: React.FC<CameraProps> = ({ 
  onCapture, 
  className, 
  onPriceDetected,
  autoDetect = false,
  scanMode = 'price',
  onScanModeChange
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentScanMode, setCurrentScanMode] = useState<'price' | 'receipt' | 'menu'>(scanMode);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentScanMode(scanMode);
  }, [scanMode]);

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

  const toggleScanMode = (mode: 'price' | 'receipt' | 'menu') => {
    setCurrentScanMode(mode);
    if (onScanModeChange) {
      onScanModeChange(mode);
    }
    
    // Show toast to indicate mode change
    const modeNames = {
      price: 'Price Tag',
      receipt: 'Receipt',
      menu: 'Menu'
    };
    toast.info(`Switched to ${modeNames[mode]} scanning mode`);
  };

  const useDemoImage = () => {
    // Using different demo images based on scan mode
    let demoImage = "/lovable-uploads/a6e5d0e0-0f29-40a9-beac-d8eb1b10e6ba.png"; // default price tag
    
    if (currentScanMode === 'receipt') {
      demoImage = "/lovable-uploads/a6e5d0e0-0f29-40a9-beac-d8eb1b10e6ba.png"; // Replace with receipt image when available
      toast.info("Using demo receipt image");
    } else if (currentScanMode === 'menu') {
      demoImage = "/lovable-uploads/a6e5d0e0-0f29-40a9-beac-d8eb1b10e6ba.png"; // Replace with menu image when available
      toast.info("Using demo menu image");
    } else {
      toast.info("Using demo price tag image");
    }
    
    onCapture(demoImage);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Get overlay class based on scan mode
  const getOverlayClass = () => {
    switch (currentScanMode) {
      case 'receipt':
        return 'h-full w-3/4 mx-auto';
      case 'menu':
        return 'h-full w-4/5 mx-auto';
      default:
        return 'h-32 w-32 mx-auto';
    }
  };

  return (
    <div className={cn("w-full relative", className)}>
      {isActive ? (
        <div className="relative animate-fade-in">
          <video 
            ref={videoRef} 
            className="w-full rounded-2xl border-2 border-primary/30 shadow-xl object-cover aspect-[4/3]" 
            autoPlay 
            playsInline
          />
          
          {/* AR detection overlay when scanning */}
          {isDetecting && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className={cn("ar-recognition-frame", getOverlayClass())}></div>
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
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm shadow-lg border border-white/10 font-medium">
                {currentScanMode === 'price' && "Scanning for price tags..."}
                {currentScanMode === 'receipt' && "Scanning receipt..."}
                {currentScanMode === 'menu' && "Scanning menu..."}
              </div>
            </div>
          )}
          
          {/* Scan mode selector buttons */}
          <div className="absolute top-4 left-0 right-0 flex justify-center space-x-2">
            <Button 
              onClick={() => toggleScanMode('price')} 
              size="sm" 
              variant={currentScanMode === 'price' ? 'default' : 'outline'}
              className={cn(
                "rounded-full shadow-lg border",
                currentScanMode === 'price' 
                  ? "bg-primary text-primary-foreground border-primary/30" 
                  : "bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-black/60"
              )}
            >
              <CircleDollarSign className="h-4 w-4 mr-1" />
              Price
            </Button>
            <Button 
              onClick={() => toggleScanMode('receipt')} 
              size="sm" 
              variant={currentScanMode === 'receipt' ? 'default' : 'outline'}
              className={cn(
                "rounded-full shadow-lg border",
                currentScanMode === 'receipt' 
                  ? "bg-primary text-primary-foreground border-primary/30" 
                  : "bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-black/60"
              )}
            >
              <Receipt className="h-4 w-4 mr-1" />
              Receipt
            </Button>
            <Button 
              onClick={() => toggleScanMode('menu')} 
              size="sm" 
              variant={currentScanMode === 'menu' ? 'default' : 'outline'}
              className={cn(
                "rounded-full shadow-lg border",
                currentScanMode === 'menu' 
                  ? "bg-primary text-primary-foreground border-primary/30" 
                  : "bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-black/60"
              )}
            >
              <FileText className="h-4 w-4 mr-1" />
              Menu
            </Button>
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button 
              onClick={captureImage} 
              size="lg" 
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-lg rounded-full px-6 text-base font-medium focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            >
              <Aperture className="mr-2 h-5 w-5" />
              Capture
            </Button>
            
            {autoDetect && onPriceDetected && (
              <Button 
                onClick={toggleDetection} 
                size="lg" 
                className={cn(
                  "backdrop-blur-md border border-white/20 text-white shadow-lg rounded-full px-6 text-base font-medium focus:ring-2 focus:ring-offset-2",
                  isDetecting 
                    ? "bg-primary/80 hover:bg-primary/90 focus:ring-primary/50" 
                    : "bg-black/60 hover:bg-black/80 focus:ring-white/20"
                )}
              >
                <CircleDollarSign className="mr-2 h-5 w-5" />
                {isDetecting ? "Stop Scanning" : "Auto Scan"}
              </Button>
            )}
            
            <Button 
              onClick={stopCamera} 
              size="lg" 
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-lg rounded-full px-6 text-base font-medium focus:ring-2 focus:ring-white/20 focus:ring-offset-2"
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
                <p className="text-lg text-center mb-6 font-medium">Select what you want to scan</p>
                
                <div className="flex justify-center mb-8 space-x-4">
                  <Button 
                    onClick={() => toggleScanMode('price')} 
                    variant={currentScanMode === 'price' ? 'default' : 'outline'}
                    className={cn(
                      "rounded-full h-14 px-5",
                      currentScanMode === 'price' 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                        : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
                    )}
                  >
                    <CircleDollarSign className="h-5 w-5 mr-2" />
                    Price Tag
                  </Button>
                  <Button 
                    onClick={() => toggleScanMode('receipt')} 
                    variant={currentScanMode === 'receipt' ? 'default' : 'outline'}
                    className={cn(
                      "rounded-full h-14 px-5",
                      currentScanMode === 'receipt' 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                        : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
                    )}
                  >
                    <Receipt className="h-5 w-5 mr-2" />
                    Receipt
                  </Button>
                  <Button 
                    onClick={() => toggleScanMode('menu')} 
                    variant={currentScanMode === 'menu' ? 'default' : 'outline'}
                    className={cn(
                      "rounded-full h-14 px-5",
                      currentScanMode === 'menu' 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                        : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
                    )}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Menu
                  </Button>
                </div>
                
                <div className="flex flex-col space-y-3 w-full">
                  <Button 
                    onClick={handleToggleCamera} 
                    variant="default"
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-14 text-base font-medium shadow-lg"
                  >
                    <Camera className="mr-3 h-5 w-5" />
                    Open Camera
                  </Button>
                  <Button 
                    onClick={useDemoImage} 
                    variant="outline" 
                    size="lg"
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 h-14 text-base"
                  >
                    <ImageIcon className="mr-3 h-5 w-5" />
                    Use Demo Image
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="my-4 glass-panel p-10 flex flex-col items-center">
              <p className="text-center text-lg text-red-500 mb-4 font-medium">
                Camera access is required for this feature.
              </p>
              <Button 
                onClick={useDemoImage} 
                variant="outline" 
                size="lg"
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 h-14"
              >
                <ImageIcon className="mr-3 h-5 w-5" />
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
