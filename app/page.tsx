// src/App.tsx
"use client";
import React from "react";
import { Brain, Database } from "lucide-react";
import { useAnalysis } from "@/hooks/useAnalysis";
import { UploadSection } from "@/components/UploadSection";
import { ResultsSection } from "@/components/ResultsSection";

export default function App() {
  const { isConnected, isUploading, progress, analysisResult, error, uploadTrack, reset } = useAnalysis();

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
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a15] to-[#0a0a0a] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:60px_60px] opacity-100" />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto relative z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-9 h-9 text-purple-400 animate-pulse" />
            <div className="absolute inset-0 bg-purple-400/20 blur-xl rounded-full"></div>
          </div>
          <div>
            <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              MUSICLE
            </span>
            <div className="text-xs text-gray-500">AI-Powered Analysis</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div
            className={`text-sm px-4 py-2 rounded-full border ${
              isConnected ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`}></div>
              {isConnected ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {!analysisResult || analysisResult.status !== "Completed" ? (
        <UploadSection isUploading={isUploading} progress={progress} error={error} onFileSelect={handleFileSelect} />
      ) : (
        <ResultsSection result={analysisResult} onReset={reset} />
      )}

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
      `}</style>
    </main>
  );
}
