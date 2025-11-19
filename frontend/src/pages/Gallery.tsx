
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Enhanced carousel tracking
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const intervalRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (!carouselApi) return;
    
    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on('select', onSelect);
    onSelect();
    
    return () => {
      carouselApi?.off('select', onSelect);
    };
  }, [carouselApi]);

  // Custom autoplay implementation
  useEffect(() => {
    if (!carouselApi || !isPlaying) return;

    const startAutoplay = () => {
      intervalRef.current = setInterval(() => {
        carouselApi.scrollNext();
      }, 3000);
    };

    startAutoplay();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [carouselApi, isPlaying]);

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const images = [
    {
      src: "/images/photos/tour1/WhatsApp Image 2025-08-17 at 5.40.12 PM (1).jpeg",
      alt: "Training session",
      category: "training"
    },
    {
      src: "/images/photos/tour2/WhatsApp Image 2025-08-17 at 6.07.02 PM.jpeg",
      alt: "Group drills",
      category: "training"
    },
    {
      src: "/images/photos/tour3/WhatsApp Image 2025-08-17 at 5.58.39 PM.jpeg",
      alt: "One-on-one coaching",
      category: "coaching"
    },
    {
      src: "/images/photos/tour4/WhatsApp Image 2025-08-17 at 5.54.21 PM.jpeg",
      alt: "Shooting practice",
      category: "training"
    },
    {
      src: "/images/photos/tour5/WhatsApp Image 2025-08-17 at 5.48.06 PM (1).jpeg",
      alt: "Team huddle",
      category: "team"
    },
    {
      src: "/images/photos/tour4/WhatsApp Image 2025-08-17 at 5.54.20 PM (1).jpeg",
      alt: "Skills competition",
      category: "events"
    },
    {
      src: "/images/photos/tour4/WhatsApp Image 2025-08-17 at 5.54.17 PM (2).jpeg",
      alt: "Player development",
      category: "coaching"
    },
    {
      src: "/images/photos/tour4/WhatsApp Image 2025-08-17 at 5.54.15 PM.jpeg",
      alt: "Academy tournament",
      category: "events"
    },
    {
      src: "/images/photos/tour5/WhatsApp Image 2025-08-17 at 5.48.06 PM.jpeg",
      alt: "Strength training",
      category: "training"
    }
  ];

  const videos = [
    {
      src: "https://www.youtube.com/embed/VIDEO_ID_1",
      title: "Shooting Form Breakdown",
      thumbnail: "/images/video-thumb1.jpg"
    },
    {
      src: "https://www.youtube.com/embed/VIDEO_ID_2",
      title: "Dribbling Masterclass",
      thumbnail: "/images/video-thumb2.jpg"
    },
    {
      src: "https://www.youtube.com/embed/VIDEO_ID_3",
      title: "Basketball IQ Training",
      thumbnail: "/images/video-thumb3.jpg"
    }
  ];

  const [filter, setFilter] = useState('all');
  
  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.category === filter);
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Media <span className="gradient-text">Gallery</span>
            </h1>
            <p className="text-xl text-gray-300">
              Explore photos and videos from our training sessions, events, and player successes.
            </p>
          </div>
        </div>
      </section>
      
      {/* Photo Gallery */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold mb-8">
            Photo <span className="gradient-text">Gallery</span>
          </h2>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full transition-all ${
                filter === 'all' ? 'bg-baseline-yellow text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('training')}
              className={`px-4 py-2 rounded-full transition-all ${
                filter === 'training' ? 'bg-baseline-yellow text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Training
            </button>
            <button 
              onClick={() => setFilter('coaching')}
              className={`px-4 py-2 rounded-full transition-all ${
                filter === 'coaching' ? 'bg-baseline-yellow text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Coaching
            </button>
            <button 
              onClick={() => setFilter('team')}
              className={`px-4 py-2 rounded-full transition-all ${
                filter === 'team' ? 'bg-baseline-yellow text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Team
            </button>
            <button 
              onClick={() => setFilter('events')}
              className={`px-4 py-2 rounded-full transition-all ${
                filter === 'events' ? 'bg-baseline-yellow text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Events
            </button>
          </div>
          
          {/* Enhanced Dynamic Carousel Gallery */}
          <div className="relative max-w-7xl mx-auto">
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: "center",
                loop: true,
                dragFree: true,
              }}
              className="w-full"
              onMouseEnter={() => {
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                }
              }}
              onMouseLeave={() => {
                if (carouselApi && isPlaying) {
                  intervalRef.current = setInterval(() => {
                    carouselApi.scrollNext();
                  }, 3000);
                }
              }}
            >
              <CarouselContent className="ml-0">
                {filteredImages.map((image, index) => (
                  <CarouselItem key={index} className="pl-4 basis-3/4 md:basis-1/2">
                    <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                      {/* Ken Burns Effect Container */}
                      <div className="relative overflow-hidden h-96 md:h-[500px]">
                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        {/* Dynamic Ken Burns Image */}
                        <div 
                          className="cursor-pointer w-full h-full overflow-hidden"
                          onClick={() => setSelectedImage(image.src)}
                        >
                          <img 
                            src={image.src} 
                            alt={image.alt} 
                            className={`w-full h-full object-cover transition-all [transition-duration:8000ms] ease-in-out transform
                              ${currentSlide === index ? 'scale-110 animate-ken-burns' : 'scale-100'}
                              group-hover:scale-110 group-hover:brightness-110
                            `}
                          />
                        </div>
                        
                        {/* Floating Caption */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="text-white font-bold text-xl md:text-2xl mb-4 drop-shadow-lg">
                              {image.alt}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className="inline-block px-4 py-2 bg-baseline-yellow/90 backdrop-blur-sm text-black text-sm rounded-full font-semibold capitalize shadow-lg">
                                {image.category}
                              </span>
                              <div className="w-2 h-2 rounded-full bg-white/60"></div>
                              <span className="text-white/80 text-sm font-medium">
                                Baseline Elite Academy
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Play Indicator */}
                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-5 h-5 text-baseline-yellow ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Enhanced Navigation Buttons */}
              <CarouselPrevious className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/30 backdrop-blur-md border-2 border-baseline-yellow/50 text-baseline-yellow hover:bg-baseline-yellow hover:text-black hover:border-baseline-yellow transition-all duration-300 shadow-xl" />
              <CarouselNext className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/30 backdrop-blur-md border-2 border-baseline-yellow/50 text-baseline-yellow hover:bg-baseline-yellow hover:text-black hover:border-baseline-yellow transition-all duration-300 shadow-xl" />
            </Carousel>
            
            {/* Dynamic Progress Indicator */}
            <div className="flex justify-center items-center mt-12 space-x-4">
              <button
                onClick={toggleAutoplay}
                className="w-10 h-10 rounded-full bg-baseline-yellow/20 border-2 border-baseline-yellow/50 text-baseline-yellow hover:bg-baseline-yellow hover:text-black transition-all duration-300 flex items-center justify-center"
              >
                {isPlaying ? (
                  <div className="w-2 h-2 bg-current"></div>
                ) : (
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                )}
              </button>
              
              <div className="flex items-center space-x-2">
                {filteredImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => carouselApi?.scrollTo(index)}
                    className="relative group transition-all duration-300"
                  >
                    <div className={`rounded-full transition-all duration-300 ${
                      currentSlide === index 
                        ? 'w-10 h-3 bg-baseline-yellow shadow-lg' 
                        : 'w-3 h-3 bg-white/30 group-hover:bg-baseline-yellow/60'
                    }`}>
                      {currentSlide === index && (
                        <div className="absolute inset-0 bg-baseline-yellow/50 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="text-sm text-gray-400 font-medium min-w-[3rem] text-center">
                {currentSlide + 1} / {filteredImages.length}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Video Section */}
      <section className="section-padding bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold mb-8">
            Video <span className="gradient-text">Highlights</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {videos.map((video, index) => (
              <div key={index} className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800/50 hover:border-baseline-yellow/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-baseline-yellow/10">
                <div className="aspect-video relative group cursor-pointer">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-baseline-yellow/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Play className="ml-1 w-6 h-6 text-black" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{video.title}</h3>
                  <p className="text-sm text-gray-400">Training Video</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Enhanced Immersive Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 z-50 w-12 h-12 bg-black/50 backdrop-blur-md border border-baseline-yellow/50 text-baseline-yellow hover:bg-baseline-yellow hover:text-black rounded-full flex items-center justify-center transition-all duration-300 shadow-xl"
              onClick={() => setSelectedImage(null)}
            >
              <X size={20} />
            </button>
            
            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = images.findIndex(img => img.src === selectedImage);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                setSelectedImage(images[prevIndex].src);
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-black/50 backdrop-blur-md border border-baseline-yellow/50 text-baseline-yellow hover:bg-baseline-yellow hover:text-black rounded-full flex items-center justify-center transition-all duration-300 shadow-xl"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = images.findIndex(img => img.src === selectedImage);
                const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                setSelectedImage(images[nextIndex].src);
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-black/50 backdrop-blur-md border border-baseline-yellow/50 text-baseline-yellow hover:bg-baseline-yellow hover:text-black rounded-full flex items-center justify-center transition-all duration-300 shadow-xl"
            >
              <ChevronRight size={20} />
            </button>
            
            {/* Enhanced Image Container */}
            <div 
              className="relative max-w-6xl max-h-[85vh] w-full group cursor-zoom-in"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Enlarged view" 
                className="w-full h-full object-contain animate-scale-in group-hover:scale-105 transition-transform duration-700 ease-out shadow-2xl"
              />
              
              {/* Image Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                {(() => {
                  const imageData = images.find(img => img.src === selectedImage);
                  return imageData ? (
                    <div className="text-center">
                      <h3 className="text-white font-bold text-xl mb-2">{imageData.alt}</h3>
                      <span className="inline-block px-4 py-2 bg-baseline-yellow text-black text-sm rounded-full font-medium capitalize">
                        {imageData.category}
                      </span>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
            
            {/* Loading Animation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 border-4 border-baseline-yellow/20 border-t-baseline-yellow rounded-full animate-spin opacity-0"></div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Gallery;