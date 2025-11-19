
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';


const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative h-screen overflow-hidden bg-black flex items-center">
      {/* Background Video - Only visible on right side */}
      <div className="absolute inset-0">
        <div className="w-full h-full flex">
          {/* Left side - solid black background */}
          <div className="w-1/2 bg-black"></div>
          
          {/* Right side - video with increased brightness */}
          <div className="w-1/2 relative opacity-70">
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover brightness-125"
            >
              <source src="/videos/baseline_1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
      
      {/* Gradient Overlay - lighter to allow video to show through on right */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/30"></div>
      
      {/* Content */}
      <div className="relative container mx-auto h-full flex items-center px-4 z-10">
        <div className="w-full flex items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl w-1/2"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6"
            >
              <span className="block">Level Up</span>
              <span className="block gradient-text">Your Game</span>
            </motion.h1>
            
            <motion.div 
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-200 mb-8 max-w-xl"
            >
              Join the elite basketball academy where champions are made. 
              Professional coaching, modern facilities, proven results.
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              <Link to="/programs" className="group">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-baseline-yellow text-baseline-black font-bold px-8 py-4 rounded-lg flex items-center gap-3 transition-all duration-300 hover:shadow-2xl hover:shadow-baseline-yellow/30"
                >
                  Join Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-baseline-yellow text-baseline-yellow font-bold px-8 py-4 rounded-lg transition-all duration-300 hover:bg-baseline-yellow hover:text-baseline-black"
                >
                  Learn More
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-0.5 h-16 bg-gradient-to-b from-baseline-yellow to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
