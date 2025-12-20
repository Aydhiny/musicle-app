"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileAudio, Loader2, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { simulateAnalysis } from "@/lib/utils";

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setAnalyzing(true);
    // Simulate AI processing
    const data = await simulateAnalysis(uploadedFile.name);
    setResult(data);
    setAnalyzing(false);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 relative z-10">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
              ${isDragging ? "border-purple-500 bg-purple-500/10" : "border-gray-700 bg-[#111]"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                <UploadCloud className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium text-white">
                Drag and Drop file here or <span className="text-purple-400 cursor-pointer hover:underline">Choose file</span>
              </h3>
              <p className="text-gray-500 text-sm">Supported formats: MP3, WAV, OGG, AVI</p>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                accept="audio/*"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-gray-800 rounded-xl p-8 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-900/30 p-3 rounded-lg">
                  <FileAudio className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{file.name}</h3>
                  <p className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={reset} className="text-gray-500 hover:text-white">
                <X />
              </button>
            </div>

            {analyzing ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-400 animate-pulse">Musicle AI is listening to your track...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Stats */}
                <div className="space-y-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-gray-400">Mix Score</span>
                    <span className="text-2xl font-bold text-green-400">{result.score}/100</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase">Key</p>
                      <p className="text-xl font-bold text-white">{result.key}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase">BPM</p>
                      <p className="text-xl font-bold text-white">{result.bpm}</p>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">Detected Genre</p>
                    <p className="text-white font-medium">{result.genre}</p>
                  </div>
                </div>

                {/* AI Feedback */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <h4 className="text-white font-medium">AI Suggestions</h4>
                  </div>
                  <ul className="space-y-3">
                    {result.tips.map((tip: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 bg-purple-900/10 border border-purple-500/20 p-3 rounded">
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">Similar Artists</p>
                    <div className="flex flex-wrap gap-2">
                      {result.similar.map((artist: string) => (
                        <span key={artist} className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
