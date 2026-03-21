import { User, Download, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import type { Player } from '@/types/coach';

interface CalendarDate {
  date: number;
  fullDate: string;
  dayName: string;
  isDisabled: boolean;
  isToday: boolean;
}

interface AttendanceTabProps {
  // Attendance hook
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentMonth: Date;
  attendance: Record<string, Record<number, boolean>>;
  unsavedDates: Record<string, boolean>;
  attendanceLoading: boolean;
  calendarDates: CalendarDate[];
  getWeekDates: (centerDate: string) => CalendarDate[];
  handleAttendanceToggle: (playerId: number, checked: boolean) => void;
  handleUpdateAttendance: () => void;
  handleDownloadReport: () => void;
  navigateMonth: (direction: 'prev' | 'next') => void;
  // Player data
  filteredPlayers: Player[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedBatch: 'All' | 'Batch 1' | 'Batch 2';
  setSelectedBatch: (b: 'All' | 'Batch 1' | 'Batch 2') => void;
  setSelectedPlayer: (player: Player) => void;
}

const AttendanceTab = ({
  selectedDate, setSelectedDate, currentMonth, attendance, unsavedDates,
  attendanceLoading, calendarDates, getWeekDates, handleAttendanceToggle, handleUpdateAttendance,
  handleDownloadReport, navigateMonth, filteredPlayers, searchQuery, setSearchQuery,
  selectedBatch, setSelectedBatch, setSelectedPlayer,
}: AttendanceTabProps) => {
  const weekDates = getWeekDates(selectedDate);

  // Derive the displayed week label from the week dates
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const weekLabel = (() => {
    const s = new Date(weekStart.fullDate + 'T00:00:00');
    const e = new Date(weekEnd.fullDate + 'T00:00:00');
    const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
    const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
    if (sMonth === eMonth) return `${sMonth} ${s.getDate()} – ${e.getDate()}`;
    return `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}`;
  })();

  return (
    <TabsContent value="attendance" className="space-y-4 lg:space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/80 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="bg-primary/90 px-4 sm:px-6 py-3 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-white">Attendance</h2>
          <Button onClick={handleDownloadReport} variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10">
            <Download className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Report</span>
          </Button>
        </div>
        <div className="p-4 sm:p-6">

          {/* MOBILE: Week label + compact week grid */}
          <div className="lg:hidden">
            <p className="text-center text-sm text-gray-400 mb-2 font-medium">{weekLabel}</p>
            <div className="flex items-center gap-1 mb-4">
              <Button variant="ghost" size="sm" className="flex-shrink-0 h-10 w-10 p-0"
                onClick={() => {
                  const d = new Date(selectedDate + 'T00:00:00');
                  d.setDate(d.getDate() - 7);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}>
                <ChevronLeft size={18} />
              </Button>

              <div className="grid grid-cols-7 gap-1 flex-1">
                {weekDates.map((d) => (
                  <button
                    key={d.fullDate}
                    disabled={d.isDisabled}
                    onClick={() => !d.isDisabled && setSelectedDate(d.fullDate)}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl text-center transition-all touch-manipulation
                      ${selectedDate === d.fullDate
                        ? 'bg-primary text-black font-bold'
                        : d.isToday
                          ? 'ring-1 ring-primary text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                      ${d.isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-[10px] uppercase tracking-wide">{d.dayName.slice(0, 3)}</span>
                    <span className="text-base font-bold leading-tight">{d.date}</span>
                  </button>
                ))}
              </div>

              <Button variant="ghost" size="sm" className="flex-shrink-0 h-10 w-10 p-0"
                onClick={() => {
                  const d = new Date(selectedDate + 'T00:00:00');
                  d.setDate(d.getDate() + 7);
                  const today = new Date();
                  today.setDate(today.getDate() + 3);
                  if (d <= today) setSelectedDate(d.toISOString().split('T')[0]);
                }}>
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>

          {/* DESKTOP: Full month calendar row */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}><ChevronLeft /></Button>
                <h3 className="text-lg font-semibold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}><ChevronRight /></Button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4">
              {calendarDates.map((d) => (
                <Button key={d.fullDate} variant={selectedDate === d.fullDate ? "default" : "ghost"}
                  onClick={() => !d.isDisabled && setSelectedDate(d.fullDate)} disabled={d.isDisabled}
                  className={`flex-col h-auto py-2 min-w-[50px] ${d.isToday ? 'ring-1 ring-primary' : ''}`}>
                  <span className="text-xs">{d.dayName}</span><span className="text-lg font-bold">{d.date}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Batch Filter Bar */}
          <div className="flex gap-2 mb-4">
            {(['All', 'Batch 1', 'Batch 2'] as const).map(batch => (
              <button
                key={batch}
                onClick={() => setSelectedBatch(batch)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation
                  ${selectedBatch === batch
                    ? 'bg-primary text-black'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                {batch}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-500 self-center hidden sm:inline">
              {filteredPlayers.length} players
            </span>
          </div>

          {/* Player List */}
          <div className="space-y-2 lg:space-y-3 max-h-[60vh] lg:max-h-[500px] overflow-y-auto text-white pb-28 lg:pb-0">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2.5 lg:py-2 mb-3 lg:mb-4 text-white text-base lg:text-sm" />
            {filteredPlayers.map(p => {
              const weeklyLimit = p.program === '4-Day' ? 4 : 2;
              const isOver = p.weeklyAttendance >= weeklyLimit;
              const isPresent = attendance[selectedDate]?.[p.id] || false;
              const isDisabled = calendarDates.find(d => d.fullDate === selectedDate)?.isDisabled;

              return (
                <div key={p.id}>
                  {/* MOBILE: Full card tap target */}
                  <div
                    className={`lg:hidden flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
                      isPresent
                        ? 'bg-primary/10 border-primary/40'
                        : 'bg-gray-800/40 border-gray-700/50'
                    }`}
                    onClick={() => !isDisabled && handleAttendanceToggle(p.id, !isPresent)}
                  >
                    <div className="w-11 h-11 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {p.avatar
                        ? <img src={p.avatar} className="w-full h-full object-cover" alt="" />
                        : <User size={20} className="text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-primary">{p.program}</span>
                        <span className="text-xs text-gray-500">·</span>
                        <span className="text-xs text-gray-400">{p.batch}</span>
                        {isOver && <span className="text-xs text-yellow-500 font-bold">⚠ Limit</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.attendedClasses} classes · {p.weeklyAttendance} this week
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isPresent ? 'bg-primary text-black' : 'bg-gray-700 text-gray-500'
                    }`}>
                      {isPresent ? <Check size={20} /> : <X size={20} />}
                    </div>
                  </div>

                  {/* DESKTOP: Original compact row with Switch */}
                  <div className="hidden lg:flex bg-gray-800/40 p-4 rounded-lg items-center justify-between gap-4 border border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        {p.avatar
                          ? <img src={p.avatar} className="w-full h-full object-cover rounded-full" alt="" />
                          : <User size={20} />}
                      </div>
                      <div>
                        <h3 className="font-semibold cursor-pointer hover:text-primary transition-colors flex items-center gap-2" onClick={() => setSelectedPlayer(p)}>
                          {p.name}
                        </h3>
                        <div className="flex gap-3 text-xs text-gray-400">
                          <span className="text-primary">{p.program}</span>
                          <span>• {p.batch || 'Batch 1'}</span>
                          <span className={isOver ? "text-yellow-500 font-bold" : ""}>• Week: {p.weeklyAttendance}</span>
                          <span>• Classes: {p.attendedClasses}</span>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={isPresent}
                      onCheckedChange={(c) => handleAttendanceToggle(p.id, c)}
                      disabled={isDisabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* MOBILE: Floating bar - always visible, never scrolls away */}
          <div className="lg:hidden fixed bottom-[72px] left-0 right-0 z-30 px-4 pb-2 pt-3 bg-gradient-to-t from-gray-950 to-transparent">
            <Button
              onClick={handleUpdateAttendance}
              className="w-full h-14 text-base font-semibold shadow-2xl"
              disabled={attendanceLoading || !unsavedDates[selectedDate]}
            >
              {unsavedDates[selectedDate] 
                ? `Save Attendance` 
                : `✓ All Saved`}
            </Button>
          </div>

          {/* Desktop: original inline button */}
          <div className="hidden lg:block mt-6">
            <Button
              onClick={handleUpdateAttendance}
              className="w-full"
              disabled={attendanceLoading || !unsavedDates[selectedDate]}
            >
              Save Attendance
            </Button>
          </div>

        </div>
      </motion.div>
    </TabsContent>
  );
};

export default AttendanceTab;
