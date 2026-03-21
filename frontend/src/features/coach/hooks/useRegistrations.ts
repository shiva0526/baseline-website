import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getRegistrations as apiGetRegistrations, Registration as APIRegistration } from '@/api/registrations';

const escapeCSV = (value: any) => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export function useRegistrations() {
  const { toast } = useToast();

  const inFlightRegistrationsRef = useRef<Record<number, Promise<APIRegistration[]> | undefined>>({});
  const [registrationsByTournament, setRegistrationsByTournament] = useState<Record<number, APIRegistration[]>>({});
  const [registrationsLoading, setRegistrationsLoading] = useState<Record<number, boolean>>({});

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

  return {
    registrationsByTournament,
    registrationsLoading,
    fetchRegistrationsForTournament,
    handleExportRegistrations,
  };
}
