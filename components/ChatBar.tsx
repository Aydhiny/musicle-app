"use client";

import { useState } from "react";
import { Send, Plus, Sparkles } from "lucide-react";

export default function ChatBar() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    alert(`This would send "${query}" to the Musicle LLM!`);
    setQuery("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 relative z-20">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-20 group-hover:opacity-40 transition duration-1000 blur"></div>
        <div className="relative flex items-center bg-[#1a1a1a] rounded-full border border-gray-700 px-4 py-2 shadow-2xl">
          <div className="p-2 rounded-full bg-gray-800 text-gray-400 mr-2 cursor-pointer hover:text-white transition">
            <Plus size={20} />
          </div>
          <input
            type="text"
            placeholder="Ask Musicle about compression, EQ, or music theory..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 py-3 px-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="p-2 text-gray-400 hover:text-white transition">
            <Send size={20} />
          </button>
        </div>
      </form>

      {/* Floating Elements from Screenshot */}
      <div className="absolute -top-20 -left-20 hidden lg:block animate-bounce delay-700">
        <div className="bg-gray-800 text-xs text-white px-3 py-1 rounded mb-2 w-max">What's this?</div>
        <div className="w-12 h-12 bg-[#222] rounded-full flex items-center justify-center border border-gray-700 shadow-lg">❤️</div>
      </div>
      <div className="absolute -top-32 -right-10 hidden lg:block animate-pulse">
        <div className="bg-gray-800 text-xs text-white px-3 py-1 rounded mb-2 w-max">Analyze Mix</div>
        <div className="w-12 h-12 bg-[#222] rounded-full flex items-center justify-center border border-gray-700 shadow-lg text-yellow-400">
          <Sparkles size={20} />
        </div>
      </div>
    </div>
  );
}
