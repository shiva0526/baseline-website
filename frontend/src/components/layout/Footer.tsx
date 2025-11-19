
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Footer = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    });
  };

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <footer className="bg-black text-white relative z-10">
      <div className="container mx-auto">
        {/* Top section */}
        <motion.div
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16 px-4"
        >
          {/* Logo & About */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Link to="/" className="inline-block">
              <img 
                src="/images/Logo.png" 
                alt="BaseLine Academy" 
                className="h-16 mb-4" 
              />
            </Link>
            <p className="text-gray-300 leading-relaxed">
              Baseline Elite provides world-class basketball training, developing athletes who want to excel in their game and reach professional levels.
            </p>
            <div className="flex gap-4">
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href="https://www.instagram.com/baseline_academy_foundation/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-baseline-yellow text-black rounded-full flex items-center justify-center hover:bg-baseline-yellow/90 transition-colors"
              >
                <Instagram size={20} />
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => copyToClipboard('info@baselineelite.com', 'Email')}
                className="w-10 h-10 bg-baseline-yellow text-black rounded-full flex items-center justify-center hover:bg-baseline-yellow/90 transition-colors"
              >
                <Mail size={20} />
              </motion.button>
            </div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h4 className="font-display font-bold text-xl text-baseline-yellow">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-3">
              {['Home', 'About Us', 'Programs', 'Gallery', 'Contact'].map((link) => (
                <motion.div
                  key={link}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    to={`/${link.toLowerCase().replace(' ', '-')}`} 
                    className="hover:text-baseline-yellow transition-colors duration-200 text-gray-300"
                  >
                    {link}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
          
          {/* Programs */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h4 className="font-display font-bold text-xl text-baseline-yellow">
              Training Programs
            </h4>
            <nav className="flex flex-col space-y-3">
              {['3-Day Batch', '5-Day Batch', 'One-to-One Coaching', 'Elite Training'].map((program) => (
                <motion.div
                  key={program}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    to="/programs" 
                    className="hover:text-baseline-yellow transition-colors duration-200 text-gray-300"
                  >
                    {program}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
          
          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h4 className="font-display font-bold text-xl text-baseline-yellow">
              Contact Us
            </h4>
            <div className="space-y-4">
              <motion.button
                whileHover={{ x: 5 }}
                onClick={() => copyToClipboard('+91 90000 00000', 'Phone number')}
                className="flex items-center gap-4 text-gray-300 hover:text-baseline-yellow transition-colors cursor-pointer"
              >
                <Phone className="text-baseline-yellow" size={20} />
                <span>+91 90000 00000</span>
              </motion.button>
              <motion.button
                whileHover={{ x: 5 }}
                onClick={() => copyToClipboard('info@baselineelite.com', 'Email')}
                className="flex items-center gap-4 text-gray-300 hover:text-baseline-yellow transition-colors cursor-pointer"
              >
                <Mail className="text-baseline-yellow" size={20} />
                <span>info@baselineelite.com</span>
              </motion.button>
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 text-gray-300"
              >
                <MapPin className="text-baseline-yellow" size={20} />
                <span>Basketball Courts, City Center</span>
              </motion.div>
              <div className="mt-6">
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-baseline-yellow text-baseline-yellow font-semibold px-6 py-3 rounded-lg hover:bg-baseline-yellow hover:text-black transition-all duration-300"
                  >
                    Get in Touch
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Bottom / Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="border-t border-gray-800 py-8 px-4 text-center text-gray-400"
        >
          <p>© {new Date().getFullYear()} Baseline Elite Academy. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
