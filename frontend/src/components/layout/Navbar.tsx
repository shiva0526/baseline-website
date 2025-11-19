import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Tournaments', path: '/tournaments' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleJoinClick = () => {
    navigate('/programs');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    if (userRole === 'coach') {
      navigate('/coach-dashboard');
    } else if (userRole === 'parent') {
      navigate('/parent-dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setUserRole(null);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/', { replace: true });
  };

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="/images/Logo.png"
            alt="BaseLine Academy" 
            className="h-12 md:h-16"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path}
              className={`text-white hover:text-baseline-yellow font-medium transition-colors duration-300 ${
                location.pathname === link.path ? 'text-baseline-yellow' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center space-x-4">
            {userRole ? (
              <div className="flex items-center space-x-4">
                <Button className="button-outline" onClick={handleDashboardClick}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="text-gray-300">
                  <LogOut size={18} className="mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <Button className="button-outline" onClick={handleLoginClick}>
                Login
              </Button>
            )}
            <Button className="button-primary" onClick={handleJoinClick}>
              Join Now
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white hover:text-baseline-yellow"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="fixed inset-0 top-[72px] bg-black z-40 flex flex-col md:hidden animate-fade-in">
          <div className="container mx-auto py-8 px-4 flex flex-col space-y-6">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-white hover:text-baseline-yellow text-2xl font-semibold transition-all duration-300 ${
                  isOpen ? 'animate-slide-in' : ''
                } ${location.pathname === link.path ? 'text-baseline-yellow' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col space-y-4 mt-8">
              {userRole ? (
                <>
                  <Button 
                    className="button-outline w-full" 
                    onClick={() => {
                      setIsOpen(false);
                      handleDashboardClick();
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-gray-300"
                  >
                    <LogOut size={18} className="mr-2" /> Logout
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button className="button-outline w-full">Login</Button>
                </Link>
              )}
              <Button 
                className="button-primary w-full"
                onClick={() => {
                  setIsOpen(false);
                  handleJoinClick();
                }}
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
