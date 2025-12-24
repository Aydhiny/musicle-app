// src/App.tsx
"use client";
import React, { useState } from "react";
import { Brain, History, TrendingUp } from "lucide-react";
import { useAnalysis } from "@/hooks/useAnalysis";
import { UploadSection } from "@/components/UploadSection";
import { ResultsSection } from "@/components/ResultsSection";
import { RecentTracksSidebar } from "@/components/RecentTracksSidebar";
import { StatsOverview } from "@/components/StatsOverview";

export default function App() {
  const { isConnected, isUploading, progress, analysisResult, error, uploadTrack, reset } = useAnalysis();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      alert("Please select an audio file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File too large. Maximum size is 50MB");
      return;
    }

    await uploadTrack(file);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a15] to-[#0a0a0a] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:60px_60px] opacity-100 pointer-events-none" />

      {/* Animated gradient orbs */}
      <div className="fixed top-20 left-20 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div
        className="fixed bottom-20 right-20 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <Brain className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-purple-400 animate-pulse" />
            <div className="absolute inset-0 bg-purple-400/20 blur-xl rounded-full"></div>
          </div>
          <div>
            <span className="font-bold text-lg sm:text-xl lg:text-2xl bg-purple-300 bg-clip-text text-transparent">MUSICLE</span>
            <div className="text-[10px] sm:text-xs text-gray-500">AI-Powered Analysis</div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Stats Toggle */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-xs sm:text-sm px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-1.5 sm:gap-2"
            aria-label="View statistics"
          >
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Stats</span>
          </button>

          {/* Recent Tracks Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-xs sm:text-sm px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all flex items-center gap-1.5 sm:gap-2"
            aria-label="View recent tracks"
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Recent</span>
          </button>

          {/* Connection Status */}
          <div
            className={`text-xs sm:text-sm px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full border ${
              isConnected ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`}></div>
              <span className="hidden sm:inline">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Stats Overview Modal */}
      {showStats && <StatsOverview onClose={() => setShowStats(false)} />}

      {/* Main Content Container */}
      <div className="relative flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-500 ${showSidebar ? "lg:mr-[420px]" : "mr-0"}`}>
          {!analysisResult || analysisResult.status !== "Completed" ? (
            <UploadSection isUploading={isUploading} progress={progress} error={error} onFileSelect={handleFileSelect} />
          ) : (
            <ResultsSection result={analysisResult} onReset={reset} />
          )}
        </div>

        {/* Recent Tracks Sidebar */}
        <RecentTracksSidebar isOpen={showSidebar} onToggle={() => setShowSidebar(!showSidebar)} />
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </main>
  );
}
