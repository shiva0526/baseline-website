import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, Award, FileSpreadsheet, Bell, LogOut, CheckCircle, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerProfile from '@/components/coach/PlayerProfile';

// Hooks
import { usePlayers } from '@/features/coach/hooks/usePlayers';
import { useAttendance } from '@/features/coach/hooks/useAttendance';
import { useTournaments } from '@/features/coach/hooks/useTournaments';
import { useRegistrations } from '@/features/coach/hooks/useRegistrations';
import { useAnnouncements } from '@/features/coach/hooks/useAnnouncements';

// Tabs
import AttendanceTab from '@/features/coach/tabs/AttendanceTab';
import PlayersTab from '@/features/coach/tabs/PlayersTab';
import TournamentsTab from '@/features/coach/tabs/TournamentsTab';
import RegistrationsTab from '@/features/coach/tabs/RegistrationsTab';
import AnnouncementsTab from '@/features/coach/tabs/AnnouncementsTab';

// Dialogs
import RemovePlayerDialog from '@/features/coach/dialogs/RemovePlayerDialog';
import CancelTournamentDialog from '@/features/coach/dialogs/CancelTournamentDialog';
import WhatsAppDialog from '@/features/coach/dialogs/WhatsAppDialog';

const CoachDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logoutUser } = useAuth();

  const [activeTab, setActiveTab] = useState("attendance");
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [moreActiveSection, setMoreActiveSection] = useState<'announcements' | 'reports'>('announcements');

  // --- Hooks ---
  const playerHook = usePlayers();
  const attendanceHook = useAttendance(playerHook.players, playerHook.setPlayers);
  const tournamentHook = useTournaments();
  const registrationHook = useRegistrations();
  const announcementHook = useAnnouncements();

  const handleLogout = async () => {
    await logoutUser();
    toast({ title: "Logged out successfully" });
    navigate('/', { replace: true });
  };

  // --- Player Profile View ---
  if (playerHook.selectedPlayer) return <PlayerProfile player={playerHook.selectedPlayer} onBack={() => playerHook.setSelectedPlayer(null)} onPlayerUpdated={(updated) => {
    playerHook.setPlayers(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
    playerHook.setSelectedPlayer({ ...playerHook.selectedPlayer!, ...updated });
  }} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 lg:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/"><img src="/images/Logo.png" alt="BaseLine" className="h-10 sm:h-12 mr-3" /></Link>
            <h1 className="text-lg sm:text-xl font-bold">Coach Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-300 hover:text-white"><LogOut size={18} className="sm:mr-2" /> <span className="hidden sm:inline">Logout</span></Button>
        </div>
      </motion.header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 pb-24 lg:py-8 lg:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop TabsList */}
          <TabsList className="hidden lg:grid grid-cols-6 w-full mb-8 bg-gray-900/50 backdrop-blur-sm">
            <TabsTrigger value="attendance" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Attendance</TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2"><Users className="h-4 w-4" /> Players</TabsTrigger>
            <TabsTrigger value="tournaments" className="flex items-center gap-2"><Award className="h-4 w-4" /> Tournaments</TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" /> Registrations</TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2"><Bell className="h-4 w-4" /> Announcements</TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" /> Reports</TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <AttendanceTab
            {...attendanceHook}
            filteredPlayers={playerHook.filteredPlayers}
            searchQuery={playerHook.searchQuery}
            setSearchQuery={playerHook.setSearchQuery}
            selectedBatch={playerHook.selectedBatch}
            setSelectedBatch={playerHook.setSelectedBatch}
            setSelectedPlayer={playerHook.setSelectedPlayer}
          />
          <PlayersTab
            players={playerHook.players}
            newPlayer={playerHook.newPlayer}
            setNewPlayer={playerHook.setNewPlayer}
            handleAddPlayer={playerHook.handleAddPlayer}
            handleRemovePlayer={playerHook.handleRemovePlayer}
            setSelectedPlayer={playerHook.setSelectedPlayer}
          />
          <TournamentsTab
            allTournaments={tournamentHook.allTournaments}
            tournamentForm={tournamentHook.tournamentForm}
            setTournamentForm={tournamentHook.setTournamentForm}
            handleCreateTournament={tournamentHook.handleCreateTournament}
            handleCancelTournament={tournamentHook.handleCancelTournament}
          />
          <RegistrationsTab
            allTournaments={tournamentHook.allTournaments}
            pastTournaments={tournamentHook.pastTournaments}
            registrationsByTournament={registrationHook.registrationsByTournament}
            registrationsLoading={registrationHook.registrationsLoading}
            fetchRegistrationsForTournament={registrationHook.fetchRegistrationsForTournament}
            handleExportRegistrations={registrationHook.handleExportRegistrations}
          />
          <AnnouncementsTab {...announcementHook} />
          <TabsContent value="reports" className="space-y-8">
            <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-primary">Send Player Reports</h2>
              <div className="flex gap-3 mb-4">
                <Button variant="outline" size="sm" onClick={() => { if (playerHook.selectedPlayerIds.size === playerHook.filteredPlayers.length && playerHook.filteredPlayers.length > 0) playerHook.setSelectedPlayerIds(new Set()); else playerHook.setSelectedPlayerIds(new Set(playerHook.filteredPlayers.map(p => p.id))); }} className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700">
                  {playerHook.selectedPlayerIds.size === playerHook.filteredPlayers.length && playerHook.filteredPlayers.length > 0 ? 'Deselect All' : 'Select All'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { const notifiedIds = playerHook.filteredPlayers.filter(playerHook.isNotified).map(p => p.id); playerHook.setSelectedPlayerIds(new Set(notifiedIds)); }} className="bg-gray-800/50 border-gray-700 text-yellow-500 hover:bg-gray-700">Notified Only (!)</Button>
                <Button size="sm" disabled={playerHook.selectedPlayerIds.size === 0} onClick={() => playerHook.setShowWhatsAppDialog(true)} className="bg-[#25D366] hover:bg-[#128C7E] text-white ml-auto">
                  Send WhatsApp ({playerHook.selectedPlayerIds.size})
                </Button>
              </div>
              <input type="text" placeholder="Search players..." value={playerHook.searchQuery} onChange={e => playerHook.setSearchQuery(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 mt-2 mb-4 text-white text-sm" />
              <p className="text-sm text-gray-500 mb-4">{playerHook.selectedPlayerIds.size} of {playerHook.filteredPlayers.length} selected</p>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {playerHook.filteredPlayers.map(player => (
                    <motion.div key={player.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { const newSet = new Set(playerHook.selectedPlayerIds); if (newSet.has(player.id)) newSet.delete(player.id); else newSet.add(player.id); playerHook.setSelectedPlayerIds(newSet); }} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${playerHook.selectedPlayerIds.has(player.id) ? 'bg-primary/10 border-primary/40' : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${playerHook.selectedPlayerIds.has(player.id) ? 'bg-primary border-primary' : 'border-gray-600'}`}>
                        {playerHook.selectedPlayerIds.has(player.id) && <Check size={12} className="text-black" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          {player.name}
                          {playerHook.isNotified(player) && <span className="w-5 h-5 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center justify-center animate-pulse">!</span>}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-0.5">
                          <span className="bg-primary/20 text-primary px-2 rounded-full text-xs">{player.program}</span>
                          {player.batch && <span className="bg-blue-500/20 text-blue-300 px-2 rounded-full text-xs">{player.batch}</span>}
                          {player.phone && <span className="text-xs">📞 {player.phone}</span>}
                          <span className="text-xs">{player.attendedClasses} classes attended</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <WhatsAppDialog
        show={playerHook.showWhatsAppDialog}
        players={playerHook.players}
        selectedPlayerIds={playerHook.selectedPlayerIds}
        isNotified={playerHook.isNotified}
        onClose={() => playerHook.setShowWhatsAppDialog(false)}
      />
      <RemovePlayerDialog
        show={playerHook.showRemoveConfirm}
        player={playerHook.playerToRemove}
        onConfirm={playerHook.confirmRemovePlayer}
        onCancel={() => playerHook.setShowRemoveConfirm(false)}
      />
      <CancelTournamentDialog
        show={tournamentHook.showConfirmCancel}
        onConfirm={tournamentHook.confirmCancelTournament}
        onCancel={() => tournamentHook.setShowConfirmCancel(false)}
      />

      {/* MORE BOTTOM SHEET */}
      <AnimatePresence>
        {showMoreSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreSheet(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-30"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed bottom-[64px] left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 rounded-t-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 bg-gray-700 rounded-full" />
              </div>
              <div className="flex gap-2 px-4 py-3 flex-shrink-0">
                <button
                  onClick={() => setMoreActiveSection('announcements')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    moreActiveSection === 'announcements' ? 'bg-primary text-black' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <Bell size={15} /> Announcements
                </button>
                <button
                  onClick={() => setMoreActiveSection('reports')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    moreActiveSection === 'reports' ? 'bg-primary text-black' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <FileSpreadsheet size={15} /> Reports
                </button>
              </div>
              <div className="overflow-y-auto flex-1 px-4 pb-6">
                {moreActiveSection === 'announcements' && (
                  <div className="space-y-4 pt-2">
                    {announcementHook.currentAnnouncement && (
                      <div className="p-4 border border-green-800 bg-green-900/20 rounded-xl flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="text-green-400 flex items-center gap-2 mb-1 text-sm font-medium"><CheckCircle size={14} /> Active Announcement</div>
                          <p className="text-gray-300 text-sm">{announcementHook.currentAnnouncement.text}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={11} />
                            {announcementHook.currentAnnouncement.expiresAt ? announcementHook.formatTimeRemaining(announcementHook.currentAnnouncement.expiresAt) : 'Manual'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={announcementHook.handleCancelAnnouncement} className="bg-red-900/20 text-red-400 border-red-900 hover:bg-red-900/30 flex-shrink-0">Cancel</Button>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Message</label>
                      <textarea className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 h-28 text-white text-sm resize-none focus:outline-none focus:border-primary transition-colors" placeholder="Type your announcement..." value={announcementHook.announcementText} onChange={e => announcementHook.setAnnouncementText(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Duration</label>
                      <div className="flex flex-col gap-2">
                        {[{ value: '24hours', label: '24 Hours' }, { value: '48hours', label: '48 Hours' }, { value: 'manual', label: 'Until Canceled' }].map(opt => (
                          <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${announcementHook.announcementDuration === opt.value ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-800/50'}`}>
                            <input type="radio" name="duration" checked={announcementHook.announcementDuration === opt.value} onChange={() => announcementHook.setAnnouncementDuration(opt.value as any)} className="text-primary focus:ring-primary" />
                            <span className="text-sm text-white">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button onClick={() => { announcementHook.handlePublishAnnouncement(); setShowMoreSheet(false); }} className="w-full h-12 bg-primary text-black font-semibold hover:bg-primary/90"><Bell size={16} className="mr-2" /> Publish Announcement</Button>
                  </div>
                )}
                {moreActiveSection === 'reports' && (
                  <div className="space-y-4 pt-2">
                    <div className="flex gap-2">
                      <button onClick={() => { if (playerHook.selectedPlayerIds.size === playerHook.filteredPlayers.length && playerHook.filteredPlayers.length > 0) playerHook.setSelectedPlayerIds(new Set()); else playerHook.setSelectedPlayerIds(new Set(playerHook.filteredPlayers.map(p => p.id))); }} className="flex-1 py-2 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all touch-manipulation">
                        {playerHook.selectedPlayerIds.size === playerHook.filteredPlayers.length && playerHook.filteredPlayers.length > 0 ? 'Deselect All' : 'Select All'}
                      </button>
                      <button onClick={() => { const notifiedIds = playerHook.filteredPlayers.filter(playerHook.isNotified).map(p => p.id); playerHook.setSelectedPlayerIds(new Set(notifiedIds)); }} className="flex-1 py-2 text-sm bg-yellow-900/30 text-yellow-500 border border-yellow-800 rounded-lg hover:bg-yellow-900/50 transition-all touch-manipulation">Notified Only (!)</button>
                    </div>
                    
                    <input type="text" placeholder="Search players..." value={playerHook.searchQuery} onChange={e => playerHook.setSearchQuery(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm" />
                    
                    <p className="text-xs text-gray-500">{playerHook.selectedPlayerIds.size} of {playerHook.filteredPlayers.length} selected</p>
                    <div className="space-y-2">
                      {playerHook.filteredPlayers.map(p => (
                        <div key={p.id} onClick={() => { const newSet = new Set(playerHook.selectedPlayerIds); if (newSet.has(p.id)) newSet.delete(p.id); else newSet.add(p.id); playerHook.setSelectedPlayerIds(newSet); }} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all touch-manipulation active:scale-[0.98] ${playerHook.selectedPlayerIds.has(p.id) ? 'bg-primary/10 border-primary/40' : 'bg-gray-800/40 border-gray-700/40'}`}>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${playerHook.selectedPlayerIds.has(p.id) ? 'bg-primary border-primary' : 'border-gray-600'}`}>
                            {playerHook.selectedPlayerIds.has(p.id) && <Check size={12} className="text-black" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white flex items-center gap-1.5">{p.name} {playerHook.isNotified(p) && <span className="w-4 h-4 bg-yellow-500 text-black text-[9px] font-bold rounded-full inline-flex items-center justify-center animate-pulse">!</span>}</p>
                            <p className="text-xs text-gray-500">{p.phone || 'No phone'} · {p.attendedClasses} classes</p>
                          </div>
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">{p.program}</span>
                        </div>
                      ))}
                    </div>
                    <Button disabled={playerHook.selectedPlayerIds.size === 0} onClick={() => { setShowMoreSheet(false); playerHook.setShowWhatsAppDialog(true); }} className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold sticky bottom-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor"><path d="M12.01 2.01c-5.52 0-10 4.48-10 10 0 1.77.46 3.43 1.26 4.88L2 22l5.24-1.37c1.4.76 3 1.18 4.77 1.18 5.52 0 10-4.48 10-10a10 10 0 00-10-9.99z"/></svg>
                      Send WhatsApp to {playerHook.selectedPlayerIds.size} Player{playerHook.selectedPlayerIds.size !== 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar — Mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {[{ id: 'attendance', label: 'Attend', icon: Calendar }, { id: 'players', label: 'Players', icon: Users }, { id: 'tournaments', label: 'Events', icon: Award }, { id: 'registrations', label: 'Regs', icon: FileSpreadsheet }].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowMoreSheet(false); }} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px] touch-manipulation ${activeTab === tab.id && !showMoreSheet ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-gray-300'}`}>
              <tab.icon size={20} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          ))}
          <button onClick={() => setShowMoreSheet(prev => !prev)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px] touch-manipulation ${showMoreSheet ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-gray-300'}`}>
            <div className="flex items-center gap-[3px] h-5">
              <div className={`w-[5px] h-[5px] rounded-full transition-colors ${showMoreSheet ? 'bg-primary' : 'bg-current'}`} />
              <div className={`w-[5px] h-[5px] rounded-full transition-colors ${showMoreSheet ? 'bg-primary' : 'bg-current'}`} />
              <div className={`w-[5px] h-[5px] rounded-full transition-colors ${showMoreSheet ? 'bg-primary' : 'bg-current'}`} />
            </div>
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default CoachDashboard;