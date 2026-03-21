import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getPlayers, addPlayer, removePlayer } from '@/api/players';
import type { Player, Program } from '@/types/coach';

export function usePlayers() {
  const { toast } = useToast();

  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    program: '2-Day' as Program,
    batch: 'Batch 1',
    phone: ''
  });
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<'All' | 'Batch 1' | 'Batch 2'>('All');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(new Set());
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  useEffect(() => {
    getPlayers().then(setPlayers).catch(err => console.error(err));
  }, []);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.phone && player.phone.includes(searchQuery));
    
    const matchesBatch = 
      selectedBatch === 'All' || player.batch === selectedBatch;
    
    return matchesSearch && matchesBatch;
  });

  const isNotified = (player: Player) => {
    const joinDate = player.joining_date ? new Date(player.joining_date) : (player.created_at ? new Date(player.created_at) : null);
    if (!joinDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let cycleStart = new Date(joinDate);
    cycleStart.setHours(0, 0, 0, 0);

    let cycleEnd = new Date(cycleStart);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    while (cycleEnd <= today) {
      cycleStart = new Date(cycleEnd);
      cycleEnd = new Date(cycleStart);
      cycleEnd.setMonth(cycleEnd.getMonth() + 1);
    }

    const threeDaysBefore = new Date(cycleEnd);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

    return today >= threeDaysBefore && today < cycleEnd;
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name) return;
    try {
      const saved = await addPlayer(newPlayer);
      setPlayers([...players, saved]);
      setNewPlayer({ name: "", program: "2-Day", batch: "Batch 1", phone: "" });
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

  return {
    players, setPlayers,
    newPlayer, setNewPlayer,
    showRemoveConfirm, setShowRemoveConfirm,
    playerToRemove,
    selectedPlayer, setSelectedPlayer,
    searchQuery, setSearchQuery,
    selectedBatch, setSelectedBatch,
    selectedPlayerIds, setSelectedPlayerIds,
    showWhatsAppDialog, setShowWhatsAppDialog,
    filteredPlayers,
    isNotified,
    handleAddPlayer,
    handleRemovePlayer,
    confirmRemovePlayer,
  };
}
