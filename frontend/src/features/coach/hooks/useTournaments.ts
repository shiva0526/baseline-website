import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getTournaments as apiGetTournaments, createTournament as apiCreateTournament, deleteTournament as apiDeleteTournament } from '@/api/tournaments';
import type { Tournament } from '@/types/coach';

const normalizeTournament = (t: any): Tournament => ({
  id: t.id, title: t.title, date: t.date, location: t.location,
  description: t.description ?? "", matchType: t.match_type ?? "3v3",
  ageGroups: t.age_groups ?? [], registrationOpen: t.registration_open ?? "",
  registrationClose: t.registration_close ?? "", status: t.status ?? "upcoming"
});

export function useTournaments() {
  const { toast } = useToast();

  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [tournamentToCancel, setTournamentToCancel] = useState<number | null>(null);
  const [tournamentForm, setTournamentForm] = useState({
    title: '', date: '', location: '', description: '',
    matchType: '3v3', ageGroups: [] as string[],
    registrationOpen: '', registrationClose: ''
  });

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

  return {
    allTournaments,
    pastTournaments,
    showConfirmCancel, setShowConfirmCancel,
    tournamentToCancel,
    tournamentForm, setTournamentForm,
    handleCreateTournament,
    handleCancelTournament,
    confirmCancelTournament,
  };
}
