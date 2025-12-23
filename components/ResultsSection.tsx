// src/components/ResultsSection.tsx
import React from "react";
import { X, Brain, BarChart3, Activity, Target, Sparkles, Award, Mic2, TrendingUp } from "lucide-react";
import { AnalysisResponse } from "@/types/analysis.types";

interface ResultsSectionProps {
  result: AnalysisResponse;
  onReset: () => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ result, onReset }) => {
  if (!result.analysis) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No analysis data available</p>
      </div>
    );
  }

  const { analysis } = result;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "from-emerald-900/40 to-green-900/40 border-emerald-500/40 text-emerald-400";
    if (score >= 6) return "from-amber-900/40 to-yellow-900/40 border-amber-500/40 text-amber-400";
    return "from-rose-900/40 to-red-900/40 border-rose-500/40 text-rose-400";
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Analysis Complete
          </h2>
          <p className="text-gray-500">Comprehensive insights powered by machine learning</p>
        </div>
        <button
          onClick={onReset}
          className="text-gray-400 hover:text-white flex items-center gap-2 bg-white/5 px-5 py-3 rounded-xl hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm group"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          New Analysis
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Genre Classification */}
          <div className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Brain className="w-12 h-12 text-purple-400" />
                  <div className="absolute inset-0 bg-purple-400/30 blur-xl rounded-full"></div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Genre Classification</div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {analysis.genre}
                  </div>
                  <div className="text-lg text-purple-300 mt-1">{analysis.subgenre}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">Confidence</div>
                <div className="text-3xl font-bold text-white">{analysis.confidence}%</div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${analysis.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Audio Characteristics */}
          <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="font-bold mb-6 text-sm text-gray-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              AUDIO CHARACTERISTICS
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Tempo", value: analysis.characteristics.tempo.toFixed(0), unit: "BPM", color: "purple" },
                { label: "Energy", value: (analysis.characteristics.energy * 100).toFixed(0), unit: "%", color: "pink" },
                { label: "Danceability", value: (analysis.characteristics.danceability * 100).toFixed(0), unit: "%", color: "blue" },
                { label: "Valence", value: (analysis.characteristics.valence * 100).toFixed(0), unit: "%", color: "emerald" },
                { label: "Acousticness", value: (analysis.characteristics.acousticness * 100).toFixed(0), unit: "%", color: "amber" },
                { label: "Loudness", value: analysis.characteristics.loudness.toFixed(0), unit: "dB", color: "rose" },
                { label: "Speechiness", value: (analysis.characteristics.speechiness * 100).toFixed(0), unit: "%", color: "cyan" },
                { label: "Instrumental", value: (analysis.characteristics.instrumentalness * 100).toFixed(0), unit: "%", color: "violet" },
                { label: "Spectral", value: analysis.characteristics.spectralCentroid.toFixed(0), unit: "Hz", color: "fuchsia" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-white/5 to-transparent rounded-xl p-5 border border-white/5 hover:border-white/20 transition-all group"
                >
                  <div className="text-xs text-gray-500 mb-2">{item.label}</div>
                  <div className={`text-3xl font-bold text-${item.color}-400 group-hover:scale-110 transition-transform`}>{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="font-bold mb-5 text-sm text-gray-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                STRENGTHS
              </h3>
              <div className="space-y-3">
                {analysis.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-4 text-sm text-emerald-100 leading-relaxed hover:border-emerald-500/50 transition-all"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {analysis.improvements && analysis.improvements.length > 0 && (
            <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="font-bold mb-5 text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                SUGGESTED IMPROVEMENTS
              </h3>
              <div className="space-y-3">
                {analysis.improvements.map((imp, i) => (
                  <div
                    key={i}
                    className="border-l-2 border-purple-500 pl-4 py-3 text-sm text-gray-300 leading-relaxed bg-white/5 rounded-r-lg hover:bg-white/10 transition-all"
                  >
                    {imp}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Scores */}
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-1 gap-4">
            <div
              className={`bg-gradient-to-br ${getScoreColor(
                analysis.commercialScore
              )} p-6 rounded-2xl border backdrop-blur-sm hover:scale-105 transition-all`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5" />
                <div className="text-xs font-semibold">Commercial Potential</div>
              </div>
              <div className="text-5xl font-bold mb-1">{analysis.commercialScore}/10</div>
              <div className="text-xs opacity-80">Mainstream Appeal</div>
            </div>

            <div
              className={`bg-gradient-to-br ${getScoreColor(
                analysis.productionScore
              )} p-6 rounded-2xl border backdrop-blur-sm hover:scale-105 transition-all`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Mic2 className="w-5 h-5" />
                <div className="text-xs font-semibold">Production Quality</div>
              </div>
              <div className="text-5xl font-bold mb-1">{analysis.productionScore}/10</div>
              <div className="text-xs opacity-80">Mix & Mastering</div>
            </div>

            <div
              className={`bg-gradient-to-br ${getScoreColor(
                analysis.viralPotential
              )} p-6 rounded-2xl border backdrop-blur-sm hover:scale-105 transition-all`}
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5" />
                <div className="text-xs font-semibold">Viral Potential</div>
              </div>
              <div className="text-5xl font-bold mb-1">{analysis.viralPotential}/10</div>
              <div className="text-xs opacity-80">Social Media Ready</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
    </div>
  );
};
