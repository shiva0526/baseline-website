import { Trash2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import type { Tournament } from '@/types/coach';

interface TournamentsTabProps {
  allTournaments: Tournament[];
  tournamentForm: {
    title: string; date: string; location: string; description: string;
    matchType: string; ageGroups: string[];
    registrationOpen: string; registrationClose: string;
  };
  setTournamentForm: (form: any) => void;
  handleCreateTournament: () => void;
  handleCancelTournament: (id: number) => void;
}

const TournamentsTab = ({
  allTournaments, tournamentForm, setTournamentForm,
  handleCreateTournament, handleCancelTournament,
}: TournamentsTabProps) => {
  return (
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
                  else setTournamentForm({ ...tournamentForm, ageGroups: tournamentForm.ageGroups.filter((a: string) => a !== age) });
                }} /> {age}
              </label>
            ))}
          </div>
        </div>
        <Button onClick={handleCreateTournament} className="bg-primary text-black hover:bg-primary/90"><Award size={18} className="mr-2" /> Create</Button>
      </div>
    </TabsContent>
  );
};

export default TournamentsTab;
