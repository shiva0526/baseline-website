import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Player } from '@/types/coach';

interface RemovePlayerDialogProps {
  show: boolean;
  player: Player | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const RemovePlayerDialog = ({ show, player, onConfirm, onCancel }: RemovePlayerDialogProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-gray-900 p-6 rounded-t-2xl sm:rounded-xl border border-gray-700 w-full sm:max-w-md text-center max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom,16px)] sm:pb-6">
        <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-4 sm:hidden" />
        <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="text-red-500" /></div>
        <h3 className="text-xl font-bold mb-2">Remove Player?</h3>
        <p className="text-gray-300 mb-6">Are you sure you want to remove <span className="text-primary">{player?.name}</span>? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm}>Remove</Button>
        </div>
      </div>
    </div>
  );
};

export default RemovePlayerDialog;
