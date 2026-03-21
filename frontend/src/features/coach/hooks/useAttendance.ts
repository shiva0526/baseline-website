import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getAttendance, updateAttendance, downloadAttendanceReport } from '@/api/attendance';
import { getPlayers } from '@/api/players';
import type { Player } from '@/types/coach';

export function useAttendance(players: Player[], setPlayers: React.Dispatch<React.SetStateAction<Player[]>>) {
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<Record<string, Record<number, boolean>>>({});
  const [unsavedDates, setUnsavedDates] = useState<Record<string, boolean>>({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

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
        const limit = player.program === '4-Day' ? 4 : 2;
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
      const blob = await downloadAttendanceReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link); link.click(); link.remove();
      toast({ title: "Report Downloaded" });
    } catch { toast({ title: "Download Failed", variant: "destructive" }); }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const formatLocalYmd = (d: Date) => {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  };

  const getWeekDates = (centerDate: string) => {
    const center = new Date(centerDate + 'T00:00:00');
    const day = center.getDay();
    // Start from Monday
    const monday = new Date(center);
    monday.setDate(center.getDate() - (day === 0 ? 6 : day - 1));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatLocalYmd(today);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const fullDate = formatLocalYmd(d);
      const isFuture = d > today;
      const daysDiff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        date: d.getDate(),
        fullDate,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isDisabled: isFuture && daysDiff > 3,
        isToday: fullDate === todayStr,
      };
    });
  };

  return {
    selectedDate, setSelectedDate,
    currentMonth,
    attendance,
    unsavedDates,
    attendanceLoading,
    calendarDates,
    getWeekDates,
    handleAttendanceToggle,
    handleUpdateAttendance,
    handleDownloadReport,
    navigateMonth,
  };
}
