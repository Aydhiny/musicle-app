"use client";
import { useState, useRef } from "react";
import { Play, Pause, TrendingUp, Star, Upload, ChevronDown, Clock, Music, Award, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Interfaces ---
interface AudioTrack {
  id: string;
  songName: string;
  artistName: string;
  username: string;
  rating: number;
  coverArt: string;
  waveform: string;
  uploadDate: string;
  genre?: string;
  plays?: number;
}

interface TrendingSearch {
  songName: string;
  sponsored: boolean;
}

interface UserStats {
  score: number;
  scorePercentage: number;
  description: string;
  character: string;
}

interface OtherProfile {
  name: string;
  avatar: string;
}

export default function FeedPage() {
  const [sortBy, setSortBy] = useState<"latest" | "trending" | "top">("latest");
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const userStats: UserStats = {
    score: 23,
    scorePercentage: 23,
    description: "You mix like a bedroom producer that had too much to drink",
    character: "🔥",
  };

  const trendingSearches: TrendingSearch[] = [
    { songName: "Midnight Dreams", sponsored: true },
    { songName: "Electric Heartbeat", sponsored: true },
    { songName: "Neon Lights", sponsored: true },
  ];

  const otherProfiles: OtherProfile[] = [
    { name: "Sarah Chen", avatar: "SC" },
    { name: "Mike Rivers", avatar: "MR" },
    { name: "Alex Storm", avatar: "AS" },
  ];

  const feedTracks: AudioTrack[] = [
    {
      id: "1",
      songName: "Cosmic Voyage",
      artistName: "Stellar Beats",
      username: "Ajdin Mehmedović",
      rating: 3,
      coverArt: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=400&fit=crop",
      waveform: "complex",
      uploadDate: "6d ago",
      genre: "Electronic",
      plays: 1234,
    },
    {
      id: "2",
      songName: "Urban Sunset",
      artistName: "City Sounds",
      username: "Ajdin Mehmedović",
      rating: 4,
      coverArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
      waveform: "medium",
      uploadDate: "4d ago",
      genre: "Lo-fi Hip Hop",
      plays: 2456,
    },
    {
      id: "3",
      songName: "Digital Dreams",
      artistName: "Synth Wave",
      username: "Alex Storm",
      rating: 5,
      coverArt: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
      waveform: "dense",
      uploadDate: "2d ago",
      genre: "Synthwave",
      plays: 3789,
    },
  ];

  const myAnalysis: AudioTrack[] = [
    {
      id: "a1",
      songName: "Late Night Sessions",
      artistName: "Your Artist Name",
      username: "You",
      rating: 3,
      coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      waveform: "medium",
      uploadDate: "1d ago",
      genre: "Ambient",
    },
    {
      id: "a2",
      songName: "Morning Brew",
      artistName: "Your Artist Name",
      username: "You",
      rating: 4,
      coverArt: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
      waveform: "complex",
      uploadDate: "3d ago",
      genre: "Chillout",
    },
  ];

  const togglePlay = (trackId: string) => {
    if (activeTrack === trackId) {
      setActiveTrack(null);
    } else {
      setActiveTrack(trackId);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={cn("w-4 h-4", star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-600")} />
        ))}
      </div>
    );
  };

  const renderWaveform = (type: string) => {
    const bars = 40;
    const heights = Array.from({ length: bars }, () => {
      if (type === "complex") return Math.random() * 100;
      if (type === "medium") return 30 + Math.random() * 50;
      return 20 + Math.random() * 40;
    });

    return (
      <div className="flex items-center gap-[2px] h-12 justify-center">
        {heights.map((height, i) => (
          <div
            key={i}
            className="w-[2px] bg-gradient-to-t from-[#BCAAF9] to-white/60 rounded-full transition-all duration-200"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="relative min-h-screen text-white overflow-hidden font-sans selection:bg-[#BCAAF9] selection:text-black">
      <div className="relative pt-24 z-10">
        {/* Main Feed Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Stats & Trending */}
            <div className="lg:col-span-3 space-y-6">
              {/* Your Stats Card */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 overflow-hidden relative">
                <h2 className="text-xl font-bold mb-6">Your Stats</h2>

                <div className="relative">
                  {/* Character Illustration */}
                  <div className="w-full aspect-square bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                    <div className="text-8xl">🔥</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                  </div>

                  {/* Score Display */}
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold mb-2">
                      Your Score is <span className="text-[#BCAAF9]">{userStats.score}%</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{userStats.description}</p>
                  </div>
                </div>
              </div>

              {/* Trending Searches */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[#BCAAF9]" />
                  <h2 className="text-lg font-bold">Trending searches</h2>
                </div>

                <div className="space-y-3">
                  {trendingSearches.map((search, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                      <div className="font-medium text-sm group-hover:text-[#BCAAF9] transition-colors">{search.songName}</div>
                      {search.sponsored && <div className="text-xs text-gray-500 mt-1">Sponsored</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center - Your Analysis & Feed */}
            <div className="lg:col-span-6 space-y-6">
              {/* Your Analysis Section */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Your Analysis</h2>
                  <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <span>Latest</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {myAnalysis.map((track) => (
                    <div key={track.id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <img src={track.coverArt} alt={track.songName} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base truncate group-hover:text-[#BCAAF9] transition-colors">{track.songName}</h3>
                          <p className="text-sm text-gray-400 truncate">{track.artistName}</p>
                          {renderStars(track.rating)}
                        </div>

                        <div className="flex-1 max-w-xs hidden sm:block">{renderWaveform(track.waveform)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Another */}
                <button className="w-full mt-4 py-4 border-2 border-dashed border-gray-700 rounded-xl hover:border-[#BCAAF9] hover:bg-white/5 transition-all group flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-[#BCAAF9]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Upload another</p>
                    <p className="text-xs text-gray-500">Supported formats: MP3, WAV, OGG, AVI</p>
                  </div>
                </button>
              </div>

              {/* Your Feed Section */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Your Feed</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSortBy("latest")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        sortBy === "latest" ? "bg-[#BCAAF9] text-black" : "bg-white/5 text-gray-400 hover:text-white",
                      )}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => setSortBy("trending")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        sortBy === "trending" ? "bg-[#BCAAF9] text-black" : "bg-white/5 text-gray-400 hover:text-white",
                      )}
                    >
                      Trending
                    </button>
                  </div>
                </div>

                {/* Feed Update Banner */}
                <div className="mb-6 bg-gradient-to-r from-[#BCAAF9]/10 to-purple-500/10 border border-[#BCAAF9]/20 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#BCAAF9] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Latest Update, preview your tracks with new analysis settings.</p>
                    <button className="text-sm text-[#BCAAF9] hover:underline mt-1">Learn more →</button>
                  </div>
                </div>

                {/* Feed Items */}
                <div className="space-y-6">
                  {feedTracks.map((track) => (
                    <div key={track.id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                      {/* User Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BCAAF9] to-purple-500 flex items-center justify-center font-bold text-sm">
                          {track.username.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{track.username}</div>
                          <div className="text-xs text-gray-500">@{track.username.toLowerCase().replace(/\s/g, "")}</div>
                        </div>
                        <div className="text-xs text-gray-500">{track.uploadDate}</div>
                      </div>

                      {/* Track Card */}
                      <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all group">
                        <div className="p-4 flex items-center gap-4">
                          {/* Album Art */}
                          <div className="relative flex-shrink-0">
                            <img src={track.coverArt} alt={track.songName} className="w-28 h-28 rounded-lg object-cover" />
                            <button
                              onClick={() => togglePlay(track.id)}
                              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                                {activeTrack === track.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                              </div>
                            </button>
                          </div>

                          {/* Track Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate group-hover:text-[#BCAAF9] transition-colors">{track.songName}</h3>
                            <p className="text-sm text-gray-400 truncate mb-2">{track.artistName}</p>
                            {renderStars(track.rating)}

                            {track.genre && (
                              <div className="mt-2">
                                <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-300">{track.genre}</span>
                              </div>
                            )}
                          </div>

                          {/* Waveform */}
                          <div className="flex-1 max-w-sm hidden lg:block">{renderWaveform(track.waveform)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Upload & Other Profiles */}
            <div className="lg:col-span-3 space-y-6">
              {/* Quick Upload Card */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Quick Upload</h2>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 hover:border-[#BCAAF9] transition-all cursor-pointer group text-center">
                  <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-[#BCAAF9]" />
                  </div>
                  <p className="text-sm font-medium mb-1">Upload another</p>
                  <p className="text-xs text-gray-500">MP3, WAV, OGG, AVI</p>
                </div>
              </div>

              {/* Other Profiles */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Other Profiles</h2>
                <div className="space-y-3">
                  {otherProfiles.map((profile, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BCAAF9] to-purple-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {profile.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate group-hover:text-[#BCAAF9] transition-colors">{profile.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Overview */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Your Overview</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Music className="w-4 h-4" />
                      <span>Tracks Analyzed</span>
                    </div>
                    <div className="font-bold">12</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Award className="w-4 h-4" />
                      <span>Avg. Score</span>
                    </div>
                    <div className="font-bold text-[#BCAAF9]">67%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Total Time</span>
                    </div>
                    <div className="font-bold">4.2h</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
