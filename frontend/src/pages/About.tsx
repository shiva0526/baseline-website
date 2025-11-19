import { useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Activity } from 'lucide-react';

const About = () => {
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);

  const stats = [
    { value: "5+", label: "Years Experience" },
    { value: "500+", label: "Players Trained" },
    { value: "20+", label: "Professional Players" },
    { value: "95%", label: "Success Rate" }
  ];

  const coaches = [
    {
      name: "Vikram Singh",
      role: "Head Coach",
      bio: "Former national player with 15+ years of coaching experience.",
      image: "/images/coach1.jpg"
    },
    {
      name: "Ananya Patel",
      role: "Skills Development Coach",
      bio: "Specialized in shooting mechanics and offensive skills.",
      image: "/images/coach2.jpg"
    },
    {
      name: "Rajiv Sharma",
      role: "Strength & Conditioning",
      bio: "Certified strength coach focused on athlete performance.",
      image: "/images/coach3.jpg"
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
              About <span className="gradient-text">BaseLine</span> Academy
            </h1>
            <p className="text-xl text-gray-300">
              Founded with a vision to transform basketball training in India through science, experience, and passion.
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="section-padding bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Our <span className="gradient-text">Story</span>
              </h2>
              <p className="text-gray-300 mb-4">
                BaseLine Academy was founded in 2018 with a simple mission: to develop elite basketball players through scientific training methods and personalized coaching.
              </p>
              <p className="text-gray-300 mb-4">
                What started as small training sessions has grown into one of the most respected basketball academies in the region, known for developing complete players who excel at every aspect of the game.
              </p>
              <p className="text-gray-300">
                Today, BaseLine Academy alumni play at collegiate and professional levels across the country, carrying forward the training philosophy and work ethic they developed here.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-800">
              <img 
                src="/images/academy-story.jpg" 
                alt="BaseLine Academy Story" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Counter */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                ref={(el) => (statRefs.current[index] = el)}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-display font-bold text-baseline-yellow mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Our Coaches */}
      <section className="section-padding bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Meet Our <span className="gradient-text">Coaches</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our coaching staff brings professional experience and a passion for developing players to their fullest potential.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coaches.map((coach, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover-scale"
              >
                <div className="h-72 overflow-hidden">
                  <img 
                    src={coach.image} 
                    alt={coach.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{coach.name}</h3>
                  <div className="text-baseline-yellow font-medium mb-4">{coach.role}</div>
                  <p className="text-gray-300">{coach.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Philosophy */}
      <section className="section-padding bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <Activity size={48} className="text-baseline-yellow" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-8">
              Our Training <span className="gradient-text">Philosophy</span>
            </h2>
            
            <div className="space-y-6">
              <div className="bg-black p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">Fundamentals First</h3>
                <p className="text-gray-300">
                  We believe that mastering the fundamentals creates the foundation for advanced skills. Every player at BaseLine starts with perfecting the basics.
                </p>
              </div>
              
              <div className="bg-black p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">Scientific Approach</h3>
                <p className="text-gray-300">
                  Our training methods are backed by sports science and biomechanics, ensuring that players develop efficient movement patterns and techniques.
                </p>
              </div>
              
              <div className="bg-black p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">Mental Toughness</h3>
                <p className="text-gray-300">
                  Basketball is as much mental as it is physical. We develop players who are resilient, focused, and able to perform under pressure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;
