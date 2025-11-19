
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserCog, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

type Role = 'coach' | null;
type LoginStage = 'select-role' | 'login-form';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [stage, setStage] = useState<LoginStage>('select-role');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStage('login-form');
  };

  const handleBackToRoles = () => {
    setStage('select-role');
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  const { loginUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (!selectedRole) {
        throw new Error('Please select a role');
      }

      await loginUser(email, password);
      
      toast({
        title: "Login successful!",
        description: "Welcome back, Coach!",
      });

      // Navigate to coach dashboard
      navigate('/coach-dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(247,208,70,0.1)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(247,208,70,0.05)_0%,transparent_50%)] pointer-events-none" />
      
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-16 px-4 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          {/* Main Card with Glassmorphism */}
          <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-500">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-baseline-yellow/20 via-transparent to-gray-900/30 pointer-events-none" />
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-baseline-yellow/20 to-orange-500/20 p-8 border-b border-white/10">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-baseline-yellow to-yellow-300 bg-clip-text text-transparent">
                  Welcome to BaseLine Academy
                </h2>
                <p className="text-gray-300 text-sm">Elite Basketball Training Platform</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative p-8">
              {stage === 'select-role' ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">Choose Your Role</h3>
                    <p className="text-gray-400 text-sm">Select how you'd like to access the platform</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleRoleSelect('coach')}
                      className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:border-baseline-yellow/50 hover:bg-gradient-to-br hover:from-baseline-yellow/10 hover:to-orange-500/10 hover:scale-105 hover:shadow-lg hover:shadow-baseline-yellow/20 max-w-xs"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-baseline-yellow/0 to-baseline-yellow/0 group-hover:from-baseline-yellow/5 group-hover:to-orange-500/5 rounded-xl transition-all duration-300" />
                      <UserCog size={48} className="text-baseline-yellow mb-4 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-lg font-semibold text-white group-hover:text-baseline-yellow transition-colors duration-300">Coach Portal</span>
                      <span className="text-sm text-gray-400 mt-2 group-hover:text-gray-300 transition-colors duration-300">Manage teams & training</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={handleBackToRoles}
                    className="flex items-center text-gray-400 hover:text-baseline-yellow transition-colors duration-300 group"
                  >
                    <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform duration-300" /> 
                    Back to role selection
                  </button>
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">🏀 Coach Login</h3>
                    <p className="text-gray-400 text-sm">Access your coaching dashboard and team management tools</p>
                  </div>
                  
                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-4 py-3 rounded-lg animate-fade-in">
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-baseline-yellow focus:ring-2 focus:ring-baseline-yellow/20 focus:outline-none transition-all duration-300"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-baseline-yellow focus:ring-2 focus:ring-baseline-yellow/20 focus:outline-none transition-all duration-300"
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-baseline-yellow transition-colors duration-200"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-baseline-yellow to-yellow-400 hover:from-yellow-400 hover:to-baseline-yellow text-black font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-baseline-yellow/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        'Sign In to Coach Portal'
                      )}
                    </Button>
                    
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="text-center text-sm text-gray-400">
                        <p className="font-medium text-baseline-yellow mb-1">Demo Credentials:</p>
                        <p className="font-mono text-xs">coach@baseline.com / coach123</p>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;