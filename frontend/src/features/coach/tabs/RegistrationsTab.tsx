import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import type { Tournament } from '@/types/coach';
import type { Registration as APIRegistration } from '@/api/registrations';

interface RegistrationsTabProps {
  allTournaments: Tournament[];
  pastTournaments: Tournament[];
  registrationsByTournament: Record<number, APIRegistration[]>;
  registrationsLoading: Record<number, boolean>;
  fetchRegistrationsForTournament: (id: number) => void;
  handleExportRegistrations: (id: number) => void;
}

const RegistrationsTab = ({
  allTournaments, pastTournaments, registrationsByTournament,
  registrationsLoading, fetchRegistrationsForTournament, handleExportRegistrations,
}: RegistrationsTabProps) => {
  return (
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
                  <Button size="sm" variant="outline" onClick={() => fetchRegistrationsForTournament(t.id)} disabled={registrationsLoading[t.id]} className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700">Refresh</Button>
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
  );
};

export default RegistrationsTab;
