
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const programs = [
  {
    title: "3-Day Batch",
    price: "₹1000",
    period: "per week",
    features: [
      "3 training sessions per week",
      "Strength & conditioning",
      "Shooting mechanics focus",
      "Group drills and games"
    ],
    cta: "Enroll Now",
    link: "/programs"
  },
  {
    title: "5-Day Batch",
    price: "₹2000",
    period: "per week",
    features: [
      "5 training sessions per week",
      "Advanced skill development",
      "Video analysis of technique",
      "Personalized feedback"
    ],
    cta: "Enroll Now",
    link: "/programs",
    featured: true
  },
  {
    title: "One-to-One Coaching",
    price: "₹3000",
    period: "per week",
    features: [
      "Personalized training plan",
      "Private coaching sessions",
      "Detailed progress tracking",
      "Position-specific training"
    ],
    cta: "Enroll Now",
    link: "/programs"
  }
];

const ProgramsPreview = () => {
  return (
    <section className="section-padding bg-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Training <span className="gradient-text">Programs</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Choose the program that fits your goals and schedule. All programs include access to our state-of-the-art facilities and equipment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {programs.map((program, index) => (
            <div 
              key={index} 
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
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-display font-bold text-baseline-yellow">{program.price}</span>
                  <span className="text-gray-400 ml-1">{program.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-baseline-yellow mr-2">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to={program.link} 
                  className={`w-full text-center py-3 px-6 rounded-md font-semibold transition-all duration-300 ${
                    program.featured 
                      ? 'bg-baseline-yellow text-black hover:bg-opacity-90' 
                      : 'bg-transparent border-2 border-baseline-yellow text-baseline-yellow hover:bg-baseline-yellow hover:text-black'
                  }`}
                >
                  {program.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/programs" className="inline-flex items-center text-baseline-yellow hover:underline font-semibold">
            View All Programs <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProgramsPreview;
