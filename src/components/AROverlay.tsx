
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
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
      case 'TRY': symbol = '₺'; break;
      default: symbol = currency + ' ';
    }
    
    // Format with proper decimal places
    const formattedValue = currency === 'JPY' 
      ? Math.round(value).toString() 
      : value.toFixed(2);
      
    // Place symbol before or after based on convention
    if (['USD', 'EUR', 'GBP', 'JPY'].includes(currency)) {
      return `${symbol}${formattedValue}`;
    } else {
      return `${formattedValue} ${symbol}`;
    }
  };

  // For the Turkish price tag, position the overlay with an arrow pointing to the original price
  const getOverlayPosition = () => {
    // The position is offset to not overlap with the price
    if (originalCurrency === 'TRY') {
      return {
        top: '30%',
        left: '70%',
      };
    }
    // Default position for other tags
    return {
      top: '30%',
      left: '70%',
    };
  };

  // Arrow position - points to the original price
  const getArrowPosition = () => {
    if (originalCurrency === 'TRY') {
      return {
        top: '45%',
        left: '40%',
        transform: 'rotate(45deg)' // angle the arrow toward the price
      };
    }
    return {
      top: '45%',
      left: '40%',
      transform: 'rotate(45deg)'
    };
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="w-full aspect-auto relative overflow-hidden rounded-2xl border-2 border-primary/30 shadow-xl">
        <img 
          src={originalImage} 
          alt="Original price tag" 
          className="w-full h-full object-contain"
        />
        
        {/* AR overlay elements */}
        {isMounted && (
          <>
            {/* Animated pointer arrow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 0.5
              }}
              className="absolute z-10"
              style={getArrowPosition()}
            >
              <ArrowDown 
                className="h-10 w-10 text-primary drop-shadow-lg" 
                style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.7))" }}
              />
            </motion.div>
            
            {/* Price conversion display */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.5,
                delay: 0.2,
                type: "spring",
                stiffness: 100
              }}
              className="absolute"
              style={getOverlayPosition()}
            >
              <div className="ar-overlay p-3 min-w-[150px] bg-gradient-to-br from-primary/80 to-primary/40 rounded-lg backdrop-blur-md border border-white/30 shadow-xl">
                <div className="text-center">
                  <div className="text-white/80 text-sm mb-1">
                    Converted from:
                  </div>
                  <div className="line-through text-white/90 text-lg font-semibold">
                    {formatCurrency(originalPrice, originalCurrency)}
                  </div>
                  <div className="text-white text-2xl font-bold mt-1">
                    {formatCurrency(convertedPrice, targetCurrency)}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
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
