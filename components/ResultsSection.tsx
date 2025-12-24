import { Activity, Award, BarChart3, Brain, Mic2, Share2, Sparkles, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { ShareMenu } from "./ShareMenu";
import { AudioPlayer } from "./AudioPlayer";
import { WaveformVisualization } from "./WaveformVisualization";
import { CharacteristicsGrid } from "./CharacteristicsGrid";
import { ScoreCard } from "./ScoreCard";
import { ShareService } from "@/services/shareService";
import { AnalysisResult } from "@/interfaces/AudioInterfaces";

interface ResultsSectionProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  if (!result.analysis) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No analysis data available</p>
      </div>
    );
  }

  const { analysis } = result;

  const handleShare = async () => {
    const success = await ShareService.copyToClipboard(result.trackId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadReport = () => {
    ShareService.downloadReport(result);
  };

  const overallScore = ((analysis.commercialScore + analysis.productionScore + analysis.viralPotential) / 3).toFixed(1);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Analysis Complete
          </h2>
          <p className="text-gray-400">Comprehensive insights powered by machine learning</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="text-gray-400 hover:text-white flex items-center gap-2 bg-white/5 px-5 py-3 rounded-xl hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all backdrop-blur-sm group"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            <ShareMenu
              show={showShareMenu}
              onClose={() => setShowShareMenu(false)}
              onCopy={handleShare}
              onDownload={handleDownloadReport}
              copied={copied}
            />
          </div>

          <button
            onClick={onReset}
            className="text-gray-400 hover:text-white flex items-center gap-2 bg-white/5 px-5 py-3 rounded-xl hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all backdrop-blur-sm group"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            New Analysis
          </button>
        </div>
      </div>

      {/* Track Info Card */}
      <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{result.fileName}</h3>
              <p className="text-sm text-gray-400">Uploaded {new Date(result.uploadedAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Analysis ID</div>
            <div className="text-sm font-mono text-gray-500">{result.trackId.substring(0, 8)}...</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Player */}
          {result.audioUrl && <AudioPlayer audioUrl={result.audioUrl} fileName={result.fileName} />}

          {/* Genre Classification */}
          <div className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Brain className="w-12 h-12 text-purple-400" />
                  <div className="absolute inset-0 bg-purple-400/30 blur-xl rounded-full" />
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
                />
              </div>
            </div>

            <WaveformVisualization />
          </div>

          {/* Audio Characteristics */}
          <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="font-bold mb-6 text-sm text-gray-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              AUDIO CHARACTERISTICS
            </h3>
            <CharacteristicsGrid characteristics={analysis.characteristics} />
          </div>

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
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
            <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
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
          <div className="grid grid-cols-1 gap-4">
            <ScoreCard
              icon={<Award className="w-5 h-5" />}
              title="Commercial Potential"
              score={analysis.commercialScore}
              subtitle="Mainstream Appeal"
            />
            <ScoreCard
              icon={<Mic2 className="w-5 h-5" />}
              title="Production Quality"
              score={analysis.productionScore}
              subtitle="Mix & Mastering"
            />
            <ScoreCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Viral Potential"
              score={analysis.viralPotential}
              subtitle="Social Media Ready"
            />
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-2">OVERALL SCORE</div>
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {overallScore}
              </div>
              <div className="text-xs text-gray-400">Out of 10</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
