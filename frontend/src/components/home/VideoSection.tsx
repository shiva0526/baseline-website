
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const VideoSection = () => {
  return (
    <section className="relative section-padding bg-black z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Training <span className="gradient-text">Highlights</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Watch our players in action and see the transformation that happens at Baseline Elite.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-baseline-yellow/20 to-baseline-yellow/5 p-1">
            <div className="bg-black rounded-xl overflow-hidden">
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center group cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 bg-baseline-yellow rounded-full flex items-center justify-center group-hover:bg-baseline-yellow/90 transition-colors duration-300"
                >
                  <Play size={32} className="text-black ml-1" fill="currentColor" />
                </motion.div>
                
                {/* Placeholder for video thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 opacity-50" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm opacity-75">Training Highlights</p>
                  <p className="font-semibold">Watch Our Players Excel</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video cursor-pointer group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-12 h-12 bg-baseline-yellow/80 rounded-full flex items-center justify-center"
                  >
                    <Play size={20} className="text-black ml-0.5" fill="currentColor" />
                  </motion.div>
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-sm font-medium">Training Session {item}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
