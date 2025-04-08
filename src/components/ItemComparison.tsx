
import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItemComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  price: number;
  currency: string;
  comparisons: Array<{
    productName: string;
    price: number;
    currency: string;
    source: string;
    difference: number;
    url?: string;
  }>;
}

const ItemComparison: React.FC<ItemComparisonProps> = ({
  isOpen,
  onClose,
  productName,
  price,
  currency,
  comparisons
}) => {
  if (!isOpen) return null;
  
  const formatCurrency = (value: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).format(value);
    } catch (error) {
      return `${value.toFixed(2)} ${currencyCode}`;
    }
  };
  
  const getDifferenceIcon = (diff: number) => {
    if (diff < -1) return <TrendingDown className="text-green-500 h-4 w-4 mr-1" />;
    if (diff > 1) return <TrendingUp className="text-red-500 h-4 w-4 mr-1" />;
    return <Minus className="text-yellow-500 h-4 w-4 mr-1" />;
  };
  
  const sortedComparisons = [...comparisons].sort((a, b) => a.price - b.price);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/20 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gradient-primary">Price Comparison</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-5">
          <div className="mb-6 glass-panel p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Your item:</div>
            <div className="text-xl font-semibold mb-1">{productName}</div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(price, currency)}
            </div>
          </div>
          
          <div className="mb-2 flex items-center">
            <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent flex-grow" />
            <span className="px-3 text-sm font-medium text-muted-foreground">Prices Online</span>
            <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent flex-grow" />
          </div>
          
          {sortedComparisons.length > 0 ? (
            <div className="space-y-4">
              {sortedComparisons.map((comparison, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel p-4 rounded-lg border border-white/10 hover:border-white/30 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{comparison.productName}</div>
                      <div className="text-sm text-muted-foreground mb-1">{comparison.source}</div>
                      <div className="text-lg font-bold">
                        {formatCurrency(comparison.price, comparison.currency)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-sm font-medium flex items-center ${
                        comparison.difference < 0 
                          ? 'text-green-500' 
                          : comparison.difference > 0 
                            ? 'text-red-500' 
                            : 'text-yellow-500'
                      }`}>
                        {getDifferenceIcon(comparison.difference)}
                        {comparison.difference < 0 
                          ? `${Math.abs(comparison.difference)}% cheaper` 
                          : comparison.difference > 0 
                            ? `${comparison.difference}% more expensive`
                            : 'Same price'}
                      </div>
                      
                      {comparison.url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="mt-2 text-xs bg-white/10 border-white/20 hover:bg-white/20"
                          onClick={() => window.open(comparison.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No comparison data available
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ItemComparison;
