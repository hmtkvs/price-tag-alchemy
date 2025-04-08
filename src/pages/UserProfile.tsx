import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, ShoppingBag, Tag, Trash2, Plus, Search, CircleX, MapPin, Plane, Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Purchase } from '@/models/Purchase';
import { getPurchases, addLabelToPurchase, deletePurchase } from '@/services/apiService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const UserProfile = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTripName, setNewTripName] = useState("");
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const [activeLocations, setActiveLocations] = useState<string[]>([]);
  const [activeTrips, setActiveTrips] = useState<string[]>([]);
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);
  const [groupByCurrency, setGroupByCurrency] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<"all" | "trips" | "locations">("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    filterPurchases();
  }, [purchases, searchTerm, activeLabels, activeLocations, activeTrips, activeView]);

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
        p.labels.some(l => l.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tripName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply label filters
    if (activeLabels.length > 0) {
      filtered = filtered.filter(p => 
        activeLabels.some(label => p.labels.includes(label))
      );
    }
    
    // Apply location filters
    if (activeLocations.length > 0) {
      filtered = filtered.filter(p => 
        p.location && activeLocations.includes(p.location)
      );
    }
    
    // Apply trip filters
    if (activeTrips.length > 0) {
      filtered = filtered.filter(p => 
        p.tripName && activeTrips.includes(p.tripName)
      );
    }
    
    // Filter by view
    if (activeView === "trips") {
      filtered = filtered.filter(p => p.tripName);
    } else if (activeView === "locations") {
      filtered = filtered.filter(p => p.location);
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

  const handleAddLocation = (purchaseId: string) => {
    if (!newLocation.trim()) {
      toast.error("Please enter a location");
      return;
    }
    
    const purchase = purchases.find(p => p.id === purchaseId);
    if (purchase) {
      purchase.location = newLocation.trim();
      toast.success(`Added location "${newLocation}" to purchase`);
      setNewLocation("");
      setPurchases([...purchases]);
    } else {
      toast.error("Failed to add location");
    }
  };

  const handleAddTrip = (purchaseId: string) => {
    if (!newTripName.trim()) {
      toast.error("Please enter a trip name");
      return;
    }
    
    const purchase = purchases.find(p => p.id === purchaseId);
    if (purchase) {
      purchase.tripName = newTripName.trim();
      toast.success(`Added to trip "${newTripName}"`);
      setNewTripName("");
      setPurchases([...purchases]);
    } else {
      toast.error("Failed to add to trip");
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

  const toggleLocationFilter = (location: string) => {
    if (activeLocations.includes(location)) {
      setActiveLocations(activeLocations.filter(l => l !== location));
    } else {
      setActiveLocations([...activeLocations, location]);
    }
  };

  const toggleTripFilter = (trip: string) => {
    if (activeTrips.includes(trip)) {
      setActiveTrips(activeTrips.filter(t => t !== trip));
    } else {
      setActiveTrips([...activeTrips, trip]);
    }
  };

  const getAllLabels = () => {
    const labels = new Set<string>();
    purchases.forEach(purchase => {
      purchase.labels.forEach(label => labels.add(label));
    });
    return Array.from(labels);
  };

  const getAllLocations = () => {
    const locations = new Set<string>();
    purchases.forEach(purchase => {
      if (purchase.location) {
        locations.add(purchase.location);
      }
    });
    return Array.from(locations);
  };

  const getAllTrips = () => {
    const trips = new Set<string>();
    purchases.forEach(purchase => {
      if (purchase.tripName) {
        trips.add(purchase.tripName);
      }
    });
    return Array.from(trips);
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

  const groupPurchasesByCurrency = () => {
    const groups: Record<string, Purchase[]> = {};
    
    filteredPurchases.forEach(purchase => {
      const currency = purchase.targetCurrency;
      if (!groups[currency]) {
        groups[currency] = [];
      }
      groups[currency].push(purchase);
    });
    
    return groups;
  };

  const groupPurchasesByTrip = () => {
    const groups: Record<string, Purchase[]> = {};
    
    filteredPurchases.forEach(purchase => {
      const trip = purchase.tripName || "Unassigned";
      if (!groups[trip]) {
        groups[trip] = [];
      }
      groups[trip].push(purchase);
    });
    
    return groups;
  };

  const groupPurchasesByLocation = () => {
    const groups: Record<string, Purchase[]> = {};
    
    filteredPurchases.forEach(purchase => {
      const location = purchase.location || "Unassigned";
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(purchase);
    });
    
    return groups;
  };

  const getCurrencySymbol = (currencyCode: string) => {
    try {
      return new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode })
        .formatToParts(1)
        .find(part => part.type === 'currency')?.value || currencyCode;
    } catch (e) {
      return currencyCode;
    }
  };

  let purchaseGroups: Record<string, Purchase[]>;
  
  if (activeView === "trips") {
    purchaseGroups = groupPurchasesByTrip();
  } else if (activeView === "locations") {
    purchaseGroups = groupPurchasesByLocation();
  } else {
    purchaseGroups = groupByCurrency ? groupPurchasesByCurrency() : { 'All': filteredPurchases };
  }

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
          <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setActiveView(value as "all" | "trips" | "locations")}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5 text-primary" />
                Purchase History
              </h2>
              
              <TabsList className="bg-white/10 border border-white/20 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                  All Purchases
                </TabsTrigger>
                <TabsTrigger value="trips" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                  <Plane className="h-4 w-4 mr-1" />
                  Trips
                </TabsTrigger>
                <TabsTrigger value="locations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                  <MapPin className="h-4 w-4 mr-1" />
                  Locations
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground">
                  {purchases.length} {purchases.length === 1 ? 'item' : 'items'} saved
                </div>
                
                {activeView === "all" && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={groupByCurrency ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGroupByCurrency(true)}
                      className={`text-xs ${!groupByCurrency ? "bg-white/10 border-white/20" : ""}`}
                    >
                      Group by Currency
                    </Button>
                    <Button
                      variant={!groupByCurrency ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGroupByCurrency(false)}
                      className={`text-xs ${groupByCurrency ? "bg-white/10 border-white/20" : ""}`}
                    >
                      Show All
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="trips" className="mt-0">
              <div className="text-sm text-muted-foreground mb-3">
                Organize your purchases by trips
              </div>
            </TabsContent>
            
            <TabsContent value="locations" className="mt-0">
              <div className="text-sm text-muted-foreground mb-3">
                View purchases by location
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search purchases, labels, trips or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 backdrop-blur-md border-white/20 h-12 rounded-xl"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchTerm("")}
                >
                  <CircleX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="mb-4 bg-white/10 border-white/20">
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {(activeLabels.length > 0 || activeLocations.length > 0 || activeTrips.length > 0) && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {activeLabels.length + activeLocations.length + activeTrips.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-white/10 backdrop-blur-xl border-white/20">
              <div className="space-y-4">
                {getAllLabels().length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Labels</h3>
                    <div className="flex flex-wrap gap-2">
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
                    </div>
                  </div>
                )}
                
                {getAllLocations().length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Locations</h3>
                    <div className="flex flex-wrap gap-2">
                      {getAllLocations().map(location => (
                        <Button
                          key={location}
                          size="sm"
                          variant={activeLocations.includes(location) ? "default" : "outline"}
                          className={`rounded-full text-xs ${
                            activeLocations.includes(location) 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-white/10 border-white/20"
                          }`}
                          onClick={() => toggleLocationFilter(location)}
                        >
                          <MapPin className="mr-1 h-3 w-3" />
                          {location}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {getAllTrips().length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Trips</h3>
                    <div className="flex flex-wrap gap-2">
                      {getAllTrips().map(trip => (
                        <Button
                          key={trip}
                          size="sm"
                          variant={activeTrips.includes(trip) ? "default" : "outline"}
                          className={`rounded-full text-xs ${
                            activeTrips.includes(trip) 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-white/10 border-white/20"
                          }`}
                          onClick={() => toggleTripFilter(trip)}
                        >
                          <Plane className="mr-1 h-3 w-3" />
                          {trip}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {(activeLabels.length > 0 || activeLocations.length > 0 || activeTrips.length > 0) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-full text-xs bg-white/10 border-white/20"
                    onClick={() => {
                      setActiveLabels([]);
                      setActiveLocations([]);
                      setActiveTrips([]);
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          {(activeLabels.length > 0 || activeLocations.length > 0 || activeTrips.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeLabels.map(label => (
                <div key={label} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs flex items-center">
                  <Tag className="mr-1 h-3 w-3" />
                  {label}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => toggleLabelFilter(label)}
                  >
                    <CircleX className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {activeLocations.map(location => (
                <div key={location} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  {location}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => toggleLocationFilter(location)}
                  >
                    <CircleX className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {activeTrips.map(trip => (
                <div key={trip} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs flex items-center">
                  <Plane className="mr-1 h-3 w-3" />
                  {trip}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => toggleTripFilter(trip)}
                  >
                    <CircleX className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs bg-white/10 border-white/20 h-6"
                onClick={() => {
                  setActiveLabels([]);
                  setActiveLocations([]);
                  setActiveTrips([]);
                }}
              >
                Clear all
              </Button>
            </div>
          )}
          
          {Object.keys(purchaseGroups).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(purchaseGroups).map(([groupKey, groupPurchases]) => (
                <div key={groupKey} className="mb-2">
                  <div className="flex items-center mb-2 sticky top-16 z-10 backdrop-blur-sm bg-background/70 py-2">
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                      {activeView === "trips" && <Plane className="mr-2 h-4 w-4" />}
                      {activeView === "locations" && <MapPin className="mr-2 h-4 w-4" />}
                      {activeView === "all" && groupByCurrency && getCurrencySymbol(groupKey)}
                      <span className="ml-2">{groupKey}</span>
                    </div>
                    <div className="ml-2 text-sm text-muted-foreground">
                      {groupPurchases.length} {groupPurchases.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {groupPurchases.map((purchase) => (
                      <motion.div
                        key={purchase.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="glass-panel border border-white/20 rounded-xl overflow-hidden"
                      >
                        <div 
                          className="flex items-center p-4 cursor-pointer hover:bg-white/5"
                          onClick={() => toggleExpandPurchase(purchase.id)}
                        >
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden mr-4 shadow-md">
                            <img 
                              src={purchase.imageUrl} 
                              alt={purchase.productName || "Purchase"} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-base">
                              {purchase.productName || "Unknown Product"}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              {formatDate(purchase.date)}
                              
                              {purchase.location && (
                                <span className="ml-2 flex items-center text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {purchase.location}
                                </span>
                              )}
                              
                              {purchase.tripName && (
                                <span className="ml-2 flex items-center text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  <Plane className="h-3 w-3 mr-1" />
                                  {purchase.tripName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
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
                          <div className="p-4 pt-0 border-t border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              
                              <div className="mb-3">
                                <div className="text-xs text-muted-foreground mb-1">Location:</div>
                                {purchase.location ? (
                                  <div className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs inline-flex items-center">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {purchase.location}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">No location set</div>
                                )}
                              </div>
                              
                              <div className="mb-3">
                                <div className="text-xs text-muted-foreground mb-1">Trip:</div>
                                {purchase.tripName ? (
                                  <div className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs inline-flex items-center">
                                    <Plane className="mr-1 h-3 w-3" />
                                    {purchase.tripName}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">Not part of a trip</div>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                              <div>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add a label..."
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    className="text-sm h-9 bg-white/10 border-white/20 rounded-l-lg"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddLabel(purchase.id);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    className="h-9 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-r-lg"
                                    onClick={() => handleAddLabel(purchase.id)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Label
                                  </Button>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add location..."
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    className="text-sm h-9 bg-white/10 border-white/20 rounded-l-lg"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddLocation(purchase.id);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    className="h-9 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-r-lg"
                                    onClick={() => handleAddLocation(purchase.id)}
                                  >
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Set
                                  </Button>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add to trip..."
                                    value={newTripName}
                                    onChange={(e) => setNewTripName(e.target.value)}
                                    className="text-sm h-9 bg-white/10 border-white/20 rounded-l-lg"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddTrip(purchase.id);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    className="h-9 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-r-lg"
                                    onClick={() => handleAddTrip(purchase.id)}
                                  >
                                    <Plane className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">No purchases saved yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || activeLabels.length > 0 || activeLocations.length > 0 || activeTrips.length > 0
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
