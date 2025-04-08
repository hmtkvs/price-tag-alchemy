
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowDown, Plus, Tag, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AROverlayProps {
  originalImage: string;
  originalCurrency: string;
  targetCurrency: string;
  originalPrice: number;
  convertedPrice: number;
  conversionRate: number;
  className?: string;
  isLiveDetection?: boolean;
  onSavePurchase?: () => void;
  onCompareItem?: () => void;
  productName?: string;
}

const AROverlay: React.FC<AROverlayProps> = ({
  originalImage,
  originalCurrency,
  targetCurrency,
  originalPrice,
  convertedPrice,
  conversionRate,
  className,
  isLiveDetection = false,
  onSavePurchase,
  onCompareItem,
  productName
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

  // Precisely position the overlay based on the price tag type and language
  const getOverlayPosition = () => {
    if (originalImage.includes("a6e5d0e0-0f29-40a9-beac-d8eb1b10e6ba") || originalCurrency === 'TRY') {
      // For Turkish price tag (TRY)
      return {
        top: '60%',  // Move down to be directly over the price area
        left: '30%', // Position centered on the price tag
        transform: 'translate(-50%, -50%)'
      };
    } else if (originalImage.includes("6a0a3fcf-c429-4df0-98b8-56c1183f6773")) {
      // For the new Milka chocolate price tag
      return {
        top: '70%',  // Position near the price
        right: '20%', // Position on the right side
        transform: 'translate(0, -50%)'
      };
    }
    
    // Default position for other tags
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  };

  // Position the arrow to point directly at the price
  const getArrowPosition = () => {
    if (originalImage.includes("a6e5d0e0-0f29-40a9-beac-d8eb1b10e6ba") || originalCurrency === 'TRY') {
      // For Turkish price tag (TRY)
      return {
        top: '39%',    // Precisely target the price in the Turkish price tag
        left: '30%',  // Position centered on price
        transform: 'rotate(0deg) scale(1.2)' // Point directly at price and slightly larger
      };
    } else if (originalImage.includes("6a0a3fcf-c429-4df0-98b8-56c1183f6773")) {
      // For the new Milka chocolate price tag
      return {
        top: '55%',    // Point at the price
        right: '30%',  // Position on the right side
        transform: 'rotate(0deg) scale(1.2)' 
      };
    }
    
    // Default arrow position
    return {
      top: '35%',
      left: '50%',
      transform: 'rotate(0deg)'
    };
  };

  const renderOverlayContent = () => (
    <>
      {/* Animated pointer arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: 1, 
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute z-10"
        style={getArrowPosition()}
      >
        <ArrowDown 
          className="h-10 w-10 text-primary drop-shadow-lg" 
          style={{ 
            filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))" 
          }}
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
        className="absolute z-20"
        style={getOverlayPosition()}
      >
        <div className="ar-overlay p-4 min-w-[180px] bg-gradient-to-br from-black/70 to-primary/60 rounded-lg backdrop-blur-md border border-white/30 shadow-xl">
          <div className="text-center">
            <div className="text-white/90 text-sm mb-1 font-medium">
              {productName || "Converted from:"}
            </div>
            <motion.div 
              className="line-through text-white/90 text-lg font-semibold"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatCurrency(originalPrice, originalCurrency)}
            </motion.div>
            <motion.div 
              className="text-white text-2xl font-bold mt-1"
              animate={{ 
                textShadow: [
                  "0 0 5px rgba(255,255,255,0.5)", 
                  "0 0 10px rgba(255,255,255,0.8)", 
                  "0 0 5px rgba(255,255,255,0.5)"
                ] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatCurrency(convertedPrice, targetCurrency)}
            </motion.div>
            
            {/* Action buttons */}
            {!isLiveDetection && (
              <div className="mt-3 flex gap-2">
                {onSavePurchase && (
                  <Button 
                    size="sm" 
                    className="w-full text-xs bg-gradient-to-r from-emerald-600 to-teal-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSavePurchase();
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                )}
                {onCompareItem && (
                  <Button 
                    size="sm" 
                    className="w-full text-xs bg-gradient-to-r from-indigo-600 to-violet-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompareItem();
                    }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    Compare
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Corner recognition markers - AR-style corner brackets */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary opacity-80"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary opacity-80"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary opacity-80"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary opacity-80"></div>
    </>
  );

  return (
    <div className={cn("relative w-full", className)}>
      <div className="w-full aspect-auto relative overflow-hidden rounded-2xl border-2 border-primary/30 shadow-xl flex justify-center">
        <img 
          src={originalImage} 
          alt="Original price tag" 
          className="object-contain max-h-[400px] mx-auto"
        />
        
        {/* AR Scanning effect - horizontal line that moves up and down */}
        {isMounted && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
          </div>
        )}
        
        {/* AR overlay elements */}
        {isMounted && renderOverlayContent()}
      </div>
      
      {!isLiveDetection && (
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
      )}
    </div>
  );
};

export default AROverlay;
