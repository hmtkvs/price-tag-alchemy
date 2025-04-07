
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Aperture, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

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

  // For demo purposes, let's add the ability to use a mock image
  const useMockImage = () => {
    // Mock image of a price tag
    const mockImage = "data:image/jpeg;base64,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";
    onCapture(mockImage);
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
                    onClick={useMockImage} 
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
                onClick={useMockImage} 
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
