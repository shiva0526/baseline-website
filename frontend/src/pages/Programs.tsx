
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Programs = () => {
  const programDetails = [
    {
      id: "3day",
      title: "3-Day Batch",
      price: "₹1000",
      period: "per week",
      description: "Perfect for players looking to improve their skills while balancing other commitments.",
      features: [
        "3 training sessions per week (1.5 hours each)",
        "Focus on fundamental skill development",
        "Small group training (max 12 players)",
        "Basic strength and conditioning",
        "Monthly progress reports",
        "Access to training videos and resources"
      ],
      ideal: "Beginners and intermediate players with limited time"
    },
    {
      id: "5day",
      title: "5-Day Batch",
      price: "₹2000",
      period: "per week",
      description: "Our most popular program for serious players looking to make significant improvements.",
      features: [
        "5 training sessions per week (2 hours each)",
        "Comprehensive skill development",
        "Advanced tactical training",
        "Specialized strength and conditioning",
        "Video analysis sessions",
        "Personalized feedback and development plans",
        "Access to practice games and scrimmages"
      ],
      ideal: "Intermediate to advanced players committed to rapid improvement",
      featured: true
    },
    {
      id: "oneone",
      title: "One-to-One Coaching",
      price: "₹3000",
      period: "per week",
      description: "Customized training focused entirely on your specific needs and goals.",
      features: [
        "Private sessions with elite coaches",
        "Fully personalized training program",
        "Detailed performance analysis",
        "Position-specific skill development",
        "Custom strength and conditioning plan",
        "Regular progress evaluations",
        "24/7 coach communication and support"
      ],
      ideal: "Players seeking rapid development or specialization"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Training <span className="gradient-text">Programs</span>
            </h1>
            <p className="text-xl text-gray-300">
              Select the program that aligns with your goals, availability, and commitment level.
            </p>
          </div>
        </div>
      </section>
      
      {/* Programs Comparison */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {programDetails.map((program) => (
              <div 
                key={program.id}
                className={`rounded-lg overflow-hidden ${
                  program.featured 
                    ? 'border-2 border-baseline-yellow animate-glow relative -mt-4' 
                    : 'border border-gray-800'
                }`}
              >
                {program.featured && (
                  <div className="absolute top-0 right-0 bg-baseline-yellow text-black font-semibold px-4 py-1 rounded-bl-lg">
                    Popular
                  </div>
                )}
                
                <div className="p-8 bg-gray-900">
                  <h3 className="text-2xl font-bold text-white mb-4">{program.title}</h3>
                  <div className="flex items-end mb-4">
                    <span className="text-4xl font-display font-bold text-baseline-yellow">{program.price}</span>
                    <span className="text-gray-400 ml-1">{program.period}</span>
                  </div>
                  
                  <p className="text-gray-300 mb-6">
                    {program.description}
                  </p>
                  
                  <div className="mb-8">
                    <div className="font-semibold text-white mb-3">What's included:</div>
                    <ul className="space-y-3">
                      {program.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="text-baseline-yellow mr-2 flex-shrink-0 mt-1" size={16} />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <div className="font-semibold text-white mb-2">Ideal for:</div>
                    <p className="text-gray-300">{program.ideal}</p>
                  </div>
                  
                  <Link 
                    to="/schedule" 
                    className={`w-full text-center py-3 px-6 rounded-md font-semibold transition-all duration-300 ${
                      program.featured 
                        ? 'bg-baseline-yellow text-black hover:bg-opacity-90' 
                        : 'bg-transparent border-2 border-baseline-yellow text-baseline-yellow hover:bg-baseline-yellow hover:text-black'
                    }`}
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQs */}
      <section className="section-padding bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            
            <div className="space-y-6">
              <div className="bg-black p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">How do I know which program is right for me?</h3>
                <p className="text-gray-300">
                  We recommend scheduling a free assessment session where our coaches can evaluate your current skill level and discuss your goals to recommend the best program for you.
                </p>
              </div>
              
              <div className="bg-black p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">Can I switch between programs?</h3>
                <p className="text-gray-300">
                  Yes, you can upgrade or change your program at any time based on your progress and changing needs. Our coaches will help ensure a smooth transition.
                </p>
              </div>
              
              <div className="bg-black p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">What equipment do I need to bring?</h3>
                <p className="text-gray-300">
                  Just bring your basketball shoes, comfortable athletic wear, and a water bottle. We provide all the necessary training equipment and basketballs.
                </p>
              </div>
              
              <div className="bg-black p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">Is there an age requirement?</h3>
                <p className="text-gray-300">
                  We offer programs for players aged 8 and up, with groups divided by age and skill level to ensure appropriate training for everyone.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-300 mb-6">
                Still have questions about our training programs?
              </p>
              <Link to="/contact" className="button-outline flex items-center gap-2 justify-center mx-auto max-w-xs">
                Contact Us <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Programs;
