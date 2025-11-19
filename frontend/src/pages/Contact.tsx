
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Phone, Mail, MapPin, Instagram, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Here you would typically send the form data to your backend
    
    toast({
      title: "Message Sent",
      description: "Thanks for reaching out! We'll get back to you shortly.",
    });
    
    // Reset form
    (e.target as HTMLFormElement).reset();
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-gray-300">
              Have questions or ready to join? We're here to help you take your game to the next level.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Details */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover-scale">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-baseline-yellow flex items-center justify-center">
                  <Phone size={28} className="text-black" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Call Us</h3>
              <p className="text-center text-gray-300">
                +91 90000 00000
              </p>
              <p className="text-center text-gray-300">
                Mon-Sat, 9am-7pm
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover-scale">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-baseline-yellow flex items-center justify-center">
                  <Mail size={28} className="text-black" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Email Us</h3>
              <p className="text-center text-gray-300">
                info@baselineacademy.com
              </p>
              <p className="text-center text-gray-300">
                We respond within 24 hours
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover-scale">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-baseline-yellow flex items-center justify-center">
                  <Instagram size={28} className="text-black" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Follow Us</h3>
              <p className="text-center text-gray-300">
                @baselineacademy
              </p>
              <p className="text-center text-gray-300">
                For latest updates and content
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">
                Send Us a <span className="gradient-text">Message</span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-baseline-yellow focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-baseline-yellow focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-baseline-yellow focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-baseline-yellow focus:outline-none"
                  ></textarea>
                </div>
                
                <Button
                  type="submit"
                  className="bg-baseline-yellow hover:bg-opacity-90 text-black font-semibold px-8 py-3 rounded-md flex items-center"
                >
                  Send Message <ArrowRight size={18} className="ml-2" />
                </Button>
              </form>
            </div>
            
            {/* Map and Location */}
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">
                Visit Our <span className="gradient-text">Academy</span>
              </h2>
              
              <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
                {/* Placeholder for Google Map */}
                <div className="aspect-video bg-gray-700 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={48} className="mx-auto text-baseline-yellow mb-2" />
                      <p className="text-white font-medium">Map will be loaded here</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-bold text-xl mb-3">BaseLine Academy</h3>
                <p className="text-gray-300 mb-4">
                  123 Basketball Court,<br />
                  Sports Complex, Stadium Road,<br />
                  New Delhi - 110001
                </p>
                
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h4 className="font-semibold mb-2">Training Hours</h4>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div>Monday - Friday:</div>
                    <div>8:00 AM - 9:00 PM</div>
                    
                    <div>Saturday:</div>
                    <div>9:00 AM - 6:00 PM</div>
                    
                    <div>Sunday:</div>
                    <div>Closed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="section-padding bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            
            <div className="space-y-6">
              <div className="bg-black p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">How do I join BaseLine Academy?</h3>
                <p className="text-gray-300">
                  The easiest way to join is to fill out the contact form above, or give us a call. We'll schedule an assessment session to determine the best program for your skill level and goals.
                </p>
              </div>
              
              <div className="bg-black p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">Do you offer trial sessions?</h3>
                <p className="text-gray-300">
                  Yes, we offer a free trial session for new players. This allows you to experience our training methods and meet our coaches before committing to a program.
                </p>
              </div>
              
              <div className="bg-black p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-3">What should I bring to training?</h3>
                <p className="text-gray-300">
                  Just bring your basketball shoes, comfortable athletic wear, and a water bottle. We provide all the necessary training equipment and basketballs.
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

export default Contact;
