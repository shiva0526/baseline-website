
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Baseline Elite transformed my game completely. The coaches understand how to push you to your limits while teaching proper technique. I went from bench player to team captain in just 6 months.",
    name: "Rohan Kumar",
    title: "College Player",
    image: "/images/player1.jpg",
    rating: 5
  },
  {
    quote: "The one-on-one coaching at Baseline gave me the edge I needed to make it to the state team. Their attention to detail and personalized approach is unmatched in the city.",
    name: "Priya Singh",
    title: "State Team Player",
    image: "/images/player2.jpg",
    rating: 5
  },
  {
    quote: "I've been to many basketball camps, but none compare to the level of training and personal development I received at Baseline. The facilities are world-class too.",
    name: "Arjun Mehta",
    title: "High School Player",
    image: "/images/player3.jpg",
    rating: 5
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative section-padding bg-gradient-to-b from-black to-gray-900 z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Player <span className="gradient-text">Success Stories</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Don't just take our word for it. Hear from the players who have transformed their game with Baseline Elite.
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          {/* Active Testimonial */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-8 md:p-12 mb-8"
              >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                    className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-baseline-yellow"
                  >
                    <img 
                      src={testimonials[activeIndex].image} 
                      alt={testimonials[activeIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  
                  <div className="text-center md:text-left">
                    <div className="flex justify-center md:justify-start mb-4">
                      {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                        <Star key={i} size={20} className="text-baseline-yellow" fill="currentColor" />
                      ))}
                    </div>
                    <blockquote className="text-xl md:text-2xl text-gray-100 mb-6 italic">
                      "{testimonials[activeIndex].quote}"
                    </blockquote>
                    <div className="text-baseline-yellow font-bold text-lg">
                      {testimonials[activeIndex].name}
                    </div>
                    <div className="text-gray-400">
                      {testimonials[activeIndex].title}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-baseline-yellow text-black rounded-full flex items-center justify-center hover:bg-baseline-yellow/90 transition-colors duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-baseline-yellow text-black rounded-full flex items-center justify-center hover:bg-baseline-yellow/90 transition-colors duration-300"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          {/* Testimonial Indicators */}
          <div className="flex justify-center gap-3">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveIndex(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeIndex === index ? 'bg-baseline-yellow scale-125' : 'bg-gray-600'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
