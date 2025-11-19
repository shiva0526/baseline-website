
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

const plans = [
  {
    title: "3-Day Batch",
    price: "₹1,000",
    period: "per week",
    features: [
      "3 training sessions per week",
      "Strength & conditioning",
      "Shooting mechanics focus",
      "Group drills and games",
      "Basic progress tracking"
    ],
    cta: "Get Started",
    link: "/programs"
  },
  {
    title: "5-Day Batch",
    price: "₹2,000",
    period: "per week",
    features: [
      "5 training sessions per week",
      "Advanced skill development",
      "Video analysis of technique",
      "Personalized feedback",
      "Position-specific training",
      "Nutrition guidance"
    ],
    cta: "Most Popular",
    link: "/programs",
    featured: true
  },
  {
    title: "1-on-1 Coaching",
    price: "₹3,000",
    period: "per week",
    features: [
      "Personalized training plan",
      "Private coaching sessions",
      "Detailed progress tracking",
      "Position-specific training",
      "Mental conditioning",
      "Priority scheduling"
    ],
    cta: "Go Elite",
    link: "/programs"
  }
];

const PricingSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative section-padding bg-gradient-to-b from-gray-900 to-black z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Choose Your <span className="gradient-text">Training Plan</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Flexible plans designed to fit your schedule and goals. All plans include access to our premium facilities.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className={`relative rounded-2xl overflow-hidden backdrop-blur-lg ${
                plan.featured 
                  ? 'bg-gradient-to-b from-baseline-yellow/20 to-baseline-yellow/5 border-2 border-baseline-yellow shadow-2xl shadow-baseline-yellow/20' 
                  : 'bg-black/50 border border-gray-800'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-baseline-yellow text-black font-bold px-4 py-2 rounded-bl-2xl flex items-center gap-1">
                  <Star size={16} fill="currentColor" />
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-8">{plan.title}</h3>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Check size={20} className="text-baseline-yellow mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <Link to={plan.link}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                      plan.featured 
                        ? 'bg-baseline-yellow text-black hover:bg-baseline-yellow/90 shadow-lg shadow-baseline-yellow/30' 
                        : 'bg-transparent border-2 border-baseline-yellow text-baseline-yellow hover:bg-baseline-yellow hover:text-black'
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
