import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Award, User, FileSpreadsheet, Bell, LogOut, Plus, Download, Trash2, X, Check, Menu, Clock, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import PlayerProfile from '@/components/coach/PlayerProfile';
import { getPlayers } from "@/api/players";
import { addPlayer } from "@/api/players";
import { removePlayer } from "@/api/players";
import { getAttendance, updateAttendance } from "@/api/attendance";
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from "@/api/announcements";
// add near the other api imports
import { getTournaments as apiGetTournaments, createTournament as apiCreateTournament, deleteTournament as apiDeleteTournament, Tournament as APITournament } from "@/api/tournaments";
import { getRegistrations as apiGetRegistrations, Registration as APIRegistration } from "@/api/registrations";




// Tournament interface
interface Tournament {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  matchType: string;
  ageGroups: string[];
  registrationOpen: string;
  registrationClose: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
}


// Days of the week for attendance
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
type Program = '3-Day' | '5-Day';
interface Player {
  id: number;
  name: string;
  program: Program;
  attendedClasses: number;
  phone: string;
  avatar: string | null;
}
interface Announcement {
  id: number;
  text: string;
  duration: '24hours' | '48hours' | 'manual';
  createdAt: number;
  expiresAt?: number;
}
const CoachDashboard = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    program: '3-Day' as Program
  });
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementDuration, setAnnouncementDuration] = useState<'24hours' | '48hours' | 'manual'>('24hours');
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [tournamentToCancel, setTournamentToCancel] = useState<number | null>(null);



  const inFlightRegistrationsRef = useRef<Record<number, Promise<APIRegistration[]> | undefined>>({});

  // registrations cached per tournament id
const [registrationsByTournament, setRegistrationsByTournament] = useState<Record<number, APIRegistration[]>>({});
// optional loading flags per tournament
const [registrationsLoading, setRegistrationsLoading] = useState<Record<number, boolean>>({});
// normalize API tournament (snake_case -> camelCase) to match your UI shape
const normalizeTournament = (t: any) => ({
  id: t.id,
  title: t.title,
  date: t.date,
  location: t.location,
  description: t.description ?? "",
  matchType: t.match_type ?? (t as any).matchType ?? "3v3",
  ageGroups: t.age_groups ?? [],
  registrationOpen: t.registration_open ?? (t as any).registrationOpen ?? "",
  registrationClose: t.registration_close ?? (t as any).registrationClose ?? "",
  status: t.status ?? "upcoming"
});

// Fetch registrations for a tournament (cached)
const fetchRegistrationsForTournament = async (tournamentId: number) => {
  // return cache if present
  if (registrationsByTournament[tournamentId]) {
    return registrationsByTournament[tournamentId];
  }

  // dedupe: return the in-flight promise if one exists
  const inFlight = inFlightRegistrationsRef.current[tournamentId];
  if (inFlight) {
    return inFlight;
  }

  // create the fetch promise and store it
  const promise = (async () => {
    setRegistrationsLoading(prev => ({ ...prev, [tournamentId]: true }));
    try {
      const regs = await apiGetRegistrations(tournamentId);
      setRegistrationsByTournament(prev => ({ ...prev, [tournamentId]: regs }));
      return regs;
    } catch (err) {
      console.error("Failed to load registrations for", tournamentId, err);
      setRegistrationsByTournament(prev => ({ ...prev, [tournamentId]: [] }));
      return [];
    } finally {
      setRegistrationsLoading(prev => ({ ...prev, [tournamentId]: false }));
      // remove in-flight marker
      delete inFlightRegistrationsRef.current[tournamentId];
    }
  })();

  inFlightRegistrationsRef.current[tournamentId] = promise;
  return promise;
};


