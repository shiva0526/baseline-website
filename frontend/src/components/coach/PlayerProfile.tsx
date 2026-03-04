import { useState, useRef } from 'react';
import { ArrowLeft, User, Phone, CheckCircle, Calendar, Star, Save, Download, Pencil, Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import axiosClient from "@/api/axiosClient";
import { updatePlayer, uploadAvatar } from "@/api/players";
import { jsPDF } from 'jspdf';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const getAvatarUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};

// Updated Interface to match Backend
interface Player {
  id: number;
  name: string;
  program: string;
  attendedClasses: number;
  weeklyAttendance: number;
  phone?: string;
  batch?: string;
  gender?: string | null;
  age?: number | null;
  avatar?: string | null;
  performance_ratings?: Record<string, number>;
}

interface PlayerProfileProps {
  player: Player;
  onBack: () => void;
  onPlayerUpdated?: (updatedPlayer: Player) => void;
}

interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
}

const METRICS = [
  "Dribbling",
  "Passing",
  "Shooting",
  "Defence",
  "Communication Skills",
  "Learning Mindset",
  "Energy on Court"
];

const PlayerProfile = ({ player, onBack, onPlayerUpdated }: PlayerProfileProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize ratings from player prop or default to empty
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    return player.performance_ratings || {};
  });
  const [isSaving, setIsSaving] = useState(false);

  // --- Edit Mode State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editGender, setEditGender] = useState(player.gender || '');
  const [editAge, setEditAge] = useState<string>(player.age != null ? String(player.age) : '');
  const [editBatch, setEditBatch] = useState(player.batch || 'Batch 1');
  const [editProgram, setEditProgram] = useState(player.program || '2-Day');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Load player stats from localStorage (Keep existing logic)
  const getPlayerStats = (): PlayerStats => {
    const stored = localStorage.getItem(`player_stats_${player.id}`);
    return stored ? JSON.parse(stored) : { totalMatches: 0, wins: 0, losses: 0 };
  };

  const [playerStats] = useState<PlayerStats>(getPlayerStats());

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // --- Avatar Upload Handler ---
  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const result = await uploadAvatar(player.id, file);
      toast({ title: "Success", description: "Avatar uploaded!" });
      if (onPlayerUpdated) {
        onPlayerUpdated({ ...player, avatar: result.avatar_url });
      }
    } catch (error) {
      console.error("Avatar upload failed", error);
      toast({ title: "Error", description: "Failed to upload avatar.", variant: "destructive" });
      setAvatarPreview(null);
    }
  };

  // --- Save Profile Handler ---
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updatedData = {
        gender: editGender || undefined,
        age: editAge ? parseInt(editAge) : undefined,
        batch: editBatch,
        program: editProgram,
      };
      const result = await updatePlayer(player.id, updatedData);
      toast({ title: "Success", description: "Profile updated!" });
      setIsEditing(false);
      if (onPlayerUpdated) {
        onPlayerUpdated(result);
      }
    } catch (error) {
      console.error("Profile update failed", error);
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Handlers for Ratings ---

  const handleStarClick = (metric: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [metric]: value
    }));
  };

  const handleSaveRatings = async () => {
    setIsSaving(true);
    try {
      // Calls the new PUT endpoint we created
      await axiosClient.put(`/players/${player.id}/performance`, { ratings });
      toast({
        title: "Success",
        description: "Performance ratings saved successfully!",
      });
    } catch (error) {
      console.error("Failed to save ratings", error);
      toast({
        title: "Error",
        description: "Failed to save ratings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to draw a 5-point star shape in the PDF
  const drawStar = (doc: jsPDF, cx: number, cy: number, size: number, filled: boolean) => {
    const outerR = size / 2;
    const innerR = outerR * 0.4;
    const points: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / 2) + (i * Math.PI / 5);
      points.push([cx + r * Math.cos(angle), cy - r * Math.sin(angle)]);
    }
    if (filled) {
      doc.setFillColor(234, 179, 8);
    } else {
      doc.setFillColor(80, 80, 80);
    }
    doc.setDrawColor(filled ? 234 : 100, filled ? 179 : 100, filled ? 8 : 100);
    // Draw polygon
    const [first, ...rest] = points;
    doc.moveTo(first[0], first[1]);
    rest.forEach(([x, y]) => doc.lineTo(x, y));
    doc.lineTo(first[0], first[1]);
    doc.fill();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // --- Header / Title ---
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFillColor(234, 179, 8);
    doc.rect(0, 45, pageWidth, 2, 'F');

    doc.setTextColor(234, 179, 8);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Player Report', pageWidth / 2, y, { align: 'center' });
    y += 12;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(player.name, pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    const infoLine = `Program: ${player.program}${player.phone ? '  |  Phone: ' + player.phone : ''}  |  Generated: ${new Date().toLocaleDateString()}`;
    doc.text(infoLine, pageWidth / 2, y, { align: 'center' });

    y = 58;

    // === ATTENDANCE SECTION (TOP) ===
    doc.setFillColor(40, 40, 40);
    doc.roundedRect(14, y, pageWidth - 28, 42, 3, 3, 'F');

    doc.setTextColor(234, 179, 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendance', 20, y + 10);

    // Monthly
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(String(player.attendedClasses), 40, y + 28);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text('Monthly Classes', 26, y + 35);

    // Weekly
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(String(player.weeklyAttendance), pageWidth / 2 + 20, y + 28);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text('Weekly Classes', pageWidth / 2 + 8, y + 35);

    y += 52;

    // === SKILL ASSESSMENT SECTION (MIDDLE) ===
    doc.setFillColor(40, 40, 40);
    const rowHeight = 14;
    const skillSectionHeight = 18 + METRICS.length * rowHeight;
    doc.roundedRect(14, y, pageWidth - 28, skillSectionHeight, 3, 3, 'F');

    doc.setTextColor(234, 179, 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Skill Assessment', 20, y + 10);

    y += 20;

    METRICS.forEach((metric) => {
      const rating = ratings[metric] || 0;

      // Metric name
      doc.setTextColor(220, 220, 220);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(metric, 22, y);

      // Rating text (e.g., "4 / 5")
      doc.setTextColor(234, 179, 8);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${rating} / 5`, pageWidth - 22, y, { align: 'right' });

      // Draw 5 star shapes
      const starSize = 6;
      const starSpacing = 8;
      const starsStartX = pageWidth - 70;
      for (let i = 0; i < 5; i++) {
        drawStar(doc, starsStartX + i * starSpacing, y - 2.5, starSize, i < rating);
      }

      y += rowHeight;
    });

    y += 10;

    // === PAYMENT LINK SECTION (BOTTOM) ===
    doc.setFillColor(40, 40, 40);
    doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, 'F');

    doc.setTextColor(234, 179, 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment', 20, y + 10);

    doc.setTextColor(100, 160, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const paymentUrl = 'https://baseline-academy.com/pay';
    doc.textWithLink('Click here to make payment: ' + paymentUrl, 20, y + 22, { url: paymentUrl });

    // Save
    const safeName = player.name.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_report.pdf`);
    toast({ title: 'Report Downloaded', description: `PDF report for ${player.name} has been saved.` });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <div className="border-b border-white/10 bg-black">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-1 sm:gap-2 text-white hover:text-baseline-yellow hover:bg-white/10 px-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Player Profile</h1>
            </div>
            <Button
              onClick={handleDownloadPDF}
              size="sm"
              className="bg-baseline-yellow text-black hover:bg-yellow-400 font-semibold flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download Report</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        {/* Player Info Section */}
        <Card className="mb-4 sm:mb-6 bg-primary/90 border-primary">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <div
                  className={`relative ${isEditing ? 'cursor-pointer group' : ''}`}
                  onClick={handleAvatarClick}
                >
                  {(avatarPreview || player.avatar) ? (
                    <img
                      src={avatarPreview || getAvatarUrl(player.avatar)!}
                      alt={player.name}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-black/30"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/30 flex items-center justify-center border-2 border-black/30">
                      <span className="text-base sm:text-xl font-semibold text-black">
                        {getInitials(player.name)}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Player Details */}
              <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-3xl font-bold text-black truncate">{player.name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    disabled={isSavingProfile}
                    className="text-black hover:bg-black/10 px-2"
                  >
                    {isEditing ? (
                      <><Save className="h-4 w-4 mr-1" /> {isSavingProfile ? 'Saving...' : 'Save'}</>
                    ) : (
                      <><Pencil className="h-4 w-4 mr-1" /> Edit</>
                    )}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                    <input
                      type="number"
                      placeholder="Age"
                      value={editAge}
                      onChange={e => setEditAge(e.target.value)}
                      className="w-16 bg-black/20 text-black placeholder-black/50 border border-black/30 rounded px-2 py-1 text-xs"
                    />
                    <select
                      value={editGender}
                      onChange={e => setEditGender(e.target.value)}
                      className="bg-black/20 text-black border border-black/30 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <select
                      value={editProgram}
                      onChange={e => setEditProgram(e.target.value)}
                      className="bg-black/20 text-black border border-black/30 rounded px-2 py-1 text-xs"
                    >
                      <option value="2-Day">2-Day Program</option>
                      <option value="4-Day">4-Day Program</option>
                    </select>
                    <select
                      value={editBatch}
                      onChange={e => setEditBatch(e.target.value)}
                      className="bg-black/20 text-black border border-black/30 rounded px-2 py-1 text-xs"
                    >
                      <option value="Batch 1">Batch 1</option>
                      <option value="Batch 2">Batch 2</option>
                    </select>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="text-black/70 hover:bg-black/10 px-2 py-1 text-xs h-auto"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-black/70 text-xs sm:text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      {player.age != null ? `${player.age} Years` : 'Age N/A'} | {player.gender || 'N/A'}
                    </span>

                    {player.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        {player.phone}
                      </span>
                    )}

                    <span className="px-2 py-0.5 bg-black/10 text-black rounded text-xs border border-black/20">
                      {player.program}
                    </span>
                    <span className="px-2 py-0.5 bg-black/10 text-black rounded text-xs border border-black/20">
                      {player.batch || 'Batch 1'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 bg-white/10 border-baseline-yellow/30">
            <TabsTrigger value="stats" className="relative text-xs sm:text-sm text-white data-[state=active]:bg-baseline-yellow data-[state=active]:text-black">
              Stats
            </TabsTrigger>
            <TabsTrigger value="performance" className="relative text-xs sm:text-sm text-white data-[state=active]:bg-baseline-yellow data-[state=active]:text-black">
              Performance
            </TabsTrigger>
            <TabsTrigger value="attendance" className="relative text-xs sm:text-sm text-white data-[state=active]:bg-baseline-yellow data-[state=active]:text-black">
              Attendance
            </TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Overall Stats</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-3 sm:p-6 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-baseline-yellow mb-1 sm:mb-2">
                      {playerStats.totalMatches}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-300">Total Matches</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-3 sm:p-6 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-green-400 mb-1 sm:mb-2">
                      {playerStats.wins}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-300">Wins</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-3 sm:p-6 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-red-400 mb-1 sm:mb-2">
                      {playerStats.losses}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-300">Losses</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Shots Details</h3>
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="text-gray-300">
                    <div className="text-base sm:text-lg mb-2">No shot statistics available yet</div>
                    <p className="text-xs sm:text-sm">Shot statistics will be displayed here once data is available.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4 sm:space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-3 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Skill Assessment</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        setRatings({});
                        try {
                          await axiosClient.put(`/players/${player.id}/performance`, { ratings: {} });
                          toast({ title: "Reset", description: "All ratings have been cleared." });
                        } catch (error) {
                          console.error("Failed to reset ratings", error);
                          toast({ title: "Error", description: "Failed to reset ratings.", variant: "destructive" });
                        }
                      }}
                      size="sm"
                      className="bg-gray-700 text-white hover:bg-gray-600 font-semibold text-xs sm:text-sm px-2 sm:px-4"
                    >
                      <RefreshCw size={14} className="mr-1 sm:mr-2" /> Reset
                    </Button>
                    <Button
                      onClick={handleSaveRatings}
                      disabled={isSaving}
                      size="sm"
                      className="bg-baseline-yellow text-black hover:bg-yellow-400 font-semibold text-xs sm:text-sm px-2 sm:px-4"
                    >
                      <Save size={14} className="mr-1 sm:mr-2" /> {isSaving ? "Saving..." : "Save Ratings"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-4">
                  {METRICS.map((metric) => (
                    <div key={metric} className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <span className="text-gray-200 font-medium text-sm sm:text-base">{metric}</span>
                      <div className="flex gap-1 sm:gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            className={`cursor-pointer transition-all hover:scale-110 sm:w-7 sm:h-7 ${(ratings[metric] || 0) >= star
                              ? "fill-baseline-yellow text-baseline-yellow"
                              : "text-gray-600"
                              }`}
                            onClick={() => handleStarClick(metric, star)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Monthly Stats */}
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400">Monthly</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {player.attendedClasses}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">Classes Attended</div>
                </CardContent>
              </Card>

              {/* Weekly Stats */}
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg">
                      <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-green-400" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400">Weekly</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {player.weeklyAttendance}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">Classes Attended</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="text-gray-300">
                  <p className="text-xs sm:text-sm">Detailed day-by-day attendance history will be available in future updates.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerProfile;