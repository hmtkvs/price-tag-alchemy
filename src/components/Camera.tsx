
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Aperture, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CameraProps {
  onCapture: (imageData: string) => void;
  className?: string;
}

const CameraCapture: React.FC<CameraProps> = ({ onCapture, className }) => {
  const [isActive, setIsActive] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
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

  const handleToggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const useDemoImage = () => {
    // Using the provided Turkish price tag image
    const demoImage = "/lovable-uploads/a6e5d0e0-0f29-40a9-beac-d8eb1b10e6ba.png";
    onCapture(demoImage);
  };

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
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button 
              onClick={captureImage} 
              size="lg" 
              className="glass-button"
              variant="outline"
            >
              <Aperture className="mr-2 h-5 w-5" />
              Capture
            </Button>
            <Button 
              onClick={stopCamera} 
              size="lg" 
              className="glass-button"
              variant="outline"
            >
              Cancel
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
                    className="w-full"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Open Camera
                  </Button>
                  <Button 
                    onClick={useDemoImage} 
                    variant="outline" 
                    size="lg"
                    className="w-full"
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
                className="w-full"
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
