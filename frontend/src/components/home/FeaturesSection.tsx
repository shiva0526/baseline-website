
import { Activity, Calendar, Users, Clock } from 'lucide-react';

const features = [
  {
    icon: <Activity size={48} className="text-baseline-yellow" />,
    title: "Elite Coaching",
    description: "Learn from coaches with professional and international experience."
  },
  {
    icon: <Calendar size={48} className="text-baseline-yellow" />,
    title: "Flexible Programs",
    description: "Choose from 3-day, 5-day, or one-on-one sessions to fit your schedule."
  },
  {
    icon: <Users size={48} className="text-baseline-yellow" />,
    title: "Community",
    description: "Join a supportive community of like-minded athletes pushing each other."
  },
  {
    icon: <Clock size={48} className="text-baseline-yellow" />,
    title: "Proven Results",
    description: "Our scientifically-backed training methods deliver measurable improvements."
  }
];

const FeaturesSection = () => {
  return (
    <section className="bg-gray-900 section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Why Choose <span className="gradient-text">BaseLine</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            At BaseLine Academy, we combine elite coaching, cutting-edge training techniques, and a supportive community to develop complete basketball players.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-black border border-gray-800 rounded-lg p-8 text-center card-hover"
            >
              <div className="flex justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
