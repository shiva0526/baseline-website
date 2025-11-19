import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileSpreadsheet, Award, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Types based on our database schema
interface PlayerData {
  id: string;
  age: number;
  joined_date: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
  batches: {
    name: string;
    start_time: string;
    end_time: string;
    days: string[];
  } | null;
}

interface AttendanceRecord {
  date: string;
  is_present: boolean;
}

interface PaymentRecord {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_date: string | null;
  payment_method: string | null;
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPlayerData();
  }, []);

  const fetchPlayerData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch player data with profile and batch info
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select(`
          *,
          profiles!players_user_id_fkey (
            full_name,
            email,
            phone
          ),
          batches (
            name,
            start_time,
            end_time,
            days
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (playerError) {
        // If no player found, show mock data
        console.log('No player data found, using mock data');
        setPlayerData({
          id: 'mock-id',
          age: 16,
          joined_date: '2025-01-15',
          profiles: {
            full_name: 'Alex Johnson',
            email: user.email || 'player@example.com',
            phone: '+1 (555) 123-4567'
          },
          batches: {
            name: '5-Day Elite Program',
            start_time: '16:00',
            end_time: '18:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          }
        });
      } else {
        setPlayerData(player);
      }

      // Fetch attendance data
      if (player?.id) {
        const { data: attendance } = await supabase
          .from('attendance')
          .select('date, is_present')
          .eq('player_id', player.id)
          .order('date', { ascending: false })
          .limit(10);

        setAttendanceData(attendance || []);
      }

      // Fetch payment history
      if (player?.id) {
        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .eq('player_id', player.id)
          .order('due_date', { ascending: false })
          .limit(5);

        setPaymentHistory(payments || []);
      }

      // If no real data, use mock data
      if (!player?.id) {
        setAttendanceData([
          { date: '2025-05-22', is_present: true },
          { date: '2025-05-20', is_present: true },
          { date: '2025-05-19', is_present: false },
          { date: '2025-05-17', is_present: true },
          { date: '2025-05-15', is_present: true },
        ]);

        setPaymentHistory([
          { 
            id: '1', 
            amount: 250.00, 
            status: 'paid', 
            due_date: '2025-05-01', 
            paid_date: '2025-05-01',
            payment_method: 'Credit Card'
          },
          { 
            id: '2', 
            amount: 250.00, 
            status: 'paid', 
            due_date: '2025-04-01', 
            paid_date: '2025-04-01',
            payment_method: 'Credit Card'
          },
          { 
            id: '3', 
            amount: 250.00, 
            status: 'paid', 
            due_date: '2025-03-01', 
            paid_date: '2025-03-01',
            payment_method: 'Credit Card'
          }
        ]);
      }

    } catch (error) {
      console.error('Error fetching player data:', error);
      toast({
        title: 'Error loading data',
        description: 'There was a problem loading your dashboard data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateAttendanceRate = () => {
    if (attendanceData.length === 0) return '85%';
    const presentDays = attendanceData.filter(record => record.is_present).length;
    return `${Math.round((presentDays / attendanceData.length) * 100)}%`;
  };

  const getNextClassInfo = () => {
    if (!playerData?.batches) return 'Monday, May 26, 2025 at 4:00 PM';
    
    const { start_time, days } = playerData.batches;
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Find next class day
    for (let i = 1; i <= 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      const dayName = dayNames[nextDay.getDay()];
      
      if (days.includes(dayName)) {
        return `${formatDate(nextDay.toISOString())} at ${formatTime(start_time)}`;
      }
    }
    
    return 'No upcoming classes scheduled';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-baseline-yellow"></div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Player Profile Not Found</h1>
          <p className="text-gray-400 mb-4">Please contact the academy to set up your player profile.</p>
          <Button onClick={handleLogout}>Back to Login</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Dashboard Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/images/Logo-Baseline-copy.png" alt="BaseLine Academy" className="h-12 mr-4" />
              <h1 className="text-xl font-bold">Parent Dashboard</h1>
            </div>
            
            <div className="flex space-x-4">
              <Button variant="ghost" onClick={handleLogout} className="text-gray-300">
                <LogOut size={18} className="mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full mb-8">
            <TabsTrigger value="overview">
              <UserCircle className="mr-2 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Calendar className="mr-2 h-4 w-4" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="tournaments">
              <Award className="mr-2 h-4 w-4" /> Tournaments
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Player Profile */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 col-span-2">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold">Player Profile</h2>
                </div>
                
                <div className="flex flex-col md:flex-row">
                  <div className="bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                    <UserCircle size={64} className="text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">{playerData.profiles.full_name}</h3>
                      <p className="text-gray-400">Age: {playerData.age}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Program</p>
                        <p>{playerData.batches?.name || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{playerData.profiles.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p>{formatDate(playerData.joined_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Attendance Rate</p>
                        <p>{calculateAttendanceRate()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Class */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-6">Next Class</h2>
                
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <Calendar size={48} className="text-baseline-yellow mb-4" />
                  <p className="text-lg font-medium mb-1">{getNextClassInfo()}</p>
                </div>
              </div>
            </div>
            
            {/* Payment History */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Payment History</h2>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet size={16} className="mr-2" /> View All
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4 bg-gray-800 rounded-tl-lg">Date</th>
                      <th className="text-left py-2 px-4 bg-gray-800">Description</th>
                      <th className="text-right py-2 px-4 bg-gray-800">Amount</th>
                      <th className="text-center py-2 px-4 bg-gray-800 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-t border-gray-800">
                        <td className="py-3 px-4">{formatDate(payment.due_date)}</td>
                        <td className="py-3 px-4">Monthly Program Fee</td>
                        <td className="py-3 px-4 text-right">${payment.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block w-full text-center px-2 py-0.5 rounded-full text-xs ${
                            payment.status === 'paid' 
                              ? 'bg-green-900 text-green-300' 
                              : payment.status === 'pending'
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-8">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-6">Attendance History</h2>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400">Total Classes Attended</p>
                  <p className="text-3xl font-bold">{attendanceData.filter(r => r.is_present).length}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Attendance Rate</p>
                  <p className="text-3xl font-bold text-baseline-yellow">{calculateAttendanceRate()}</p>
                </div>
                
                <div>
                  <Button variant="outline" size="sm">
                    View Full Calendar
                  </Button>
                </div>
              </div>
              
              <h3 className="font-medium mb-4">Recent Classes</h3>
              <div className="space-y-2">
                {attendanceData.slice(0, 5).map((record, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <p>{formatDate(record.date)}</p>
                    <span 
                      className={`px-3 py-1 rounded-full text-xs ${
                        record.is_present 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}
                    >
                      {record.is_present ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium mb-4">Monthly Attendance</h3>
                <div className="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-gray-400">Attendance chart would be displayed here</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-8">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-6">Upcoming Tournaments</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">BaseLine Summer Championship</h3>
                  <p className="text-gray-400 mb-4">June 15, 2025</p>
                  
                  <div className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-2 rounded text-center">
                    Registered
                  </div>
                </div>
                
                <div className="border border-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Skills Workshop</h3>
                  <p className="text-gray-400 mb-4">July 10, 2025</p>
                  
                  <Button className="button-primary w-full">
                    Register
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-6">Past Tournament Results</h2>
              
              <div className="border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Winter Elite Showdown</h3>
                <p className="text-gray-400 mb-4">December 10, 2024</p>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Player Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Points</p>
                      <p className="text-lg font-medium">24</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rebounds</p>
                      <p className="text-lg font-medium">8</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Assists</p>
                      <p className="text-lg font-medium">5</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Steals</p>
                      <p className="text-lg font-medium">3</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    <FileSpreadsheet size={16} className="mr-2" /> View Full Results
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;
