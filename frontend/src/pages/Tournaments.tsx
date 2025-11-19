import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Users, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TournamentRegistrationForm from '@/components/tournaments/TournamentRegistrationForm';
import { getTournaments, Tournament } from "@/api/tournaments";

const Tournaments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoading(true);
      try {
        const allTournaments: Tournament[] = (await getTournaments()).map((t: any) => ({
        id: t.id,
        title: t.title,
        date: t.date,
        location: t.location,
        description: t.description,
        matchType: t.match_type,
        ageGroups: t.age_groups,
        registrationOpen: t.registration_open,
        registrationClose: t.registration_close,
        status: t.status,
        createdAt: t.created_at,
      }));


        const today = new Date();

        // Filter upcoming tournaments
        const upcoming = allTournaments.filter((t) => {
          const tournamentDate = new Date(t.date);
          return tournamentDate >= today && t.status !== "cancelled";
        });

        // ✅ Fixed: use camelCase
        const past = allTournaments
          .filter(
            (t) =>
              new Date(t.registrationClose) < today ||
              t.status === "cancelled"
          )
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 2); // ✅ Only keep last 2

        setUpcomingTournaments(upcoming);
        setPastTournaments(past);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
        toast({
          title: "Error loading tournaments",
          description: "There was a problem loading tournaments.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, [toast]);

  const handleRegister = (tournament: Tournament) => {
    const today = new Date();
    const closeDate = new Date(tournament.registrationClose);
    const openDate = new Date(tournament.registrationOpen);

    if (today < openDate) {
      toast({
        title: "Registration not open",
        description: "Registration for this tournament has not started yet.",
        variant: "destructive"
      });
      return;
    }

    if (today > closeDate) {
      toast({
        title: "Registration closed",
        description: "The registration period for this tournament has ended.",
        variant: "destructive"
      });
      return;
    }

    if (tournament.status === 'cancelled') {
      toast({
        title: "Tournament cancelled",
        description: "This tournament has been cancelled.",
        variant: "destructive"
      });
      return;
    }

    setSelectedTournament(tournament);
    setShowRegistrationForm(true);
  };

  const handleRegistrationComplete = () => {
    setShowRegistrationForm(false);
    toast({
      title: "Registration successful!",
      description: "Your team has been registered for the tournament.",
    });
  };

  const handleRegistrationCancel = () => {
    setShowRegistrationForm(false);
    setSelectedTournament(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">BaseLine Elite Tournaments</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join our competitive basketball tournaments and showcase your skills. Our tournaments are designed to provide a professional competitive environment for players of all levels.
            </p>
          </div>
          
          {/* Upcoming Tournaments */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 gradient-text text-center">Upcoming Tournaments</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-baseline-yellow"></div>
              </div>
            ) : upcomingTournaments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {upcomingTournaments.map(tournament => (
                  <div key={tournament.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-xl">
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2">{tournament.title}</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-baseline-yellow text-black">
                          {tournament.matchType}
                        </span>
                        
                        {tournament.ageGroups.map(age => (
                          <span key={age} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
                            {age}
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-gray-300 mb-6">{tournament.description}</p>
                      
                      <div className="grid grid-cols-1 gap-3 mb-6">
                        <div className="flex items-center">
                          <CalendarDays className="h-5 w-5 text-baseline-yellow mr-2" />
                          <span>{formatDate(tournament.date)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-baseline-yellow mr-2" />
                          <span>{tournament.location}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-baseline-yellow mr-2" />
                          <span>{tournament.matchType} Format</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-baseline-yellow mr-2" />
                          <span>Registration closes: {formatDate(tournament.registrationClose)}</span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Button 
                          onClick={() => handleRegister(tournament)} 
                          className="button-primary w-full py-3"
                        >
                          Register for Tournament
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 p-8 text-center">
                <h3 className="text-xl font-medium text-gray-400">No upcoming tournaments at this time</h3>
                <p className="mt-2 text-gray-500">Check back soon for new tournament announcements!</p>
              </div>
            )}
          </section>
          
          {/* Past Tournaments */}
          <section>
            <h2 className="text-2xl font-bold mb-6 gradient-text text-center">Past Tournaments</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-baseline-yellow"></div>
              </div>
            ) : pastTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastTournaments.map(tournament => (
                  <div 
                    key={tournament.id}
                    className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 p-6"
                  >
                    <h3 className="text-xl font-bold mb-2">{tournament.title}</h3>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
                        {tournament.matchType}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
                        {formatDate(tournament.date)}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{tournament.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{tournament.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 p-8 text-center">
                <h3 className="text-xl font-medium text-gray-400">No past tournaments</h3>
                <p className="mt-2 text-gray-500">Check back after our upcoming events!</p>
              </div>
            )}
          </section>
        </div>
      </div>
      
      {/* Registration Modal */}
      {showRegistrationForm && selectedTournament && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <TournamentRegistrationForm
            tournament={selectedTournament!}
            onComplete={handleRegistrationComplete}
            onCancel={handleRegistrationCancel}
          />


        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Tournaments;
