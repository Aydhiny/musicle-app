import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// A mock AI engine to simulate music analysis
export const simulateAnalysis = (fileName: string) => {
  const genres = ["Deep House", "Indie Pop", "Trap", "Techno", "Lo-Fi"];
  const keys = ["C Minor", "F# Major", "A Minor", "G Major", "Bb Minor"];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        bpm: Math.floor(Math.random() * (140 - 80) + 80),
        key: keys[Math.floor(Math.random() * keys.length)],
        genre: genres[Math.floor(Math.random() * genres.length)],
        score: Math.floor(Math.random() * (95 - 70) + 70),
        tips: [
          "The low-end around 60Hz feels slightly muddy. Try a high-pass filter on your synth pads.",
          "Vocals are sitting a bit low in the mix. Consider adding 2dB of gain or a gentle compressor.",
          "Great stereo width, but check your mono compatibility on the snare.",
        ],
        similar: ["Flume", "Odesza", "Disclosure", "Kaytranada"],
      });
    }, 3000); // Takes 3 seconds to "analyze"
  });
};
