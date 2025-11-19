
import { motion } from 'framer-motion';
import { Award, Users, Clock, Target } from 'lucide-react';

const features = [
  {
    icon: <Award size={48} className="text-baseline-yellow" />,
    title: "Professional Coaches",
    description: "Learn from coaches with international experience and proven track records."
  },
  {
    icon: <Target size={48} className="text-baseline-yellow" />,
    title: "Modern Courts",
    description: "State-of-the-art facilities with professional-grade equipment and surfaces."
  },
  {
    icon: <Clock size={48} className="text-baseline-yellow" />,
    title: "Flexible Plans",
    description: "Choose from 3-day, 5-day, or personalized one-on-one coaching sessions."
  }
];

const WhyUsSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
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
            Why Choose <span className="gradient-text">Baseline Elite</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We provide world-class basketball training with cutting-edge facilities and expert coaching.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-8 text-center hover:border-baseline-yellow/50 transition-all duration-300"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                className="flex justify-center mb-6"
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyUsSection;
