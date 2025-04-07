
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AROverlayProps {
  originalImage: string;
  originalCurrency: string;
  targetCurrency: string;
  originalPrice: number;
  convertedPrice: number;
  conversionRate: number;
  className?: string;
}

const AROverlay: React.FC<AROverlayProps> = ({
  originalImage,
  originalCurrency,
  targetCurrency,
  originalPrice,
  convertedPrice,
  conversionRate,
  className
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    
    // Animation timing
    setTimeout(() => setIsMounted(true), 200);
  }, [originalImage]);

  const formatCurrency = (value: number, currency: string) => {
    let symbol = '';
    switch(currency) {
      case 'USD': symbol = '$'; break;
      case 'EUR': symbol = '€'; break;
      case 'GBP': symbol = '£'; break;
      case 'JPY': symbol = '¥'; break;
      default: symbol = currency + ' ';
    }
    
    return `${symbol}${value.toFixed(2)}`;
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="w-full aspect-[4/3] relative overflow-hidden rounded-2xl border-2 border-primary/30 shadow-xl">
        <img 
          src={originalImage} 
          alt="Original price tag" 
          className="w-full h-full object-cover"
        />
        
        {/* AR overlay elements - position would be detected by ML in real app */}
        {isMounted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="ar-overlay p-4 min-w-[150px] bg-gradient-to-br from-primary/40 to-secondary/40">
              <div className="text-center">
                <div className="line-through text-white/70 text-lg font-semibold">
                  {formatCurrency(originalPrice, originalCurrency)}
                </div>
                <div className="text-white text-3xl font-bold">
                  {formatCurrency(convertedPrice, targetCurrency)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="mt-4 glass-panel p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm opacity-80">Original:</span>
          <span className="font-semibold">
            {formatCurrency(originalPrice, originalCurrency)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm opacity-80">Converted:</span>
          <span className="font-semibold">
            {formatCurrency(convertedPrice, targetCurrency)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="opacity-80">Rate:</span>
          <span>
            1 {originalCurrency} = {conversionRate.toFixed(4)} {targetCurrency}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AROverlay;
