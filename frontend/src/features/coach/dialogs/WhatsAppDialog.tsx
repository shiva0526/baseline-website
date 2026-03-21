import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import type { Player } from '@/types/coach';

interface WhatsAppDialogProps {
  show: boolean;
  players: Player[];
  selectedPlayerIds: Set<number>;
  isNotified: (player: Player) => boolean;
  onClose: () => void;
}

const WhatsAppDialog = ({ show, players, selectedPlayerIds, isNotified, onClose }: WhatsAppDialogProps) => {
  const { toast } = useToast();

  if (!show) return null;

  const handleSend = () => {
    Array.from(selectedPlayerIds).forEach(id => {
      const p = players.find(player => player.id === id);
      if (p && p.phone) {
        const message = encodeURIComponent(
          `Hello ${p.name},\n\nHere is your attendance report for this cycle:\n- Attended: ${p.attendedClasses} classes\n- Weekly Avg: ${p.weeklyAttendance}\n- Status: ${p.attendedClasses > 0 ? "Active" : "Inactive"}\n\nKeep up the great work!\n- Baseline Elite Academy`
        );
        window.open(`https://wa.me/${p.phone.replace(/\D/g, "")}?text=${message}`, '_blank');
      }
    });
    onClose();
    toast({ title: "Redirecting to WhatsApp", description: `Opened chats for ${selectedPlayerIds.size} players.` });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 rounded-t-2xl sm:rounded-xl border border-gray-700 w-full sm:max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom,16px)] sm:pb-0">
        <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mt-3 mb-0 sm:hidden" />
        <div className="bg-primary/90 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12.01 2.01c-5.52 0-10 4.48-10 10 0 1.77.46 3.43 1.26 4.88L2 22l5.24-1.37c1.4.76 3 1.18 4.77 1.18 5.52 0 10-4.48 10-10a10 10 0 00-10-9.99zm0 18.33c-1.57 0-3.03-.41-4.31-1.12l-.31-.17-3.19.83.85-3.11-.19-.31a8.3 8.3 0 01-1.28-4.45c0-4.6 3.74-8.33 8.34-8.33s8.33 3.73 8.33 8.33c0 4.6-3.74 8.33-8.34 8.33h.1zm4.56-6.2a2.3 2.3 0 00-1.61-.83c-.1-.01-.2-.01-.29 0-.25.02-.5.12-.76.32-.26.2-.53.51-.77.83-.24.32-.4.5-.47.58-.08.08-.16.11-.29.04a5.19 5.19 0 01-1.92-1.18c-.4-.36-.73-.79-.98-1.28-.08-.15-.05-.28.02-.38.07-.1.15-.22.22-.32.07-.1.1-.17.14-.29.04-.12.02-.23-.01-.32-.03-.09-.27-.64-.37-.88-.1-.23-.2-.2-.29-.2h-.25c-.14 0-.31.02-.48.16-.17.14-.64.63-.64 1.54s.66 1.79.76 1.91c.1.13 1.28 1.96 3.11 2.75 1.83.78 1.83.52 2.16.49.33-.03 1.05-.43 1.2-.84.15-.41.15-.76.1-.84-.04-.08-.16-.13-.3-.21z" /></svg>
            Send WhatsApp Report
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></Button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-300 text-sm mb-4">
              Sending report summary to {selectedPlayerIds.size} player(s). Each player will receive an individual message.
            </p>
            <div className="max-h-48 overflow-y-auto bg-black/30 rounded-lg p-3 space-y-2 border border-gray-800">
              {Array.from(selectedPlayerIds).map(id => {
                const p = players.find(player => player.id === id);
                return p ? (
                  <div key={id} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{p.name} {isNotified(p) && <span className="text-yellow-500">(!)</span>}</span>
                    <span className="text-gray-500">{p.phone || 'No phone'}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Example Message Preview</h4>
              <div className="bg-white/5 p-3 rounded text-sm text-gray-300 italic whitespace-pre-wrap">
                {"Hello [NAME],\n\nHere is your attendance report for this cycle:\n- Attended: [X] classes\n- Weekly Avg: [Y]\n- Status: [ACTIVE/INACTIVE]\n\nKeep up the great work!\n- Baseline Elite Academy"}
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700" onClick={onClose}>Cancel</Button>
              <Button 
                className="flex-1 bg-[#25D366] text-white hover:bg-[#128C7E]"
                onClick={handleSend}
              >
                Send to {selectedPlayerIds.size} Players
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WhatsAppDialog;
