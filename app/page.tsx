"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, Loader2, X, History, TrendingUp, Play, Pause, BarChart3, Award, Mic2, Sparkles, Info } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Spotlight } from "@/components/ui/spotlight-new";
import { Cover } from "@/components/ui/cover";
import { FeaturesSectionDemo } from "@/components/FeaturesSectionDemo";
import { Meteors } from "@/components/ui/meteors";

// --- Interfaces ---
interface AudioCharacteristics {
  tempo: number;
  key: string;
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  loudness: number;
}

interface Analysis {
  genre: string;
  subgenre: string;
  confidence: number;
  commercialScore: number;
  productionScore: number;
  viralPotential: number;
  characteristics: AudioCharacteristics;
  strengths?: string[];
  improvements?: string[];
}

interface AnalysisResult {
  trackId: string;
  fileName: string;
  status: string;
  uploadedAt: string;
  audioUrl?: string;
  analysis?: Analysis;
}

interface RecentTrack {
  trackId: string;
  fileName: string;
  status: string;
  uploadedAt: string;
  genre?: string;
  subgenre?: string;
  confidence?: number;
}

interface StatsData {
  totalTracks: number;
  completedTracks: number;
  averageConfidence: number;
  topGenres: { genre: string; count: number }[];
  averageScores: {
    commercial: number;
    production: number;
    viral: number;
  };
}

