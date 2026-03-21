import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, Program } from '@/types/coach';

interface PlayersTabProps {
  players: Player[];
  newPlayer: { name: string; program: Program; batch: string; phone: string };
  setNewPlayer: (p: { name: string; program: Program; batch: string; phone: string }) => void;
  handleAddPlayer: () => void;
  handleRemovePlayer: (player: Player) => void;
  setSelectedPlayer: (player: Player) => void;
}

const PlayersTab = ({
  players, newPlayer, setNewPlayer, handleAddPlayer, handleRemovePlayer, setSelectedPlayer,
}: PlayersTabProps) => {
  return (
    <TabsContent value="players" className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Add Player */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold mb-6 text-primary">Add New Player</h2>
          <div className="space-y-4">
            <input className="w-full bg-gray-800 border-gray-700 rounded p-3" placeholder="Name" value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} />
            <input className="w-full bg-gray-800 border-gray-700 rounded p-3" placeholder="Phone Number" value={newPlayer.phone} onChange={e => setNewPlayer({ ...newPlayer, phone: e.target.value })} />
            <select className="w-full bg-gray-800 border-gray-700 rounded p-3" value={newPlayer.batch} onChange={e => setNewPlayer({ ...newPlayer, batch: e.target.value })}>
              <option value="Batch 1">Batch 1</option>
              <option value="Batch 2">Batch 2</option>
            </select>
            <select className="w-full bg-gray-800 border-gray-700 rounded p-3" value={newPlayer.program} onChange={e => setNewPlayer({ ...newPlayer, program: e.target.value as Program })}>
              <option value="2-Day">2-Day Program</option><option value="4-Day">4-Day Program</option>
            </select>
            <Button onClick={handleAddPlayer} className="w-full bg-primary text-black hover:bg-primary/90"><Plus size={18} className="mr-2" /> Add Player</Button>
          </div>
        </motion.div>
        {/* Player List */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-primary">Player Management</h2>
          </div>
          <div className="space-y-3 lg:space-y-4 lg:max-h-[400px] lg:overflow-y-auto lg:pr-2">
            <AnimatePresence>
              {players.map(player => (
                <motion.div key={player.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 relative group">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold cursor-pointer hover:text-primary flex items-center gap-2" onClick={() => setSelectedPlayer(player)}>
                        {player.name}
                      </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="bg-primary/20 text-primary px-2 rounded-full text-xs">{player.program}</span>
                      <span className="bg-blue-500/20 text-blue-300 px-2 rounded-full text-xs">{player.batch}</span>
                      {player.phone && <span className="text-xs">📞 {player.phone}</span>}
                      <span>ID: {player.id}</span>
                    </div>
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
  );
};

export default PlayersTab;
