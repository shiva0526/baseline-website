
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Schedule = () => {
  const { toast } = useToast();
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    experience: 'beginner'
  });

  const batches = [
    {
      id: '3day',
      title: '3-Day Batch',
      price: '₹1000/week',
      schedule: [
        { day: 'Monday', times: ['4:00 PM - 5:30 PM', '6:00 PM - 7:30 PM'] },
        { day: 'Wednesday', times: ['4:00 PM - 5:30 PM', '6:00 PM - 7:30 PM'] },
        { day: 'Friday', times: ['4:00 PM - 5:30 PM', '6:00 PM - 7:30 PM'] }
      ]
    },
    {
      id: '5day',
      title: '5-Day Batch',
      price: '₹2000/week',
      schedule: [
        { day: 'Monday', times: ['4:00 PM - 6:00 PM', '6:30 PM - 8:30 PM'] },
        { day: 'Tuesday', times: ['4:00 PM - 6:00 PM', '6:30 PM - 8:30 PM'] },
        { day: 'Wednesday', times: ['4:00 PM - 6:00 PM', '6:30 PM - 8:30 PM'] },
        { day: 'Thursday', times: ['4:00 PM - 6:00 PM', '6:30 PM - 8:30 PM'] },
        { day: 'Friday', times: ['4:00 PM - 6:00 PM', '6:30 PM - 8:30 PM'] }
      ]
    },
    {
      id: 'oneone',
      title: 'One-to-One Coaching',
      price: '₹3000/week',
      schedule: [
        { day: 'Available all days', times: ['Schedule according to your availability'] }
      ]
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send this data to your backend
    console.log("Form submitted:", { ...formData, batch: selectedBatch, time: selectedTime });
    
    // Show success toast
    toast({
      title: "Booking Requested",
      description: "We've received your booking request. We'll contact you shortly to confirm.",
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      age: '',
      experience: 'beginner'
    });
    setSelectedBatch(null);
    setSelectedTime(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Book Your <span className="gradient-text">Training</span>
            </h1>
            <p className="text-xl text-gray-300">
              Select your preferred program, schedule and complete your booking in a few simple steps.
            </p>
          </div>
        </div>
      </section>
      
      {/* Booking Section */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Program Selection */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Select Program</h2>
                
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <div 
                      key={batch.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedBatch === batch.id 
                          ? 'border-baseline-yellow bg-gray-800' 
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => {
                        setSelectedBatch(batch.id);
                        setSelectedTime(null);
                      }}
                    >
                      <h3 className="font-bold text-lg">{batch.title}</h3>
                      <div className="text-baseline-yellow font-medium">{batch.price}</div>
                      <div className="mt-2 flex items-center text-gray-400 text-sm">
                        <Calendar size={16} className="mr-2" />
                        <span>{batch.schedule.length} days per week</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Schedule and Form */}
            <div className="lg:col-span-2">
              {selectedBatch ? (
                <>
                  {/* Time Selection */}
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Clock size={24} className="mr-2 text-baseline-yellow" />
                      Available Times
                    </h2>
                    
                    <div className="space-y-6">
                      {batches.find(b => b.id === selectedBatch)?.schedule.map((day, idx) => (
                        <div key={idx} className="border-b border-gray-700 pb-4 last:border-0">
                          <h3 className="font-semibold mb-3">{day.day}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {day.times.map((time, timeIdx) => (
                              <div 
                                key={timeIdx}
                                className={`p-3 rounded-md cursor-pointer text-center transition-all ${
                                  selectedTime === `${day.day}-${time}` 
                                    ? 'bg-baseline-yellow text-black' 
                                    : 'bg-gray-800 hover:bg-gray-700'
                                }`}
                                onClick={() => setSelectedTime(`${day.day}-${time}`)}
                              >
                                {time}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Booking Form */}
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Users size={24} className="mr-2 text-baseline-yellow" />
                      Complete Your Booking
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-300 mb-2">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-baseline-yellow focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Email</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-baseline-yellow focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-baseline-yellow focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Age</label>
                          <input
                            type="number"
                            name="age"
                            required
                            value={formData.age}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-baseline-yellow focus:outline-none"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-gray-300 mb-2">Basketball Experience</label>
                          <select
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-baseline-yellow focus:outline-none"
                          >
                            <option value="beginner">Beginner (0-1 years)</option>
                            <option value="intermediate">Intermediate (1-3 years)</option>
                            <option value="advanced">Advanced (3-5 years)</option>
                            <option value="expert">Expert (5+ years)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-6">
                        <h3 className="font-semibold mb-3">Your Selection</h3>
                        <div className="bg-gray-800 p-4 rounded-md mb-6">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-300">Program:</span>
                            <span className="font-medium">{batches.find(b => b.id === selectedBatch)?.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Schedule:</span>
                            <span className="font-medium">
                              {selectedTime ? selectedTime.split('-')[0] + ' at ' + selectedTime.split('-')[1] : 'Not selected'}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          type="submit"
                          className="w-full bg-baseline-yellow hover:bg-opacity-90 text-black font-semibold py-3 rounded-md"
                          disabled={!selectedTime}
                        >
                          Complete Booking
                        </Button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
                  <div className="mb-6">
                    <Calendar size={64} className="mx-auto text-baseline-yellow" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Select a Program</h3>
                  <p className="text-gray-300 mb-6">
                    Please select a training program from the options on the left to view available schedules and complete your booking.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Schedule;
