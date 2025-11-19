
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import WhyUsSection from '@/components/home/WhyUsSection';
import PricingSection from '@/components/home/PricingSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import VideoSection from '@/components/home/VideoSection';
import ParticleBackground from '@/components/effects/ParticleBackground';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { X } from 'lucide-react';

const Index = () => {

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <ParticleBackground />
      <Navbar />
      
      
      <HeroSection />
      <WhyUsSection />
      <PricingSection />
      <TestimonialsSection />
      <VideoSection />
      <Footer />
    </div>
  );
};

export default Index;