// CSV field escaper
const escapeCSV = (value: any) => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  // New attendance state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Tournament Form State
  const [tournamentForm, setTournamentForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    matchType: '3v3',
    ageGroups: [] as string[],
    registrationOpen: '',
    registrationClose: ''
  });

  // Attendance state
  const [attendance, setAttendance] = useState<Record<string, Record<number, boolean>>>({});
  const [unsavedDates, setUnsavedDates] = useState<Record<string, boolean>>({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  //announcement
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);



  useEffect(() => {
    getPlayers()
      .then(setPlayers)
      .catch(err => console.error("Error loading players", err));
  }, []);

  // Load tournaments and announcements on component mount
  // Load tournaments (and registrations) from backend
useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      const tList = await apiGetTournaments(); // returns array in API format
      if (!mounted) return;

      // normalize to UI shape and set
      const normalized = (tList || []).map(normalizeTournament);
      setAllTournaments(normalized);

      // compute past tournaments and keep only last 2
      const today = new Date();
      const past = normalized
        .filter(t => new Date(t.date) < today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setPastTournaments(past.slice(-2));

            // NOTE: do not prefetch registrations for all tournaments here.
      // Registrations will be loaded on demand using fetchRegistrationsForTournament(t.id).

    } catch (err) {
      console.error("Failed to load tournaments", err);
    }
  })();

  return () => { mounted = false; };
}, []);


  // Check for expired announcements periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentAnnouncement && currentAnnouncement.expiresAt) {
        const now = Date.now();
        if (now > currentAnnouncement.expiresAt) {
          setCurrentAnnouncement(null);
          localStorage.removeItem('currentAnnouncement');
          localStorage.removeItem('announcement');
          window.dispatchEvent(new Event('storage'));
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentAnnouncement]);
  // Generate calendar dates for current month (show all days; disable far-future days)
  const getCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    // Format a date as YYYY-MM-DD in local time
    const formatLocalYmd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const todayString = formatLocalYmd(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    const dates = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = formatLocalYmd(date);

      const isFuture = date > today;
      const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      dates.push({
        date: i,
        fullDate: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        // Disable selecting dates more than 3 days in the future, but still show them
        isDisabled: isFuture && daysDiff > 3,
        isToday: dateString === todayString
      });
    }
    return dates;
  };

  const calendarDates = getCalendarDates();

  // Handle attendance toggle
  const handleAttendanceToggle = (playerId: number, checked: boolean) => {
    const selectedDateObj = calendarDates.find((d) => d.fullDate === selectedDate);
    if (selectedDateObj?.isDisabled) return;

    setAttendance((prev) => {
      const prevForDate = prev[selectedDate] || {};
      const nextForDate = { ...prevForDate, [playerId]: checked };
      return { ...prev, [selectedDate]: nextForDate };
    });

    setUnsavedDates((prev) => ({ ...prev, [selectedDate]: true }));
  };


  // Fetch attendance when selectedDate changes
  useEffect(() => {
    let mounted = true;
    setAttendanceLoading(true);

    // Use the selected date directly without timezone adjustment
    getAttendance(selectedDate)
      .then((map) => {
        if (!mounted) return;
        setAttendance((prev) => ({ ...prev, [selectedDate]: map }));
        setUnsavedDates((prev) => ({ ...prev, [selectedDate]: false }));
      })
      .catch((err) => {
        console.error("Failed to fetch attendance", err);
        if (mounted) setAttendance((prev) => ({ ...prev, [selectedDate]: {} }));
      })
      .finally(() => {
        if (mounted) setAttendanceLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedDate]);


  // Update attendance and save to backend
  const handleUpdateAttendance = async () => {
    const attendanceForDate = attendance[selectedDate] || {};

    try {
      // Use the selected date directly without timezone adjustment
      await updateAttendance(selectedDate, attendanceForDate);

      // Re-fetch players from backend
      const updatedPlayers = await getPlayers();
      setPlayers(updatedPlayers);

      // Clear unsaved flag for this date
      setUnsavedDates((prev) => ({ ...prev, [selectedDate]: false }));

      toast({
        title: "Attendance Updated",
        description: `Attendance for ${selectedDate} saved successfully.`,
      });
    } catch (err) {
      console.error("Failed to save attendance", err);
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter players based on search
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.phone.includes(searchQuery)
  );

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };
  const handleAddPlayer = async () => {
    if (!newPlayer.name) return;

    try {
      const savedPlayer = await addPlayer({
        name: newPlayer.name,
        program: newPlayer.program,
      });
      setPlayers([...players, savedPlayer]);
      setNewPlayer({ name: "", program: "3-Day" });

      toast({
        title: "Player added",
        description: `${savedPlayer.name} has been added to the ${savedPlayer.program} program.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add player. Try again.",
        variant: "destructive",
      });
    }
  };
  const handleRemovePlayer = (player: Player) => {
    setPlayerToRemove(player);
    setShowRemoveConfirm(true);
  };
  const confirmRemovePlayer = async () => {
    if (!playerToRemove) return;

    try {
      await removePlayer(playerToRemove.id);
      setPlayers(prev => prev.filter(p => p.id !== playerToRemove.id)); 

      toast({
        title: "Player removed",
        description: `${playerToRemove.name} has been removed from the program.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove player. Try again.",
        variant: "destructive",
      });
    }

    setShowRemoveConfirm(false);
    setPlayerToRemove(null);
  };
  const cancelRemovePlayer = () => {
    setShowRemoveConfirm(false);
    setPlayerToRemove(null);
  };
  const handlePublishAnnouncement = () => {
    if (!announcementText) {
      toast({
        title: "Empty announcement",
        description: "Please enter an announcement before publishing.",
        variant: "destructive"
      });
      return;
    }
    const now = Date.now();
    let expiresAt;
    switch (announcementDuration) {
      case '24hours':
        expiresAt = now + 24 * 60 * 60 * 1000;
        break;
      case '48hours':
        expiresAt = now + 48 * 60 * 60 * 1000;
        break;
      case 'manual':
        expiresAt = undefined;
        break;
    }
    const announcement: Announcement = {
      id: now,
      text: announcementText,
      duration: announcementDuration,
      createdAt: now,
      expiresAt
    };

    // Save announcement
    localStorage.setItem('announcement', announcementText);
    localStorage.setItem('currentAnnouncement', JSON.stringify(announcement));
    setCurrentAnnouncement(announcement);
    toast({
      title: "Announcement published",
      description: `The announcement has been published and will ${announcementDuration === 'manual' ? 'remain until manually canceled' : `expire in ${announcementDuration === '24hours' ? '24' : '48'} hours`}.`
    });
    setAnnouncementText('');
    window.dispatchEvent(new Event('storage'));
  };
  const handleCancelAnnouncement = () => {
    setCurrentAnnouncement(null);
    localStorage.removeItem('currentAnnouncement');
    localStorage.removeItem('announcement');
    window.dispatchEvent(new Event('storage'));
    toast({
      title: "Announcement canceled",
      description: "The announcement has been removed from the homepage."
    });
  };
  const handleCreateTournament = async () => {
  // Validate
  if (!tournamentForm.title || !tournamentForm.date || !tournamentForm.location || 
      !tournamentForm.registrationOpen || !tournamentForm.registrationClose) {
    toast({
      title: "Missing information",
      description: "Please fill in all required tournament details including registration dates.",
      variant: "destructive"
    });
    return;
  }
  if (tournamentForm.ageGroups.length === 0) {
    toast({
      title: "Missing age groups",
      description: "Please select at least one age group.",
      variant: "destructive"
    });
    return;
  }

  // Validate dates
  const tournamentDate = new Date(tournamentForm.date);
  const registrationOpenDate = new Date(tournamentForm.registrationOpen);
  const registrationCloseDate = new Date(tournamentForm.registrationClose);
  const today = new Date();

  if (registrationCloseDate <= registrationOpenDate) {
    toast({
      title: "Invalid dates",
      description: "Registration close date must be after registration open date.",
      variant: "destructive"
    });
    return;
  }

  if (tournamentDate <= today) {
    toast({
      title: "Invalid tournament date",
      description: "Tournament date must be in the future.",
      variant: "destructive"
    });
    return;
  }

  try {
    const created = await apiCreateTournament({
      ...tournamentForm,
      description: tournamentForm.description || ''
    });
    // normalize created tournament (backend returns snake_case)
    const normalized = normalizeTournament(created);
    setAllTournaments(prev => {
      const next = [...prev, normalized];
      // recompute past tournaments from next
      const today = new Date();
      const past = next
        .filter(t => new Date(t.date) < today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setPastTournaments(past.slice(-2));
      return next;
    });

    

    // reset form
    setTournamentForm({
      title: '',
      date: '',
      location: '',
      description: '',
      matchType: '3v3',
      ageGroups: [],
      registrationOpen: '',
      registrationClose: ''
    });

    toast({
      title: "Tournament created",
      description: "The tournament has been published to the website."
    });
  } catch (err) {
    console.error("Failed to create tournament", err);
    toast({ title: "Error", description: "Failed to create tournament.", variant: "destructive" });
  }
};


  


  const handleCancelTournament = (tournamentId: number) => {
    setTournamentToCancel(tournamentId);
    setShowConfirmCancel(true);
  };
  const confirmCancelTournament = async () => {
  if (!tournamentToCancel) return;
  try {
    const updatedTournament = await apiDeleteTournament(tournamentToCancel);
    
    // Update the tournament in the list instead of removing it
    setAllTournaments(prev => 
      prev.map(t => t.id === tournamentToCancel ? {...t, status: 'cancelled'} : t)
    );
    
    toast({
      title: "Tournament cancelled",
      description: "The tournament has been marked as cancelled but registrations are still accessible."
    });
  } catch (err) {
    console.error("Failed to cancel tournament", err);
    toast({ title: "Error", description: "Failed to cancel tournament.", variant: "destructive" });
  } finally {
    setShowConfirmCancel(false);
    setTournamentToCancel(null);
  }
};

  const handleExportRegistrations = async (tournamentId: number) => {
  try {
    const regs: APIRegistration[] = await fetchRegistrationsForTournament(tournamentId);

    if (!regs || regs.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no registrations for this tournament yet.",
        variant: "destructive"
      });
      return;
    }

    console.log('Registrations to export:', regs); // Debug log
    const headers = ['Team Name', 'Captain Name', 'Phone', 'Email', 'Players', 'Registered At'];
    const rows = regs.map(r => {
      if (!r.team_name) {
        console.warn('Missing data for registration:', r);
      }
      const players = r.player_names && Array.isArray(r.player_names) ? r.player_names.join(' | ') : '';
      const row = [
        escapeCSV(r.team_name || ''),
        escapeCSV(r.captain_name || ''),
        escapeCSV(r.phone || ''),
        escapeCSV(r.email || ''),
        escapeCSV(players),
        escapeCSV(new Date(r.created_at).toLocaleString())
      ].join(',');
      console.log('CSV Row:', row); // Debug log
      return row;
    });

    // Add BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows].join('\n');
    console.log('CSV Content:', csvContent); // Debug log

    const tournament = allTournaments.find(t => t.id === tournamentId);
    const tournamentName = tournament ? tournament.title.replace(/[^a-zA-Z0-9]/g, '_') : `tournament_${tournamentId}`;
    const filename = `${tournamentName}_registrations_${new Date().toISOString().slice(0,10)}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8-sig;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `${regs.length} registrations exported for ${tournament?.title}.`
    });
  } catch (err) {
    console.error("Failed to export registrations", err);
    toast({
      title: "Error",
      description: "Failed to export registrations. Please try again.",
      variant: "destructive"
    });
  }
};

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Filter players by program
  const threeDayPlayers = players.filter(p => p.program === '3-Day');
  const fiveDayPlayers = players.filter(p => p.program === '5-Day');
  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const timeLeft = expiresAt - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor(timeLeft % (1000 * 60 * 60) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };
  // Show player profile if selected
  if (selectedPlayer) {
    return (
      <PlayerProfile
        player={selectedPlayer}
        onBack={() => setSelectedPlayer(null)}
      />
    );
  }

  return <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      </AnimatePresence>

      {/* Dashboard Header */}
      <motion.header initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden mr-2 text-gray-300 hover:text-white">
                <Menu size={20} />
              </Button>
              <img src="/images/Logo.png" alt="BaseLine Academy" className="h-12 mr-4" width="100" height="200"/>
              <div>
                <h1 className="text-xl font-bold">Coach Dashboard</h1>
                <p className="text-sm text-gray-400">Manage your academy</p>
              </div>
            </div>
            
            <Button variant="ghost" onClick={handleLogout} className="text-gray-300 hover:text-white">
              <LogOut size={18} className="mr-2" /> Logout
            </Button>
          </div>
        </div>
      </motion.header>
      
      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="attendance" className="w-full">
          {/* Mobile Navigation */}
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} className="lg:hidden mb-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="attendance" className="text-xs">
                <Calendar className="mr-1 h-3 w-3" /> Attendance
              </TabsTrigger>
              <TabsTrigger value="players" className="text-xs">
                <Users className="mr-1 h-3 w-3" /> Players
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-3 w-full mt-2">
              <TabsTrigger value="tournaments" className="text-xs">
                <Award className="mr-1 h-3 w-3" /> Tournaments
              </TabsTrigger>
              <TabsTrigger value="registrations" className="text-xs">
                <FileSpreadsheet className="mr-1 h-3 w-3" /> Registrations
              </TabsTrigger>
              <TabsTrigger value="announcements" className="text-xs">
                <Bell className="mr-1 h-3 w-3" /> Announcements
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="hidden lg:block">
            <TabsList className="grid grid-cols-5 w-full mb-8 bg-gray-900/50 backdrop-blur-sm">
              <TabsTrigger value="attendance" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" /> Attendance
              </TabsTrigger>
              <TabsTrigger value="players" className="flex items-center">
                <Users className="mr-2 h-4 w-4" /> Players
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="flex items-center">
                <Award className="mr-2 h-4 w-4" /> Tournaments
              </TabsTrigger>
              <TabsTrigger value="registrations" className="flex items-center">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Registrations
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center">
                <Bell className="mr-2 h-4 w-4" /> Announcements
              </TabsTrigger>
            </TabsList>
          </motion.div>
          
          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 px-4 sm:px-6 py-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Attendance</h2>
              </div>

              {/* Calendar Navigation */}
              <div className="p-4 sm:p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="text-white hover:bg-gray-800 h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {currentMonth.toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="text-white hover:bg-gray-800 h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                  <div className="p-2 bg-gray-800/30 rounded-lg">
                    <Calendar size={18} className="text-primary sm:w-5 sm:h-5" />
                  </div>
                </div>

                {/* Calendar Dates */}
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-2 min-w-max">
                    {calendarDates.map((dateObj) => (
                      <Button
                        key={dateObj.fullDate}
                        variant={selectedDate === dateObj.fullDate ? "default" : "ghost"}
                        size="sm"
                        onClick={() => !dateObj.isDisabled && setSelectedDate(dateObj.fullDate)}
                        disabled={dateObj.isDisabled}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[50px] transition-all ${
                          dateObj.isDisabled 
                            ? 'text-gray-500 cursor-not-allowed opacity-50 hover:bg-transparent' 
                            : selectedDate === dateObj.fullDate
                            ? 'bg-primary text-white border-primary'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        } ${dateObj.isToday ? 'ring-2 ring-primary/50' : ''}`}
                      >
                        <span className="text-xs font-medium">{dateObj.dayName}</span>
                        <span className="text-lg font-bold">{dateObj.date}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="px-4 sm:px-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search By Name, Phone Number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Players List */}
              <div className="px-4 sm:px-6 pb-6">
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player) => {
                      const selectedDateObj = calendarDates.find(d => d.fullDate === selectedDate);
                      const isDateDisabled = selectedDateObj?.isDisabled || false;
                      
                      return (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 transition-all duration-200 min-h-[60px] ${
                            isDateDisabled ? 'opacity-60' : 'hover:bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {/* Avatar */}
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                {player.avatar ? (
                                  <img 
                                    src={player.avatar} 
                                    alt={player.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={20} className="text-gray-400 sm:w-6 sm:h-6" />
                                )}
                              </div>
                              
                              {/* Player Info */}
                              <div className="flex-1 min-w-0">
                                <h3 
                                  className="font-semibold text-white text-sm sm:text-base truncate cursor-pointer hover:text-baseline-yellow transition-colors"
                                  onClick={() => setSelectedPlayer(player)}
                                >
                                  {player.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-400">
                                  Attendance: {player.attendedClasses}
                                </p>
                              </div>
                            </div>
                            
                            {/* Toggle Switch */}
                            <div className="flex-shrink-0 ml-2">
                              <Switch
                                checked={attendance[selectedDate]?.[player.id] || false}
                                onCheckedChange={(checked) => handleAttendanceToggle(player.id, checked)}
                                disabled={isDateDisabled}
                                className={isDateDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <Users size={32} className="mx-auto mb-4 text-gray-500 sm:w-12 sm:h-12" />
                      <p className="text-gray-400 text-sm sm:text-base">No players found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Update Button */}
              <div className="px-4 sm:px-6 pb-6">
                <Button 
                  onClick={handleUpdateAttendance}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base"
                  disabled={
                    calendarDates.find(d => d.fullDate === selectedDate)?.isDisabled ||
                    attendanceLoading ||
                    !unsavedDates[selectedDate]
                  }
                >
                  Update Attendance
                </Button>
              </div>
            </motion.div>
          </TabsContent>
          
          {/* Players Tab */}
          <TabsContent value="players" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add New Player */}
              <motion.div initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} className="bg-gray-900/40 backdrop-blur-lg rounded-xl border border-gray-800/50 p-6 shadow-2xl">
                <h2 className="text-xl font-bold mb-6 text-baseline-yellow">Add New Player</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Player Name</label>
                    <input type="text" value={newPlayer.name} onChange={e => setNewPlayer({
                    ...newPlayer,
                    name: e.target.value
                  })} className="w-full rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 focus:border-baseline-yellow focus:ring-1 focus:ring-baseline-yellow transition-all" placeholder="Enter player name" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Program Type</label>
                    <select value={newPlayer.program} onChange={e => setNewPlayer({
                    ...newPlayer,
                    program: e.target.value as Program
                  })} className="w-full rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 focus:border-baseline-yellow focus:ring-1 focus:ring-baseline-yellow transition-all">
                      <option value="3-Day">3-Day Program</option>
                      <option value="5-Day">5-Day Program</option>
                    </select>
                  </div>
                  
                  <Button onClick={handleAddPlayer} className="w-full bg-baseline-yellow text-black hover:bg-baseline-yellow/90 transition-all duration-200">
                    <Plus size={18} className="mr-2" /> Add Player
                  </Button>
                </div>
              </motion.div>
              
              {/* Player Management */}
              <motion.div initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} className="bg-gray-900/40 backdrop-blur-lg rounded-xl border border-gray-800/50 p-6 shadow-2xl">
                <h2 className="text-xl font-bold mb-6 text-baseline-yellow">Player Management</h2>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {players.map(player => <motion.div key={player.id} initial={{
                    opacity: 0,
                    y: 20
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} exit={{
                    opacity: 0,
                    x: -100,
                    transition: {
                      duration: 0.2
                    }
                  }} layout className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/50 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 
                              className="font-semibold text-white mb-1 cursor-pointer hover:text-baseline-yellow transition-colors"
                              onClick={() => setSelectedPlayer(player)}
                            >
                              {player.name}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-400">
                              <span className="px-2 py-1 bg-baseline-yellow/20 text-baseline-yellow rounded-full text-xs">
                                {player.program}
                              </span>
                              <span className="flex items-center">
                                <User size={12} className="mr-1" />
                                ID: {player.id}
                              </span>
                              <span className="flex items-center">
                                <CheckCircle size={12} className="mr-1" />
                                {player.attendedClasses} classes
                              </span>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm" onClick={() => handleRemovePlayer(player)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 hover:scale-105">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.div>)}
                  </AnimatePresence>
                  
                  {players.length === 0 && <div className="text-center text-gray-500 py-8">
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No players added yet</p>
                      <p className="text-sm">Add your first player to get started!</p>
                    </div>}
                </div>
              </motion.div>
            </div>
          </TabsContent>
          
          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-8">
            {/* Current Tournaments Status */}
            {allTournaments.filter(t => t.status === 'upcoming').length > 0 && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="bg-gray-900/40 backdrop-blur-lg rounded-xl border border-gray-800/50 p-6 shadow-2xl mb-8">
                <h2 className="text-xl font-bold mb-6 text-baseline-yellow">Active Tournaments ({allTournaments.filter(t => t.status === 'upcoming').length})</h2>
                
                <div className="space-y-4">
                  {allTournaments.filter(t => t.status === 'upcoming').map(tournament => <div key={tournament.id} className="bg-black/30 border border-gray-800/50 rounded-lg p-6">
                      <div className="flex flex-col lg:flex-row justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{tournament.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="bg-gray-800/50 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                              {tournament.date}
                            </span>
                            <span className="bg-gray-800/50 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                              {tournament.matchType}
                            </span>
                            <span className="bg-green-900/30 text-green-200 border border-green-800/50 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                              Active
                            </span>
                          </div>
                          <p className="text-gray-300 mb-4">{tournament.description}</p>
                        </div>
                        
                        <div className="mt-4 lg:mt-0 flex gap-2">
                          <Button variant="destructive" onClick={() => handleCancelTournament(tournament.id)} className="flex items-center bg-red-600 hover:bg-red-700">
                            <Trash2 size={16} className="mr-2" /> Cancel
                          </Button>
                        </div>
                      </div>
                    </div>)}
                </div>
              </motion.div>}
            
            {/* Create New Tournament */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="bg-gray-900/40 backdrop-blur-lg rounded-xl border border-gray-800/50 p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-baseline-yellow">Create New Tournament</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Tournament Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Tournament Title*</label>
                    <input type="text" value={tournamentForm.title} onChange={e => setTournamentForm({
                    ...tournamentForm,
                    title: e.target.value
                  })} className="w-full rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 focus:border-baseline-yellow focus:ring-1 focus:ring-baseline-yellow transition-all" placeholder="Enter tournament title" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Date*</label>
                    <input type="date" value={tournamentForm.date} onChange={e => setTournamentForm({
                    ...tournamentForm,
                    date: e.target.value
                  })} className="w-full rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 focus:border-baseline-yellow focus:ring-1 focus:ring-baseline-yellow transition-all" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Location*</label>
                    <input type="text" value={tournamentForm.location} onChange={e => setTournamentForm({
                    ...tournamentForm,
                    location: e.target.value
                  })} className="w-full rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 focus:border-baseline-yellow focus:ring-1 focus:ring-baseline-yellow transition-all" placeholder="Enter location" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Match Type*</label>
                    <select value={tournamentForm.matchType} onChange={e => setTournamentForm({
                    ...tournamentForm,
                    matchType: e.target.value
                  })} className="w-full rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 focus:border-baseline-yellow focus:ring-1 focus:ring-baseline-yellow transition-all">
                      <option value="3v3">3v3</option>
                      <option value="5v5">5v5</option>
                      <option value="1v1">1v1</option>
                    </select>
                  </div>
                </div>
                
                {/* Additional Tournament Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                    <textarea value={tournamentForm.description} onChange={e => setTournamentForm({
                    ...tournamentForm,
                    description: e.target.value
                  })} className="w-full rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 min-h-[80px] focus:border-baseline-yellow focus:ring-1 focus:ring-baseline-yellow transition-all resize-none" placeholder="Enter tournament description" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Registration Opens*</label>
                      <input type="date" value={tournamentForm.registrationOpen} onChange={e => setTournamentForm({
                      ...tournamentForm,
                      registrationOpen: e.target.value
                    })} className="w-full rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 focus:border-baseline-yellow focus:ring-1 focus:ring-baseline-yellow transition-all" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Registration Closes*</label>
                      <input type="date" value={tournamentForm.registrationClose} onChange={e => setTournamentForm({
                      ...tournamentForm,
                      registrationClose: e.target.value
                    })} className="w-full rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 focus:border-baseline-yellow focus:ring-1 focus:ring-baseline-yellow transition-all" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Age Groups & Required Fields */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Age Groups*</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['U15', 'U16', 'U17', 'U18', 'U19'].map(age => <label key={age} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={tournamentForm.ageGroups.includes(age)} onChange={e => {
                      if (e.target.checked) {
                        setTournamentForm({
                          ...tournamentForm,
                          ageGroups: [...tournamentForm.ageGroups, age]
                        });
                      } else {
                        setTournamentForm({
                          ...tournamentForm,
                          ageGroups: tournamentForm.ageGroups.filter(a => a !== age)
                        });
                      }
                    }} className="rounded accent-baseline-yellow" />
                        <span className="text-sm">{age}</span>
                      </label>)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Required Information</label>
                  <p className="text-sm text-gray-400">
                    Registration will collect: Team Name, Captain Full Name, Captain Phone, Captain Email and player first names (the number of player name fields is determined by Match Type).
                  </p>
                </div>

              </div>
              
              <div className="mt-8">
                <Button onClick={handleCreateTournament} className="bg-baseline-yellow text-black hover:bg-baseline-yellow/90 transition-all duration-200">
                  <Award size={18} className="mr-2" /> Create Tournament
                </Button>
              </div>
            </motion.div>
          </TabsContent>
          
          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-8">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="bg-gray-900/40 backdrop-blur-lg rounded-xl border border-gray-800/50 p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-baseline-yellow">Tournament Registrations</h2>
              
              {/* Registrations for all tournaments */}
              {allTournaments.length > 0 && <div className="space-y-6">
                  {allTournaments.map(tournament => {
                const tournamentRegistrations = registrationsByTournament[tournament.id] || [];

                return <div key={tournament.id} className="mb-8 p-6 border border-gray-700/50 rounded-lg bg-gray-800/20 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                          <h3 className="text-lg font-semibold mb-2 sm:mb-0">{tournament.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs backdrop-blur-sm ${tournament.status === 'cancelled' ? 'bg-red-900/50 text-red-300 border border-red-800/50' : 'bg-green-900/50 text-green-300 border border-green-800/50'}`}>
                            {tournament.status === 'cancelled' ? 'Cancelled' : 'Registration Open'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-4">Registration closes: {tournament.registrationClose}</p>
                  
                        <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm border border-gray-700/50">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                            <div>
                              <h4 className="font-medium">Current Registrations</h4>
                              <p className="text-sm text-gray-400">{tournamentRegistrations.length} teams registered</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchRegistrationsForTournament(tournament.id)}
                          disabled={registrationsLoading[tournament.id] ?? false}
                        >
                          Refresh
                        </Button>

                        <Button
                          className="flex items-center bg-baseline-yellow text-black hover:bg-baseline-yellow/90"
                          onClick={() => handleExportRegistrations(tournament.id)}
                          disabled={registrationsLoading[tournament.id] ?? false}
                        >
                          <Download size={16} className="mr-2" />
                          {registrationsLoading[tournament.id] ? "Preparing..." : "Export CSV"}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelTournament(tournament.id)}
                        >
                          Cancel Tournament
                        </Button>
                      </div>

                          </div>
                          
                          {tournamentRegistrations.length > 0 ? <div className="overflow-x-auto rounded-lg border border-gray-700/50">
                              <table className="w-full border-collapse bg-gray-900/30">
                                <thead>
                                  <tr className="bg-gray-800/50">
                                    <th className="text-left py-3 px-4 font-medium">Team Name</th>
                                    <th className="text-left py-3 px-4 font-medium">Contact</th>
                                    <th className="text-left py-3 px-4 font-medium">Players</th>
                                    <th className="text-center py-3 px-4 font-medium">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tournamentRegistrations.map((reg: APIRegistration, index: number) => (
                                    <tr key={reg.id ?? index} className="border-t border-gray-700/30 hover:bg-gray-800/20 transition-colors">
                                      <td className="py-3 px-4">{reg.team_name || 'N/A'}</td>
                                      <td className="py-3 px-4">
                                        {reg.captain_name || 'N/A'}
                                        <br />
                                        <span className="text-xs text-gray-400">{reg.email || 'N/A'}</span>
                                      </td>
                                      <td className="py-3 px-4">{(reg.player_names?.length ?? 0)} players</td>
                                      <td className="py-3 px-4 text-center">
                                        <span className="bg-green-900/50 text-green-300 px-2 py-1 rounded-full text-xs border border-green-800/50">Registered</span>
                                      </td>
                                    </tr>
                                  ))}

                                </tbody>
                              </table>
                            </div> : <p className="text-center text-gray-500 py-8">No registrations yet for this tournament</p>}
                        </div>
                      </div>;
              })}
                </div>}
              
              {/* Past tournaments */}
              {pastTournaments.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Past Tournaments</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {pastTournaments.map(t => (
                      <div key={t.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                        <h4 className="font-medium">{t.title}</h4>
                        <p className="text-sm text-gray-400">{t.date} • {t.location}</p>
                        <p className="text-xs text-gray-500 mt-2">Status: {t.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </TabsContent>
          
          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-8">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="bg-gray-900/40 backdrop-blur-lg rounded-xl border border-gray-800/50 p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-baseline-yellow">Manage Announcements</h2>
              
              {/* Current Announcement Status */}
              {currentAnnouncement && <motion.div initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} className="mb-6 p-4 border border-green-800/50 rounded-lg bg-green-900/20 backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <CheckCircle size={16} className="text-green-400 mr-2" />
                        <span className="text-green-400 font-medium text-sm">Active Announcement</span>
                      </div>
                      <p className="text-gray-300 mb-2">{currentAnnouncement.text}</p>
                      {currentAnnouncement.expiresAt && <p className="text-xs text-gray-400 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatTimeRemaining(currentAnnouncement.expiresAt)}
                        </p>}
                      {currentAnnouncement.duration === 'manual' && <p className="text-xs text-gray-400 flex items-center">
                          <Clock size={12} className="mr-1" />
                          Active until manually canceled
                        </p>}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCancelAnnouncement} className="mt-2 sm:mt-0 border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                      Cancel Now
                    </Button>
                  </div>
                </motion.div>}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Announcement Text</label>
                  <textarea value={announcementText} onChange={e => setAnnouncementText(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm px-4 py-3 min-h-[100px] focus:border-baseline-yellow focus:ring-1 focus:ring-baseline-yellow transition-all resize-none" placeholder="Enter announcement text for the home page..." />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Display Duration</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" value="24hours" checked={announcementDuration === '24hours'} onChange={e => setAnnouncementDuration(e.target.value as '24hours' | '48hours' | 'manual')} className="accent-baseline-yellow" />
                      <span className="text-sm">Show for 24 hours</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" value="48hours" checked={announcementDuration === '48hours'} onChange={e => setAnnouncementDuration(e.target.value as '24hours' | '48hours' | 'manual')} className="accent-baseline-yellow" />
                      <span className="text-sm">Show for 48 hours</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" value="manual" checked={announcementDuration === 'manual'} onChange={e => setAnnouncementDuration(e.target.value as '24hours' | '48hours' | 'manual')} className="accent-baseline-yellow" />
                      <span className="text-sm">Show until manually canceled</span>
                    </label>
                  </div>
                </div>
                
                <Button onClick={handlePublishAnnouncement} className="bg-baseline-yellow text-black hover:bg-baseline-yellow/90 transition-all duration-200">
                  <Bell size={18} className="mr-2" /> Publish Announcement
                </Button>
                
                <div className="bg-gray-800/30 p-4 rounded-lg mt-6 backdrop-blur-sm border border-gray-700/50">
                  <h3 className="text-sm font-medium mb-3 text-gray-300">Preview</h3>
                  <div className="border border-gray-700/50 rounded-lg p-4 bg-black/30 backdrop-blur-sm">
                    <p className="text-gray-300">{announcementText || "Your announcement will appear here..."}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Remove Player Confirmation Dialog */}
      <AnimatePresence>
        {showRemoveConfirm && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 max-w-md w-full p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Remove Player?</h3>
                <p className="text-gray-300">
                  Are you sure you want to remove{' '}
                  <span className="font-semibold text-baseline-yellow">
                    {playerToRemove?.name}
                  </span>{' '}
                  from the program? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1 border-gray-600 hover:bg-gray-800" onClick={cancelRemovePlayer}>
                  <X size={18} className="mr-2" /> Cancel
                </Button>
                
                <Button variant="destructive" className="flex-1 bg-red-600 hover:bg-red-700" onClick={confirmRemovePlayer}>
                  <Check size={18} className="mr-2" /> Remove Player  
                </Button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
      
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmCancel && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Cancel Tournament?</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to cancel this tournament? This will remove it from the public view and cannot be undone.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1 border-gray-600 hover:bg-gray-800" onClick={() => setShowConfirmCancel(false)}>
                  <X size={18} className="mr-2" /> No, Keep It
                </Button>
                
                <Button variant="destructive" className="flex-1 bg-red-600 hover:bg-red-700" onClick={confirmCancelTournament}>
                  <Check size={18} className="mr-2" /> Yes, Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};
export default CoachDashboard;
