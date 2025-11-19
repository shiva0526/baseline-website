
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-8 md:p-12 relative overflow-hidden">
          {/* Yellow accent elements */}
          <div className="absolute top-0 left-0 w-1/3 h-1 bg-baseline-yellow"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1 bg-baseline-yellow"></div>
          
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Ready to Elevate Your Game?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join BaseLine Academy today and start your journey toward basketball excellence. Limited spots available for each program.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/programs" className="button-primary flex items-center justify-center gap-2">
                View Programs <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="button-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