export default function HomePage() {
  // --- State Management ---
  const [step, setStep] = useState<"upload" | "results">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [askInput, setAskInput] = useState("");

  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const API_URL =
    typeof window !== "undefined" ? process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api" : "https://localhost:5001/api";

  // --- Effects & Logic ---
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        setIsConnected(response.ok);
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [API_URL]);

  const fetchRecentTracks = async () => {
    setLoadingTracks(true);
    try {
      const response = await fetch(`${API_URL}/analysis/recent?count=20`);
      if (response.ok) {
        const data = await response.json();
        setRecentTracks(data.tracks || []);
      }
    } catch (error) {
      console.error("Failed to fetch recent tracks:", error);
    } finally {
      setLoadingTracks(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(`${API_URL}/analysis/recent?count=50`);
      if (response.ok) {
        const data = await response.json();
        const tracks = data.tracks || [];
        const completed = tracks.filter((t: any) => t.status === "Completed");

        const genreMap = new Map<string, number>();
        completed.forEach((track: any) => {
          if (track.genre) {
            genreMap.set(track.genre, (genreMap.get(track.genre) || 0) + 1);
          }
        });

        const topGenres = Array.from(genreMap.entries())
          .map(([genre, count]) => ({ genre, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const avgConfidence =
          completed.length > 0 ? completed.reduce((sum: number, t: any) => sum + (t.confidence || 0), 0) / completed.length : 0;

        setStats({
          totalTracks: tracks.length,
          completedTracks: completed.length,
          averageConfidence: Math.round(avgConfidence),
          topGenres,
          averageScores: {
            commercial: 7.5,
            production: 8.2,
            viral: 6.8,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (showSidebar) {
      fetchRecentTracks();
      const interval = setInterval(fetchRecentTracks, 10000);
      return () => clearInterval(interval);
    }
  }, [showSidebar]);

  useEffect(() => {
    if (showStats) fetchStats();
  }, [showStats]);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      setError("Please select an audio file");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File too large. Maximum size is 50MB");
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const trackId = response.trackId;
          const pollInterval = setInterval(async () => {
            try {
              const statusResponse = await fetch(`${API_URL}/analysis/${trackId}`);
              if (statusResponse.ok) {
                const result = await statusResponse.json();
                if (result.status === "Completed") {
                  clearInterval(pollInterval);
                  setAnalysisResult(result);
                  setIsUploading(false);
                  setStep("results");
                } else if (result.status === "Failed") {
                  clearInterval(pollInterval);
                  setError("Analysis failed. Please try again.");
                  setIsUploading(false);
                }
              }
            } catch (err) {
              console.error("Polling error:", err);
            }
          }, 2000);
        } else {
          setError("Upload failed. Please try again.");
          setIsUploading(false);
        }
      });

      xhr.addEventListener("error", () => {
        setError("Upload failed. Please try again.");
        setIsUploading(false);
      });

      xhr.open("POST", `${API_URL}/analysis/upload`);
      xhr.send(formData);
    } catch (err) {
      setError("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setAnalysisResult(null);
    setProgress(0);
    setError(null);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Queued":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const overallScore = analysisResult?.analysis
    ? (
        (analysisResult.analysis.commercialScore + analysisResult.analysis.productionScore + analysisResult.analysis.viralPotential) /
        3
      ).toFixed(1)
    : "0.0";

  return (
    <>
      {/* --- Main Content --- */}
      {step === "upload" ? (
        <div className="relative z-10 flex flex-col items-center justify-center pt-8 sm:pt-12 lg:pt-16 pb-24 sm:pb-32 px-4 sm:px-6 min-h-[calc(100vh-120px)] md:min-h-[85vh]">
          {/* Hero Typography */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 relative w-full max-w-4xl mx-auto">
            {/* Rotating Badge with Icons */}
            <div className="mb-6 sm:mb-8 inline-flex">
              <div className="relative px-4 sm:px-6 py-2.5 rounded-full border border-amber-400/10 bg-gradient-to-t from-white to-purple-300 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 group cursor-default">
                <div className="flex items-center gap-2">
                  <Spotlight />
                  <span className="text-xs sm:text-sm font-medium text-black">Advanced Music Analysis</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 justify-center text-center items-center">
              <h1 className="text-3xl justify-center text-center items-center sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                <span className="inline-block bg-gradient-to-b from-[#d9cbff] via-[#d9cbff] to-[#9f92ca] bg-clip-text text-transparent">
                  Upload Your Track
                </span>
                <br />
                <div className="flex items-center justify-center mx-auto w-fit">
                  <Cover>
                    <span className="inline-block bg-gradient-to-b text-center items-center justify-center from-[#300134] via-[#d8d8d8] to-[#ffffff] bg-clip-text text-transparent">
                      Improve Your Mix Today
                    </span>
                  </Cover>
                </div>
              </h1>

              <div className="space-y-3">
                <h2 className="text-base sm:text-lg md:text-xl font-medium text-gray-300">
                  Analyze, improve, and polish your music with AI-powered insights
                </h2>
                <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
                  Get instant feedback on audio characteristics, commercial potential, production quality, and actionable recommendations to
                  elevate your sound.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Container */}
          <div className="relative w-full max-w-2xl lg:max-w-4xl mx-auto px-0">
            <GlowingEffect
              className="rounded-xl"
              blur={0}
              borderWidth={1}
              spread={150}
              glow={true}
              disabled={false}
              proximity={1000}
              inactiveZone={0.01}
            />
            {/* Upload Area */}
            <div
              className="relative bg-[#111111] border-2 border-dashed border-gray-700/50 rounded-lg sm:rounded-xl lg:rounded-2xl h-56 sm:h-64 md:h-72 lg:h-80 w-full flex flex-col items-center justify-center cursor-pointer hover:border-[#BCAAF9]/50 hover:bg-[#161616] transition-all group overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelect(file);
              }}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload audio file"
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                aria-label="File input"
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-sm px-4 sm:px-8">
                  <div className="relative">
                    <Loader2 className="w-10 sm:w-12 h-10 sm:h-12 text-[#BCAAF9] animate-spin" />
                  </div>
                  <div className="w-full space-y-2 sm:space-y-3 text-center">
                    <p className="text-base sm:text-lg font-medium">Analyzing Track</p>
                    <div className="h-1 sm:h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#BCAAF9] transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 font-mono">{Math.round(progress)}%</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border border-gray-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="w-4 sm:w-5 h-4 sm:h-5 text-[#BCAAF9]" />
                  </div>
                  <div className="text-center space-y-1 sm:space-y-2 px-4">
                    <p className="text-sm sm:text-base md:text-lg text-gray-200 font-medium">
                      Drag and Drop file here or <span className="text-[#BCAAF9] font-semibold">Choose file</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Supported formats: MP3, WAV, OGG, AVI</p>
                  </div>
                </>
              )}

              {/* Error Toast */}
              {error && (
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 bg-red-500/10 border border-red-500/20 text-red-400 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // --- Results View ---
        <div className="relative z-20 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-24 sm:pb-32 pt-6 sm:pt-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              aria-label="Back to upload"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4" />
              </div>
              <span>Back to Upload</span>
            </button>
            <div className="text-left sm:text-right">
              <h2 className="text-lg sm:text-xl font-bold truncate">{analysisResult?.fileName}</h2>
              <span className="text-xs text-gray-500">Analysis Completed</span>
            </div>
          </div>

          {analysisResult?.analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Main Column */}
              <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                {/* Audio Player Card */}
                <div className="bg-[#111] border border-white/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#BCAAF9]/5 to-transparent pointer-events-none" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
                    <button
                      onClick={togglePlayPause}
                      className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-white text-black flex-shrink-0 flex items-center justify-center hover:scale-105 transition-transform"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="w-5 sm:w-6 h-5 sm:h-6" /> : <Play className="w-5 sm:w-6 h-5 sm:h-6 ml-1" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg truncate">{analysisResult.fileName}</h3>
                      <div className="text-xs sm:text-sm text-[#BCAAF9]">
                        {analysisResult.analysis.genre} • {analysisResult.analysis.subgenre}
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold flex-shrink-0">{analysisResult.analysis.confidence}%</div>
                  </div>
                  <audio ref={audioRef} src={analysisResult.audioUrl} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#111] border border-white/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm font-medium">
                      <BarChart3 className="w-4 h-4 flex-shrink-0" /> AUDIO CHARACTERISTICS
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {Object.entries(analysisResult.analysis.characteristics)
                        .slice(0, 4)
                        .map(([k, v]) => (
                          <div key={k}>
                            <div className="flex justify-between text-xs mb-1 uppercase tracking-wider text-gray-500">
                              <span>{k}</span>
                              <span>{typeof v === "number" ? v.toFixed(1) : v}</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#BCAAF9] to-[#9f85f6]"
                                style={{ width: `${Math.min((v as number) * 10, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-[#111] border border-white/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm font-medium">
                      <Sparkles className="w-4 h-4 flex-shrink-0" /> STRENGTHS
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {analysisResult.analysis.strengths?.map((s, i) => (
                        <div
                          key={i}
                          className="text-xs sm:text-sm bg-green-500/10 text-green-400 px-3 py-2 rounded border border-green-500/20"
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Column (Scores) */}
              <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                <div className="bg-gradient-to-b from-[#BCAAF9] to-[#9f85f6] text-black p-6 sm:p-8 rounded-xl sm:rounded-2xl text-center">
                  <div className="text-xs sm:text-sm font-bold opacity-60 uppercase mb-2">Overall Score</div>
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter">{overallScore}</div>
                  <div className="text-xs sm:text-sm font-medium mt-2 opacity-70">OUT OF 10</div>
                </div>

                <div className="bg-[#111] border border-white/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4 sm:space-y-6">
                  {[
                    { label: "Commercial", score: analysisResult.analysis.commercialScore, icon: Award },
                    { label: "Production", score: analysisResult.analysis.productionScore, icon: Mic2 },
                    { label: "Viral Potential", score: analysisResult.analysis.viralPotential, icon: TrendingUp },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm text-gray-400">{item.label}</div>
                        <div className="text-lg sm:text-xl font-bold">{item.score}/10</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Stats Modal --- */}
      {showStats && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121212] w-full max-w-2xl lg:max-w-4xl rounded-lg sm:rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowStats(false)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10"
              aria-label="Close stats"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-4 sm:p-6 lg:p-8 border-b border-white/10 bg-gradient-to-r from-[#1a1a1a] to-transparent">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 text-[#BCAAF9] flex-shrink-0" /> Analytics Dashboard
              </h2>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1">
              {loadingStats ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#BCAAF9]" />
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white/5 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/5">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalTracks}</div>
                    <div className="text-xs text-gray-500 uppercase font-medium">Total Tracks</div>
                  </div>
                  <div className="bg-white/5 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/5">
                    <div className="text-2xl sm:text-3xl font-bold text-[#BCAAF9] mb-1">{stats.completedTracks}</div>
                    <div className="text-xs text-gray-500 uppercase font-medium">Completed</div>
                  </div>
                  <div className="bg-white/5 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/5">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.averageConfidence}%</div>
                    <div className="text-xs text-gray-500 uppercase font-medium">Avg. Confidence</div>
                  </div>
                  <div className="bg-white/5 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/5">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {stats.totalTracks > 0 ? ((stats.completedTracks / stats.totalTracks) * 100).toFixed(0) : 0}%
                    </div>
                    <div className="text-xs text-gray-500 uppercase font-medium">Success Rate</div>
                  </div>

                  {stats.topGenres.length > 0 && (
                    <div className="col-span-full mt-4 sm:mt-6">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-400 mb-3 sm:mb-4 uppercase">Top Genres</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {stats.topGenres.map((g, i) => (
                          <div key={i} className="flex items-center gap-3 sm:gap-4">
                            <div className="w-14 sm:w-16 text-xs sm:text-sm text-gray-400 truncate">{g.genre}</div>
                            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#BCAAF9] to-[#9f85f6]"
                                style={{ width: `${(g.count / stats.completedTracks) * 100}%` }}
                              />
                            </div>
                            <div className="text-xs sm:text-sm font-bold w-6 text-right">{g.count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8 text-sm">No stats available yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Recent Sidebar --- */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 max-w-[calc(100vw-20px)] bg-[#111] border-l border-white/10 z-500000 transform transition-transform duration-300 shadow-2xl overflow-hidden`}
        style={{ transform: showSidebar ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-[#BCAAF9] flex-shrink-0" /> Recent Tracks
          </h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 sm:p-4 overflow-y-auto h-[calc(100%-80px)] space-y-2 sm:space-y-3">
          {loadingTracks ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : recentTracks.length === 0 ? (
            <div className="text-center text-gray-500 py-12 text-sm">No recent tracks found.</div>
          ) : (
            recentTracks.map((track) => (
              <div
                key={track.trackId}
                className="bg-white/5 border border-white/5 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2 gap-2 min-w-0">
                  <div className="font-medium text-xs sm:text-sm truncate flex-1 group-hover:text-[#BCAAF9] transition-colors">
                    {track.fileName}
                  </div>
                  <span className="text-[10px] text-gray-500 flex-shrink-0 whitespace-nowrap">{formatTimeAgo(track.uploadedAt)}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(track.status)}`}>{track.status}</span>
                  {track.genre && <span className="text-[10px] text-gray-400 truncate">{track.genre}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-[#171717] w-fit mx-auto shadow-2xl p-12 border-t border-neutral-700">
        <h1
          className="text-3xl justify-center text-center items-center sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent 
      bg-gradient-to-b from-neutral-100 via-neutral-300 to-neutral-600"
        >
          Features
        </h1>
        <p className="mt-6 text-center text-sm md:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Musicle listens deeper than humans. Analyze balance, clarity, dynamics, and mix decisions using AI trained on real-world music
          standards. No guessing. Just precision.
        </p>
        <FeaturesSectionDemo />
      </div>

      {/* Waitlist Section */}
      <div className="m-24">
        <div className="relative h-[40rem] border-t border-neutral-700 shadow-2xl w-full overflow-hidden rounded-sm bg-[#171717] flex items-center justify-center">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_50%)]" />

          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <h1
              className="text-4xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent 
      bg-gradient-to-b from-neutral-100 via-neutral-300 to-neutral-600"
            >
              Join the Waitlist
            </h1>

            <p className="mt-4 text-lg md:text-xl text-neutral-400">AI-powered music mix & analysis</p>

            <p className="mt-6 text-sm md:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Musicle listens deeper than humans. Analyze balance, clarity, dynamics, and mix decisions using AI trained on real-world music
              standards. No guessing. Just precision.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                placeholder="you@studio.com"
                className="w-full sm:w-80 rounded-lg border border-neutral-800 bg-neutral-900/70 
        px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-600
        focus:outline-none focus:ring-2 focus:ring-neutral-500/60"
              />

              <button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors">
                Join the waitlist
              </button>
            </div>

            <p className="mt-4 text-xs text-neutral-600">Early access. No spam. Just signal.</p>
          </div>
        </div>
      </div>
    </>
  );
}
