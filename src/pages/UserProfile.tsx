
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, ShoppingBag, Tag, Trash2, Plus, Search, CircleX
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Purchase } from '@/models/Purchase';
import { getPurchases, addLabelToPurchase, deletePurchase } from '@/services/apiService';

const UserProfile = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    filterPurchases();
  }, [purchases, searchTerm, activeLabels]);

  const loadPurchases = () => {
    const loadedPurchases = getPurchases();
    setPurchases(loadedPurchases);
  };

  const filterPurchases = () => {
    let filtered = [...purchases];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.labels.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply label filters
    if (activeLabels.length > 0) {
      filtered = filtered.filter(p => 
        activeLabels.some(label => p.labels.includes(label))
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredPurchases(filtered);
  };

  const handleAddLabel = (purchaseId: string) => {
    if (!newLabel.trim()) {
      toast.error("Please enter a label name");
      return;
    }
    
    const success = addLabelToPurchase(purchaseId, newLabel.trim());
    if (success) {
      toast.success(`Added label "${newLabel}" to purchase`);
      setNewLabel("");
      loadPurchases();
    } else {
      toast.error("Failed to add label");
    }
  };

  const handleDeletePurchase = (purchaseId: string) => {
    const success = deletePurchase(purchaseId);
    if (success) {
      toast.success("Purchase deleted");
      loadPurchases();
    } else {
      toast.error("Failed to delete purchase");
    }
  };

  const toggleExpandPurchase = (purchaseId: string) => {
    if (expandedPurchase === purchaseId) {
      setExpandedPurchase(null);
    } else {
      setExpandedPurchase(purchaseId);
    }
  };

  const toggleLabelFilter = (label: string) => {
    if (activeLabels.includes(label)) {
      setActiveLabels(activeLabels.filter(l => l !== label));
    } else {
      setActiveLabels([...activeLabels, label]);
    }
  };

  const getAllLabels = () => {
    const labels = new Set<string>();
    purchases.forEach(purchase => {
      purchase.labels.forEach(label => labels.add(label));
    });
    return Array.from(labels);
  };

  const formatCurrency = (value: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    });
    
    try {
      return formatter.format(value);
    } catch (error) {
      // Fallback for unsupported currencies
      return `${value.toFixed(2)} ${currency}`;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <header className="p-4 flex items-center justify-between backdrop-blur-md bg-background/80 border-b border-border/30 sticky top-0 z-50">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/')}
            className="mr-3 rounded-full bg-white/10 border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gradient-primary">Your Profile</h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4 max-w-3xl">
        <div className="glass-panel p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5 text-primary" />
              Purchase History
            </h2>
            <div className="text-sm text-muted-foreground">
              {purchases.length} {purchases.length === 1 ? 'item' : 'items'} saved
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search purchases or labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 backdrop-blur-md border-white/20"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchTerm("")}
                >
                  <CircleX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Label filters */}
          {getAllLabels().length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {getAllLabels().map(label => (
                <Button
                  key={label}
                  size="sm"
                  variant={activeLabels.includes(label) ? "default" : "outline"}
                  className={`rounded-full text-xs ${
                    activeLabels.includes(label) 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-white/10 border-white/20"
                  }`}
                  onClick={() => toggleLabelFilter(label)}
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {label}
                </Button>
              ))}
              {activeLabels.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs bg-white/10 border-white/20"
                  onClick={() => setActiveLabels([])}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
          
          {/* Purchases list */}
          {filteredPurchases.length > 0 ? (
            <div className="space-y-4">
              {filteredPurchases.map((purchase) => (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="glass-panel border border-white/20 rounded-lg overflow-hidden"
                >
                  <div 
                    className="flex items-center p-3 cursor-pointer hover:bg-white/5"
                    onClick={() => toggleExpandPurchase(purchase.id)}
                  >
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden mr-3">
                      <img 
                        src={purchase.imageUrl} 
                        alt={purchase.productName || "Purchase"} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {purchase.productName || "Unknown Product"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(purchase.date)}
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm line-through mr-2 opacity-70">
                          {formatCurrency(purchase.originalPrice, purchase.originalCurrency)}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(purchase.convertedPrice, purchase.targetCurrency)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePurchase(purchase.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {expandedPurchase === purchase.id && (
                    <div className="p-3 pt-0 border-t border-white/10">
                      {/* Labels */}
                      <div className="mb-3">
                        <div className="text-xs text-muted-foreground mb-1">Labels:</div>
                        <div className="flex flex-wrap gap-2">
                          {purchase.labels.length > 0 ? (
                            purchase.labels.map(label => (
                              <div 
                                key={label}
                                className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs flex items-center"
                              >
                                <Tag className="mr-1 h-3 w-3" />
                                {label}
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground">No labels yet</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Add new label */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a label..."
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          className="text-sm h-8 bg-white/10 border-white/20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddLabel(purchase.id);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          className="h-8 bg-gradient-to-r from-indigo-600 to-blue-600"
                          onClick={() => handleAddLabel(purchase.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">No purchases saved yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || activeLabels.length > 0 
                  ? "Try a different search or filter" 
                  : "Your purchase history will appear here"}
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                Scan a Price Tag
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
