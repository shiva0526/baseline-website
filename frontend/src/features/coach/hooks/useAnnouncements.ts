import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { Announcement } from '@/types/coach';

export function useAnnouncements() {
  const { toast } = useToast();

  const [announcementText, setAnnouncementText] = useState('');
  const [announcementDuration, setAnnouncementDuration] = useState<'24hours' | '48hours' | 'manual'>('24hours');
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentAnnouncement && currentAnnouncement.expiresAt) {
        if (Date.now() > currentAnnouncement.expiresAt) {
          setCurrentAnnouncement(null);
          localStorage.removeItem('currentAnnouncement');
          window.dispatchEvent(new Event('storage'));
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentAnnouncement]);

  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const timeLeft = expiresAt - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor(timeLeft % (1000 * 60 * 60) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
  };

  const handlePublishAnnouncement = () => {
    if (!announcementText) return;
    const now = Date.now();
    let expiresAt;
    if (announcementDuration === '24hours') expiresAt = now + 86400000;
    else if (announcementDuration === '48hours') expiresAt = now + 172800000;
    const ann: Announcement = { id: now, text: announcementText, duration: announcementDuration, createdAt: now, expiresAt };
    localStorage.setItem('announcement', announcementText);
    localStorage.setItem('currentAnnouncement', JSON.stringify(ann));
    setCurrentAnnouncement(ann);
    setAnnouncementText('');
    window.dispatchEvent(new Event('storage'));
    toast({ title: "Published" });
  };

  const handleCancelAnnouncement = () => {
    setCurrentAnnouncement(null);
    localStorage.removeItem('currentAnnouncement');
    localStorage.removeItem('announcement');
    window.dispatchEvent(new Event('storage'));
    toast({ title: "Canceled" });
  };

  return {
    announcementText, setAnnouncementText,
    announcementDuration, setAnnouncementDuration,
    currentAnnouncement,
    formatTimeRemaining,
    handlePublishAnnouncement,
    handleCancelAnnouncement,
  };
}
