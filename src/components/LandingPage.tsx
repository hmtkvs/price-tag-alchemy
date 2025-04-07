
import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Camera, RefreshCw, Zap, Globe, Lock, ArrowRight } from "lucide-react";

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-16 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl" />
        </div>
        
        {/* Animated Title */}
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6 text-gradient-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Price Tag Alchemy
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl mb-8 max-w-md text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Transform price tags from any currency into your preferred one with augmented reality magic
        </motion.p>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            onClick={onGetStarted} 
            className="glass-button text-lg px-8 py-6 rounded-full group"
            size="lg"
          >
            <Camera className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Begin Transformation
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* AR Illustration */}
        <motion.div 
          className="relative mt-16 max-w-lg w-full h-64 ar-recognition-frame"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="glass-panel w-full h-full flex items-center justify-center ar-data-processing">
            <div className="ar-pointer flex flex-col items-center">
              <div className="text-3xl font-bold mb-2">$24.99</div>
              <div className="text-sm text-primary">→</div>
              <div className="text-3xl font-bold mt-2">€22.89</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Futuristic Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              className="glass-panel p-6 ar-overlay"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 rounded-full glass-button flex items-center justify-center mb-4">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Recognition</h3>
              <p className="text-muted-foreground">Point your camera at any price tag and our AI will instantly detect the price and currency</p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="glass-panel p-6 ar-overlay"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 rounded-full glass-button flex items-center justify-center mb-4">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Conversion</h3>
              <p className="text-muted-foreground">Convert prices between 160+ global currencies with up-to-date exchange rates</p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="glass-panel p-6 ar-overlay"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 rounded-full glass-button flex items-center justify-center mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AR Visualization</h3>
              <p className="text-muted-foreground">See converted prices overlaid in augmented reality right on top of the original price tag</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials/Trust Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background/50 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Trusted by Travelers Worldwide</h2>
          
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <motion.div 
              className="glass-panel p-6 max-w-sm ar-data-processing"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <p className="mb-4 italic">"This app saved me from overpaying while shopping in Tokyo. The AR overlay makes it so easy to understand prices instantly!"</p>
              <p className="font-semibold">- Alex, Travel Blogger</p>
            </motion.div>
            
            <motion.div 
              className="glass-panel p-6 max-w-sm ar-data-processing"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p className="mb-4 italic">"As someone who travels for business, this app is now essential. It helps me make quick purchasing decisions without doing manual conversions."</p>
              <p className="font-semibold">- Morgan, Business Traveler</p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Button 
              onClick={onGetStarted} 
              className="glass-button rounded-full"
              size="lg"
            >
              Try It Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform How You Shop Abroad?</h2>
          <p className="text-lg mb-8 text-muted-foreground">Start converting price tags into your currency in seconds with our futuristic AR technology</p>
          
          <Button 
            onClick={onGetStarted} 
            className="glass-button text-lg px-8 py-6 rounded-full"
            size="lg"
          >
            <Camera className="mr-2 h-5 w-5" />
            Launch AR Experience
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground mb-4 md:mb-0">Price Tag Alchemy © {new Date().getFullYear()}</p>
          
          <div className="flex gap-6">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
