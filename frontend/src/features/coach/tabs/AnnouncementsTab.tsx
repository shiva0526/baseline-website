import { Bell, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import type { Announcement } from '@/types/coach';

interface AnnouncementsTabProps {
  announcementText: string;
  setAnnouncementText: (text: string) => void;
  announcementDuration: '24hours' | '48hours' | 'manual';
  setAnnouncementDuration: (d: '24hours' | '48hours' | 'manual') => void;
  currentAnnouncement: Announcement | null;
  formatTimeRemaining: (expiresAt: number) => string;
  handlePublishAnnouncement: () => void;
  handleCancelAnnouncement: () => void;
}

const AnnouncementsTab = ({
  announcementText, setAnnouncementText, announcementDuration, setAnnouncementDuration,
  currentAnnouncement, formatTimeRemaining, handlePublishAnnouncement, handleCancelAnnouncement,
}: AnnouncementsTabProps) => {
  return (
    <TabsContent value="announcements" className="space-y-8">
      <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800 shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-primary">Manage Announcements</h2>
        {currentAnnouncement && (
          <div className="p-4 border border-green-800 bg-green-900/20 rounded mb-6 flex justify-between items-center">
            <div>
              <div className="text-green-400 flex items-center gap-2 mb-1"><CheckCircle size={16} /> Active Announcement</div>
              <div className="text-gray-300 text-lg">{currentAnnouncement.text}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={12} /> {currentAnnouncement.expiresAt ? formatTimeRemaining(currentAnnouncement.expiresAt) : 'Manual'}</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCancelAnnouncement} className="bg-red-900/20 text-red-400 border-red-900 hover:bg-red-900/30">Cancel</Button>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm text-gray-400">Message</label>
            <textarea className="w-full bg-gray-800 border-gray-700 rounded p-3 h-32 text-white" placeholder="Enter announcement..." value={announcementText} onChange={e => setAnnouncementText(e.target.value)} />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-400">Duration</label>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {['24hours', '48hours', 'manual'].map(d => (
                <label key={d} className="flex items-center gap-2 cursor-pointer bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-primary transition-colors">
                  <input type="radio" name="duration" checked={announcementDuration === d} onChange={() => setAnnouncementDuration(d as any)} className="text-primary focus:ring-primary" />
                  <span className="text-sm">{d === 'manual' ? 'Until Canceled' : d.replace('hours', ' Hours')}</span>
                </label>
              ))}
            </div>
          </div>
          <Button onClick={handlePublishAnnouncement} className="bg-primary text-black hover:bg-primary/90"><Bell size={18} className="mr-2" /> Publish Announcement</Button>
        </div>
      </div>
    </TabsContent>
  );
};

export default AnnouncementsTab;
