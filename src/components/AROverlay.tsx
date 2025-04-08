
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowDown, Plus, Tag, CircleDollarSign, Receipt, FileText } from "lucide-react";
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
  isReceipt?: boolean;
  isMenu?: boolean;
  restaurantName?: string;
  storeName?: string;
  items?: Array<{
    name: string;
    price: number;
    currency: string;
    quantity?: number;
    category?: string;
    description?: string;
  }>;
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
  productName,
  isReceipt = false,
  isMenu = false,
  restaurantName,
  storeName,
  items = []
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

  // Precisely position the overlay based on the content type
  const getOverlayPosition = () => {
    if (isReceipt) {
      return {
        top: '70%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    } else if (isMenu) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    } else if (originalImage.includes("a6e5d0e0-0f29-40a9-beac-d8eb1b10e6ba") || originalCurrency === 'TRY') {
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
    if (isReceipt || isMenu) {
      // Don't show arrow for receipts or menus
      return { display: 'none' };
    } else if (originalImage.includes("a6e5d0e0-0f29-40a9-beac-d8eb1b10e6ba") || originalCurrency === 'TRY') {
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

  // Get appropriate icon based on content type
  const getContentIcon = () => {
    if (isReceipt) return <Receipt className="h-5 w-5 mr-2" />;
    if (isMenu) return <FileText className="h-5 w-5 mr-2" />;
    return <CircleDollarSign className="h-5 w-5 mr-2" />;
  };

  // Get appropriate title based on content type
  const getContentTitle = () => {
    if (isReceipt) return storeName || "Receipt";
    if (isMenu) return restaurantName || "Menu";
    return productName || "Price";
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
      
      {/* Content display - different for price tags, receipts, and menus */}
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
        <div className={cn(
          "ar-overlay bg-gradient-to-br from-black/70 to-primary/60 rounded-lg backdrop-blur-md border border-white/30 shadow-xl",
          isReceipt || isMenu ? "p-4 max-w-xs w-full" : "p-4 min-w-[180px]"
        )}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {getContentIcon()}
              <span className="text-white font-semibold text-lg">
                {getContentTitle()}
              </span>
            </div>
            
            {/* Different display based on content type */}
            {isReceipt ? (
              <div className="text-left">
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {items && items.length > 0 ? items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-white/90 truncate mr-2">{item.name}</span>
                      <span className="text-white font-medium whitespace-nowrap">
                        {formatCurrency(item.price, item.currency || originalCurrency)}
                      </span>
                    </div>
                  )) : (
                    <div className="text-white/80 text-sm">No items detected</div>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total:</span>
                    <span className="text-white">
                      {formatCurrency(originalPrice, originalCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1 font-medium">
                    <span>Converted:</span>
                    <span className="text-white">
                      {formatCurrency(convertedPrice, targetCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            ) : isMenu ? (
              <div className="text-left">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {/* Group by category if available */}
                  {items && items.length > 0 ? (
                    (() => {
                      const categories = [...new Set(items.map(item => item.category || 'Other'))];
                      return categories.map(category => (
                        <div key={category} className="mb-2">
                          <div className="text-white/80 text-xs uppercase tracking-wider mb-1">{category}</div>
                          {items
                            .filter(item => (item.category || 'Other') === category)
                            .map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm mb-1">
                                <span className="text-white/90 truncate mr-2">{item.name}</span>
                                <span className="text-white font-medium whitespace-nowrap">
                                  {formatCurrency(item.price, item.currency || originalCurrency)}
                                </span>
                              </div>
                            ))
                          }
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="text-white/80 text-sm">No menu items detected</div>
                  )}
                </div>
              </div>
            ) : (
              // Standard price tag display
              <>
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
              </>
            )}
            
            {/* Action buttons - same for all types */}
            {!isLiveDetection && (
              <div className="mt-3 flex gap-2">
                {onSavePurchase && (
                  <Button 
                    size="sm" 
                    className="w-full text-xs bg-gradient-to-r from-emerald-600 to-teal-600 touch-target"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSavePurchase();
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                )}
                {onCompareItem && !isMenu && !isReceipt && (
                  <Button 
                    size="sm" 
                    className="w-full text-xs bg-gradient-to-r from-indigo-600 to-violet-600 touch-target"
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
      <div className="w-full aspect-auto relative overflow-hidden rounded-2xl border-2 border-primary/30 shadow-xl flex justify-center gesture-card">
        <img 
          src={originalImage} 
          alt={isReceipt ? "Receipt" : isMenu ? "Menu" : "Price tag"} 
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
            <span className="font-semibold high-contrast-text">
              {formatCurrency(originalPrice, originalCurrency)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm opacity-80">Converted:</span>
            <span className="font-semibold high-contrast-text">
              {formatCurrency(convertedPrice, targetCurrency)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="opacity-80">Rate:</span>
            <span className="subtle-text">
              1 {originalCurrency} = {conversionRate.toFixed(4)} {targetCurrency}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AROverlay;
