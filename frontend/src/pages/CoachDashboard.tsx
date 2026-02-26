import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, Award, User, FileSpreadsheet, Bell, LogOut, Plus, Download, Trash2, X, Check, Menu, Clock, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Added Sheet for mobile sidebar
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerProfile from '@/components/coach/PlayerProfile';
import { getPlayers, addPlayer, removePlayer } from "@/api/players";
import { getAttendance, updateAttendance } from "@/api/attendance";
import { getAnnouncements } from "@/api/announcements";
import axiosClient from "@/api/axiosClient";
import { getTournaments as apiGetTournaments, createTournament as apiCreateTournament, deleteTournament as apiDeleteTournament } from "@/api/tournaments";
import { getRegistrations as apiGetRegistrations, Registration as APIRegistration } from "@/api/registrations";

// --- Interfaces ---

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

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
type Program = '3-Day' | '5-Day';

interface Player {
  id: number;
  name: string;
  program: Program;
  attendedClasses: number;
  weeklyAttendance: number;
  phone?: string;
  avatar?: string | null;
  performance_ratings?: Record<string, number>;
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
  const { toast } = useToast();
  const { logoutUser } = useAuth();

  // --- State ---
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    program: '3-Day' as Program,
    phone: '' // Added phone state
  });

  // Announcements
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementDuration, setAnnouncementDuration] = useState<'24hours' | '48hours' | 'manual'>('24hours');
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);

  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [tournamentToCancel, setTournamentToCancel] = useState<number | null>(null);
  const [tournamentForm, setTournamentForm] = useState({
    title: '', date: '', location: '', description: '',
    matchType: '3v3', ageGroups: [] as string[],
    registrationOpen: '', registrationClose: ''
  });

  const inFlightRegistrationsRef = useRef<Record<number, Promise<APIRegistration[]> | undefined>>({});
  const [registrationsByTournament, setRegistrationsByTournament] = useState<Record<number, APIRegistration[]>>({});
  const [registrationsLoading, setRegistrationsLoading] = useState<Record<number, boolean>>({});

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<Record<string, Record<number, boolean>>>({});
  const [unsavedDates, setUnsavedDates] = useState<Record<string, boolean>>({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Mobile Tabs State
  const [activeTab, setActiveTab] = useState("attendance");

  // --- Helpers ---

  const normalizeTournament = (t: any) => ({
    id: t.id, title: t.title, date: t.date, location: t.location,
    description: t.description ?? "", matchType: t.match_type ?? "3v3",
    ageGroups: t.age_groups ?? [], registrationOpen: t.registration_open ?? "",
    registrationClose: t.registration_close ?? "", status: t.status ?? "upcoming"
  });

  const fetchRegistrationsForTournament = async (tournamentId: number) => {
    if (registrationsByTournament[tournamentId]) return registrationsByTournament[tournamentId];
    if (inFlightRegistrationsRef.current[tournamentId]) return inFlightRegistrationsRef.current[tournamentId];

    const promise = (async () => {
      setRegistrationsLoading(prev => ({ ...prev, [tournamentId]: true }));
      try {
        const regs = await apiGetRegistrations(tournamentId);
        setRegistrationsByTournament(prev => ({ ...prev, [tournamentId]: regs }));
        return regs;
      } catch (err) {
        setRegistrationsByTournament(prev => ({ ...prev, [tournamentId]: [] }));
        return [];
      } finally {
        setRegistrationsLoading(prev => ({ ...prev, [tournamentId]: false }));
        delete inFlightRegistrationsRef.current[tournamentId];
      }
    })();
    inFlightRegistrationsRef.current[tournamentId] = promise;
    return promise;
  };

  const escapeCSV = (value: any) => {
    if (value === null || value === undefined) return "";
    const s = String(value);
    if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const timeLeft = expiresAt - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor(timeLeft % (1000 * 60 * 60) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
  };

  // --- Initial Data Load ---
  useEffect(() => {
    getPlayers().then(setPlayers).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tList = await apiGetTournaments();
        if (!mounted) return;
        const normalized = (tList || []).map(normalizeTournament);
        setAllTournaments(normalized);
        const today = new Date();
        const past = normalized
          .filter(t => new Date(t.date) < today)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setPastTournaments(past.slice(-2));
      } catch (err) { console.error(err); }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentAnnouncement && currentAnnouncement.expiresAt) {
        if (Date.now() > currentAnnouncement.expiresAt) {
          setCurrentAnnouncement(null);
          localStorage.removeItem('currentAnnouncement');
          window.dispatchEvent(new Event('storage'));
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentAnnouncement]);

  // --- Calendar Logic ---

  const getCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const formatLocalYmd = (d: Date) => {
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${m}-${day}`;
    };
    const todayString = formatLocalYmd(today);
    const dates = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = formatLocalYmd(date);
      const isFuture = date > today;
      const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      dates.push({
        date: i, fullDate: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isDisabled: isFuture && daysDiff > 3, isToday: dateString === todayString
      });
    }
    return dates;
  };
  const calendarDates = getCalendarDates();

  const handleAttendanceToggle = (playerId: number, checked: boolean) => {
    const selectedDateObj = calendarDates.find((d) => d.fullDate === selectedDate);
    if (selectedDateObj?.isDisabled) return;

    if (checked) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        const limit = player.program === '5-Day' ? 5 : 3;
        if (player.weeklyAttendance >= limit) {
          const confirm = window.confirm(`⚠️ WARNING: Limit Reached\n${player.name} attended ${player.weeklyAttendance} classes this week.\nAdd extra class?`);
          if (!confirm) return;
        }
      }
    }

    setAttendance((prev) => {
      const prevForDate = prev[selectedDate] || {};
      return { ...prev, [selectedDate]: { ...prevForDate, [playerId]: checked } };
    });
    setUnsavedDates((prev) => ({ ...prev, [selectedDate]: true }));
  };

  useEffect(() => {
    let mounted = true;
    setAttendanceLoading(true);
    getAttendance(selectedDate).then((map) => {
      if (!mounted) return;
      setAttendance((prev) => ({ ...prev, [selectedDate]: map }));
      setUnsavedDates((prev) => ({ ...prev, [selectedDate]: false }));
    }).catch(() => { if (mounted) setAttendance((prev) => ({ ...prev, [selectedDate]: {} })); })
      .finally(() => { if (mounted) setAttendanceLoading(false); });
    return () => { mounted = false; };
  }, [selectedDate]);

  const handleUpdateAttendance = async () => {
    try {
      await updateAttendance(selectedDate, attendance[selectedDate] || {});
      const updated = await getPlayers();
      setPlayers(updated);
      setUnsavedDates((prev) => ({ ...prev, [selectedDate]: false }));
      toast({ title: "Attendance Updated" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axiosClient.get("/attendance/report", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link); link.click(); link.remove();
      toast({ title: "Report Downloaded" });
    } catch { toast({ title: "Download Failed", variant: "destructive" }); }
  };

  // --- Filtering & Navigation ---

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.phone && player.phone.includes(searchQuery))
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  // --- Player Management ---

  const handleAddPlayer = async () => {
    if (!newPlayer.name) return;
    try {
      const saved = await addPlayer(newPlayer);
      setPlayers([...players, saved]);
      setNewPlayer({ name: "", program: "3-Day", phone: "" });
      toast({ title: "Player added" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleRemovePlayer = (player: Player) => { setPlayerToRemove(player); setShowRemoveConfirm(true); };
  const confirmRemovePlayer = async () => {
    if (!playerToRemove) return;
    try {
      await removePlayer(playerToRemove.id);
      setPlayers(prev => prev.filter(p => p.id !== playerToRemove.id));
      toast({ title: "Player removed" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
    setShowRemoveConfirm(false); setPlayerToRemove(null);
  };

  const handleCreateTournament = async () => {
    if (!tournamentForm.title || !tournamentForm.date) { toast({ title: "Missing info", variant: "destructive" }); return; }
    try {
      const created = await apiCreateTournament({ ...tournamentForm, description: tournamentForm.description || '' });
      setAllTournaments(prev => [...prev, normalizeTournament(created)]);
      setTournamentForm({ title: '', date: '', location: '', description: '', matchType: '3v3', ageGroups: [], registrationOpen: '', registrationClose: '' });
      toast({ title: "Tournament created" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleCancelTournament = (id: number) => { setTournamentToCancel(id); setShowConfirmCancel(true); };
  const confirmCancelTournament = async () => {
    if (!tournamentToCancel) return;
    try {
      await apiDeleteTournament(tournamentToCancel);
      setAllTournaments(prev => prev.map(t => t.id === tournamentToCancel ? { ...t, status: 'cancelled' } : t));
      toast({ title: "Cancelled" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
    setShowConfirmCancel(false); setTournamentToCancel(null);
  };

  const handleExportRegistrations = async (id: number) => {
    try {
      const regs = await fetchRegistrationsForTournament(id);
      if (!regs || !regs.length) { toast({ title: "No data", variant: "destructive" }); return; }
      const headers = ['Team', 'Captain', 'Phone', 'Email', 'Players'];
      const rows = regs.map(r => [escapeCSV(r.team_name), escapeCSV(r.captain_name), escapeCSV(r.phone), escapeCSV(r.email), escapeCSV(r.player_names?.join(' | '))].join(','));
      const blob = new Blob(['\uFEFF' + [headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `regs_${id}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast({ title: "Exported" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handlePublishAnnouncement = () => {
    if (!announcementText) return;
    const now = Date.now();
    let expiresAt;
    if (announcementDuration === '24hours') expiresAt = now + 86400000;
    else if (announcementDuration === '48hours') expiresAt = now + 172800000;
    const ann: Announcement = { id: now, text: announcementText, duration: announcementDuration, createdAt: now, expiresAt };
    localStorage.setItem('announcement', announcementText);
    localStorage.setItem('currentAnnouncement', JSON.stringify(ann));
    setCurrentAnnouncement(ann);
    setAnnouncementText('');
    window.dispatchEvent(new Event('storage'));
    toast({ title: "Published" });
  };

  const handleCancelAnnouncement = () => {
    setCurrentAnnouncement(null);
    localStorage.removeItem('currentAnnouncement');
    localStorage.removeItem('announcement');
    window.dispatchEvent(new Event('storage'));
    toast({ title: "Canceled" });
  };

  const handleLogout = async () => {
    await logoutUser();
    toast({ title: "Logged out successfully" });
    navigate('/', { replace: true });
  };

  if (selectedPlayer) return <PlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden mr-2 text-gray-300 hover:text-white"><Menu size={20} /></Button>
            <Link to="/"><img src="/images/Logo.png" alt="BaseLine" className="h-12 mr-4" /></Link>
            <div><h1 className="text-xl font-bold">Coach Dashboard</h1></div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-gray-300 hover:text-white"><LogOut size={18} className="mr-2" /> Logout</Button>
        </div>
      </motion.header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Tabs List - Hidden on Mobile */}
          <TabsList className="hidden lg:grid grid-cols-5 w-full mb-8 bg-gray-900/50 backdrop-blur-sm">
            <TabsTrigger value="attendance" className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> Attendance</TabsTrigger>
            <TabsTrigger value="players" className="flex items-center"><Users className="mr-2 h-4 w-4" /> Players</TabsTrigger>
            <TabsTrigger value="tournaments" className="flex items-center"><Award className="mr-2 h-4 w-4" /> Tournaments</TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center"><FileSpreadsheet className="mr-2 h-4 w-4" /> Registrations</TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center"><Bell className="mr-2 h-4 w-4" /> Announcements</TabsTrigger>
          </TabsList>

          {/* Mobile Tabs Sidebar (Replacing the old sidebar overlay) */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="bg-gray-900 border-r border-gray-800 text-white w-[280px]">
              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <img src="/images/Logo.png" alt="BaseLine" className="h-10 mb-6" />
                  <h2 className="text-xl font-bold mb-1">Coach Dashboard</h2>
                  <p className="text-gray-400 text-sm">Manage your team</p>
                </div>
                <div className="space-y-2 flex-1">
                  {[
                    { id: 'attendance', label: 'Attendance', icon: Calendar },
                    { id: 'players', label: 'Players', icon: Users },
                    { id: 'tournaments', label: 'Tournaments', icon: Award },
                    { id: 'registrations', label: 'Registrations', icon: FileSpreadsheet },
                    { id: 'announcements', label: 'Announcements', icon: Bell },
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      className={`w-full justify-start ${activeTab === tab.id ? 'bg-primary text-black' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <tab.icon className="mr-3 h-5 w-5" />
                      {tab.label}
                    </Button>
                  ))}
                </div>
                <div className="pt-6 border-t border-gray-800">
                  <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/10" onClick={handleLogout}>
                    <LogOut className="mr-3 h-5 w-5" /> Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* ATTENDANCE TAB - Now with Clickable Names */}
          <TabsContent value="attendance" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/80 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="bg-primary/90 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Attendance</h2>
                <Button onClick={handleDownloadReport} variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                  <Download className="h-4 w-4 mr-2" /> Report
                </Button>
              </div>
              <div className="p-6">
                {/* Calendar Controls */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}><ChevronLeft /></Button>
                    <h3 className="text-lg font-semibold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}><ChevronRight /></Button>
                  </div>
                </div>
                {/* Dates Row */}
                <div className="flex gap-2 overflow-x-auto pb-4">
                  {calendarDates.map((d) => (
                    <Button key={d.fullDate} variant={selectedDate === d.fullDate ? "default" : "ghost"}
                      onClick={() => !d.isDisabled && setSelectedDate(d.fullDate)} disabled={d.isDisabled}
                      className={`flex-col h-auto py-2 min-w-[50px] ${d.isToday ? 'ring-1 ring-primary' : ''}`}>
                      <span className="text-xs">{d.dayName}</span><span className="text-lg font-bold">{d.date}</span>
                    </Button>
                  ))}
                </div>
                {/* Player List */}
                <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 mb-4 text-white" />
                  {filteredPlayers.map(p => {
                    const weeklyLimit = p.program === '5-Day' ? 5 : 3;
                    const isOver = p.weeklyAttendance >= weeklyLimit;
                    return (
                      <div key={p.id} className="bg-gray-800/40 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover rounded-full" /> : <User size={20} />}
                          </div>
                          <div>
                            {/* FIXED: Added onClick to open profile */}
                            <h3 className="font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedPlayer(p)}>
                              {p.name}
                            </h3>
                            <div className="flex gap-3 text-xs text-gray-400">
                              <span className="text-primary">{p.program}</span>
                              <span className="hidden sm:inline">• Cycle: {p.attendedClasses}</span>
                              <span className={`hidden sm:inline ${isOver ? "text-yellow-500 font-bold" : ""}`}>• Week: {p.weeklyAttendance}</span>
                              <span>• Classes Attended: {p.attendedClasses}</span>
                            </div>
                          </div>
                        </div>
                        <Switch checked={attendance[selectedDate]?.[p.id] || false} onCheckedChange={(c) => handleAttendanceToggle(p.id, c)} disabled={calendarDates.find(d => d.fullDate === selectedDate)?.isDisabled} />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6"><Button onClick={handleUpdateAttendance} className="w-full" disabled={attendanceLoading || !unsavedDates[selectedDate]}>Save Attendance</Button></div>
              </div>
            </motion.div>
          </TabsContent>

          {/* PLAYERS TAB */}
          <TabsContent value="players" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Add Player */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold mb-6 text-primary">Add New Player</h2>
                <div className="space-y-4">
                  <input className="w-full bg-gray-800 border-gray-700 rounded p-3" placeholder="Name" value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} />
                  <input className="w-full bg-gray-800 border-gray-700 rounded p-3" placeholder="Phone Number" value={newPlayer.phone} onChange={e => setNewPlayer({ ...newPlayer, phone: e.target.value })} />
                  <select className="w-full bg-gray-800 border-gray-700 rounded p-3" value={newPlayer.program} onChange={e => setNewPlayer({ ...newPlayer, program: e.target.value as Program })}>
                    <option value="3-Day">3-Day Program</option><option value="5-Day">5-Day Program</option>
                  </select>
                  <Button onClick={handleAddPlayer} className="w-full bg-primary text-black hover:bg-primary/90"><Plus size={18} className="mr-2" /> Add Player</Button>
                </div>
              </motion.div>
              {/* Player List */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold mb-6 text-primary">Player Management</h2>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {players.map(player => (
                      <motion.div key={player.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <h3 className="font-semibold cursor-pointer hover:text-primary" onClick={() => setSelectedPlayer(player)}>{player.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="bg-primary/20 text-primary px-2 rounded-full text-xs">{player.program}</span>
                            {player.phone && <span className="text-xs">📞 {player.phone}</span>}
                            <span>ID: {player.id}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemovePlayer(player)} className="text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* TOURNAMENTS TAB */}
          <TabsContent value="tournaments" className="space-y-8">
            {allTournaments.filter(t => t.status === 'upcoming').length > 0 && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-primary">Active Tournaments</h2>
              <div className="space-y-4">
                {allTournaments.filter(t => t.status === 'upcoming').map(t => (
                  <div key={t.id} className="bg-black/30 border border-gray-800 p-6 rounded-lg flex flex-col md:flex-row justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{t.title}</h3>
                      <div className="flex gap-2 mt-2 mb-2 text-sm text-gray-400">
                        <span className="bg-gray-800 px-2 rounded">{t.date}</span><span className="bg-gray-800 px-2 rounded">{t.matchType}</span>
                        <span className="bg-green-900/30 text-green-200 px-2 rounded border border-green-800">Active</span>
                      </div>
                      <p className="text-gray-400">{t.description}</p>
                    </div>
                    <Button variant="destructive" onClick={() => handleCancelTournament(t.id)} className="mt-4 md:mt-0"><Trash2 size={16} className="mr-2" /> Cancel</Button>
                  </div>
                ))}
              </div>
            </motion.div>}

            <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6 text-primary">Create New Tournament</h2>
              <div className="grid lg:grid-cols-2 gap-6 mb-4">
                <div className="space-y-4">
                  <input className="w-full bg-gray-800 border-gray-700 rounded p-3" placeholder="Title" value={tournamentForm.title} onChange={e => setTournamentForm({ ...tournamentForm, title: e.target.value })} />
                  <input type="date" className="w-full bg-gray-800 border-gray-700 rounded p-3" value={tournamentForm.date} onChange={e => setTournamentForm({ ...tournamentForm, date: e.target.value })} />
                  <input className="w-full bg-gray-800 border-gray-700 rounded p-3" placeholder="Location" value={tournamentForm.location} onChange={e => setTournamentForm({ ...tournamentForm, location: e.target.value })} />
                  <select className="w-full bg-gray-800 border-gray-700 rounded p-3" value={tournamentForm.matchType} onChange={e => setTournamentForm({ ...tournamentForm, matchType: e.target.value })}>
                    <option value="3v3">3v3</option><option value="5v5">5v5</option><option value="1v1">1v1</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <textarea className="w-full bg-gray-800 border-gray-700 rounded p-3 h-24" placeholder="Description" value={tournamentForm.description} onChange={e => setTournamentForm({ ...tournamentForm, description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-400">Reg Open</label><input type="date" className="w-full bg-gray-800 border-gray-700 rounded p-3" value={tournamentForm.registrationOpen} onChange={e => setTournamentForm({ ...tournamentForm, registrationOpen: e.target.value })} /></div>
                    <div><label className="text-xs text-gray-400">Reg Close</label><input type="date" className="w-full bg-gray-800 border-gray-700 rounded p-3" value={tournamentForm.registrationClose} onChange={e => setTournamentForm({ ...tournamentForm, registrationClose: e.target.value })} /></div>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block mb-2 text-sm text-gray-400">Age Groups</label>
                <div className="flex gap-4 flex-wrap">
                  {['U15', 'U16', 'U17', 'U18', 'U19'].map(age => (
                    <label key={age} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={tournamentForm.ageGroups.includes(age)} onChange={e => {
                        if (e.target.checked) setTournamentForm({ ...tournamentForm, ageGroups: [...tournamentForm.ageGroups, age] });
                        else setTournamentForm({ ...tournamentForm, ageGroups: tournamentForm.ageGroups.filter(a => a !== age) });
                      }} /> {age}
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateTournament} className="bg-primary text-black hover:bg-primary/90"><Award size={18} className="mr-2" /> Create</Button>
            </div>
          </TabsContent>

          {/* REGISTRATIONS TAB */}
          <TabsContent value="registrations" className="space-y-8">
            <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-primary">Tournament Registrations</h2>
              {allTournaments.map(t => {
                const regs = registrationsByTournament[t.id] || [];
                return (
                  <div key={t.id} className="mb-8 p-6 border border-gray-700 rounded bg-gray-800/20">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{t.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded border ${t.status === 'cancelled' ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-green-900/30 border-green-800 text-green-300'}`}>{t.status === 'cancelled' ? 'Cancelled' : 'Registration Open'}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => fetchRegistrationsForTournament(t.id)} disabled={registrationsLoading[t.id]}>Refresh</Button>
                        <Button size="sm" className="bg-primary text-black hover:bg-primary/90" onClick={() => handleExportRegistrations(t.id)} disabled={registrationsLoading[t.id]}><Download size={16} className="mr-2" /> Export CSV</Button>
                      </div>
                    </div>
                    {regs.length > 0 ? (
                      <div className="overflow-x-auto rounded border border-gray-700">
                        <table className="w-full text-left min-w-[600px]">
                          <thead className="bg-gray-800 text-gray-400"><tr><th className="p-3">Team</th><th className="p-3">Captain</th><th className="p-3">Phone</th><th className="p-3">Players</th></tr></thead>
                          <tbody>
                            {regs.map((r, i) => <tr key={i} className="border-t border-gray-700 hover:bg-gray-800/50">
                              <td className="p-3">{r.team_name}</td><td className="p-3">{r.captain_name}</td><td className="p-3">{r.phone}</td><td className="p-3 text-sm text-gray-400">{r.player_names?.join(', ')}</td>
                            </tr>)}
                          </tbody>
                        </table>
                      </div>
                    ) : <div className="text-center text-gray-500 py-6">No registrations found.</div>}
                  </div>
                );
              })}
              {pastTournaments.length > 0 && <div className="mt-8"><h3 className="text-lg font-bold mb-4">Past Tournaments</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {pastTournaments.map(t => <div key={t.id} className="p-4 bg-gray-800/30 border border-gray-700 rounded"><h4>{t.title}</h4><p className="text-sm text-gray-400">{t.date}</p></div>)}
                </div>
              </div>}
            </div>
          </TabsContent>

          {/* ANNOUNCEMENTS TAB */}
          <TabsContent value="announcements" className="space-y-8">
            <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-primary">Manage Announcements</h2>
              {currentAnnouncement && (
                <div className="p-4 border border-green-800 bg-green-900/20 rounded mb-6 flex justify-between items-center">
                  <div>
                    <div className="text-green-400 flex items-center gap-2 mb-1"><CheckCircle size={16} /> Active Announcement</div>
                    <div className="text-gray-300 text-lg">{currentAnnouncement.text}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={12} /> {currentAnnouncement.expiresAt ? formatTimeRemaining(currentAnnouncement.expiresAt) : 'Manual'}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCancelAnnouncement} className="text-red-400 border-red-900 hover:bg-red-900/20">Cancel</Button>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-gray-400">Message</label>
                  <textarea className="w-full bg-gray-800 border-gray-700 rounded p-3 h-32 text-white" placeholder="Enter announcement..." value={announcementText} onChange={e => setAnnouncementText(e.target.value)} />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-400">Duration</label>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {['24hours', '48hours', 'manual'].map(d => (
                      <label key={d} className="flex items-center gap-2 cursor-pointer bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-primary transition-colors">
                        <input type="radio" name="duration" checked={announcementDuration === d} onChange={() => setAnnouncementDuration(d as any)} className="text-primary focus:ring-primary" />
                        <span className="text-sm">{d === 'manual' ? 'Until Canceled' : d.replace('hours', ' Hours')}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handlePublishAnnouncement} className="bg-primary text-black hover:bg-primary/90"><Bell size={18} className="mr-2" /> Publish Announcement</Button>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>



      {/* Remove Confirm Dialog */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 w-full max-w-md text-center">
            <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="text-red-500" /></div>
            <h3 className="text-xl font-bold mb-2">Remove Player?</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to remove <span className="text-primary">{playerToRemove?.name}</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRemoveConfirm(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={confirmRemovePlayer}>Remove</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tournament Cancel Confirm Dialog */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 w-full max-w-md text-center">
            <h3 className="text-xl font-bold mb-2">Cancel Tournament?</h3>
            <p className="text-gray-300 mb-6">This will mark the tournament as cancelled. Are you sure?</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmCancel(false)}>No, Keep It</Button>
              <Button variant="destructive" className="flex-1" onClick={confirmCancelTournament}>Yes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;