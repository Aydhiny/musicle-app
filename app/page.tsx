"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Brain,
  Loader2,
  Database,
  Target,
  Sparkles,
  TrendingUp,
  X,
  BarChart3,
  Music,
  Zap,
  Award,
  Radio,
  Mic2,
  Activity,
} from "lucide-react";
import * as Papa from "papaparse";
import * as tf from "@tensorflow/tfjs";

interface SpotifyTrack {
  SongName: string;
  ArtistName: string;
  Tempo: number;
  Energy: number;
  Danceability: number;
  Valence: number;
  Acousticness: number;
  Loudness: number;
  Speechiness: number;
  Popularity: number;
  Key?: number;
  Mode?: number;
  Instrumentalness?: number;
  Liveness?: number;
  similarityScore?: number;
}

interface AudioFeatures {
  duration: number;
  sampleRate: number;
  peaks: number[];
  avgEnergy: number;
  filename: string;
  spectralData: number[];
  zeroCrossings: number;
  rmsEnergy: number[];
}

interface Characteristics {
  tempo: number;
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
  loudness: number;
  speechiness: number;
  instrumentalness: number;
  spectralCentroid: number;
  dynamicRange: number;
}

interface AnalysisResult {
  genre: string;
  subgenre: string;
  confidence: number;
  characteristics: Characteristics;
  similarTracks: SpotifyTrack[];
  commercialScore: number;
  productionScore: number;
  viralPotential: number;
  playlistFit: string[];
  marketFit: string;
  strengths: string[];
  improvements: string[];
  prediction: string;
  vibe: string;
  targetAudience: string[];
  moodProfile: { mood: string; intensity: number }[];
  keyInsights: string[];
}

class MusicAgent {
  private data: SpotifyTrack[];
  public state: string;
  private model: tf.LayersModel | null;
  private genreStats: Map<string, any>;

  constructor(data: SpotifyTrack[]) {
    this.data = data;
    this.state = "idle";
    this.model = null;
    this.genreStats = new Map();
    this.buildGenreProfiles();
  }

  buildGenreProfiles() {
    const profiles = {
      "Electronic/Dance": { tempoMin: 115, tempoMax: 140, energy: 0.7, danceability: 0.7, acousticness: 0.3 },
      "Hip-Hop/Rap": { tempoMin: 75, tempoMax: 110, energy: 0.6, danceability: 0.75, speechiness: 0.25 },
      Pop: { tempoMin: 100, tempoMax: 130, energy: 0.65, danceability: 0.65, valence: 0.55 },
      Rock: { tempoMin: 110, tempoMax: 140, energy: 0.75, loudness: -6, acousticness: 0.2 },
      "Acoustic/Folk": { tempoMin: 70, tempoMax: 110, energy: 0.4, acousticness: 0.7, instrumentalness: 0.3 },
      "R&B/Soul": { tempoMin: 80, tempoMax: 120, energy: 0.5, danceability: 0.6, valence: 0.45 },
      "Indie/Alternative": { tempoMin: 90, tempoMax: 130, energy: 0.55, acousticness: 0.45, valence: 0.5 },
      "Classical/Ambient": { tempoMin: 60, tempoMax: 100, energy: 0.3, acousticness: 0.8, instrumentalness: 0.8 },
    };
    Object.entries(profiles).forEach(([k, v]) => {
      this.genreStats.set(k, v);
    });
  }

  async initModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 128, activation: "relu", kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }) }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: "relu", kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }) }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: "relu" }),
        tf.layers.dense({ units: 8, activation: "softmax" }),
      ],
    });
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });
  }

  async observe(file: File): Promise<AudioFeatures> {
    this.state = "observing";
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audio = await ctx.decodeAudioData(buffer);
          const raw = audio.getChannelData(0);

          const samples = 200;
          const blockSize = Math.floor(raw.length / samples);
          const peaks: number[] = [];
          const rmsEnergy: number[] = [];

          for (let i = 0; i < samples; i++) {
            let sum = 0;
            let rms = 0;
            for (let j = 0; j < blockSize; j++) {
              const val = raw[i * blockSize + j];
              sum += Math.abs(val);
              rms += val * val;
            }
            peaks.push(sum / blockSize);
            rmsEnergy.push(Math.sqrt(rms / blockSize));
          }

          const max = Math.max(...peaks);
          const normalized = peaks.map((n) => n / max);
          const avgEnergy = normalized.reduce((a, b) => a + b, 0) / normalized.length;

          // Spectral analysis
          const fftSize = 2048;
          const spectralData: number[] = [];
          for (let i = 0; i < Math.min(10, Math.floor(raw.length / fftSize)); i++) {
            const slice = raw.slice(i * fftSize, (i + 1) * fftSize);
            const magnitude = slice.reduce((sum, val) => sum + Math.abs(val), 0) / slice.length;
            spectralData.push(magnitude);
          }

          // Zero crossings (indicates brightness/frequency content)
          let zeroCrossings = 0;
          for (let i = 1; i < raw.length; i++) {
            if ((raw[i] >= 0 && raw[i - 1] < 0) || (raw[i] < 0 && raw[i - 1] >= 0)) {
              zeroCrossings++;
            }
          }

          resolve({
            duration: audio.duration,
            sampleRate: audio.sampleRate,
            peaks: normalized,
            avgEnergy,
            filename: file.name,
            spectralData,
            zeroCrossings,
            rmsEnergy,
          });
        } catch (err) {
          reject(err);
        }
      };
    });
  }

  think(features: AudioFeatures): Characteristics {
    this.state = "thinking";
    const { avgEnergy, peaks, spectralData, zeroCrossings, rmsEnergy, sampleRate, duration } = features;

    const variance = peaks.reduce((a, b) => a + Math.pow(b - avgEnergy, 2), 0) / peaks.length;
    const stdDev = Math.sqrt(variance);

    // Dynamic range
    const maxPeak = Math.max(...peaks);
    const minPeak = Math.min(...peaks.filter((p) => p > 0.01));
    const dynamicRange = maxPeak / (minPeak || 0.01);

    // Tempo estimation from peak patterns
    const peakIntervals: number[] = [];
    let lastPeakIdx = 0;
    for (let i = 1; i < peaks.length - 1; i++) {
      if (peaks[i] > peaks[i - 1] && peaks[i] > peaks[i + 1] && peaks[i] > avgEnergy * 1.2) {
        if (lastPeakIdx > 0) {
          peakIntervals.push(i - lastPeakIdx);
        }
        lastPeakIdx = i;
      }
    }
    const avgInterval = peakIntervals.length > 0 ? peakIntervals.reduce((a, b) => a + b, 0) / peakIntervals.length : 20;
    const estimatedTempo = Math.min(180, Math.max(60, (60 / (avgInterval * (duration / peaks.length))) * 60));

    // Speechiness detection
    const silenceCount = peaks.filter((p) => p < 0.08).length;
    const silenceRatio = silenceCount / peaks.length;
    const energyVariation = stdDev / avgEnergy;
    const speechiness =
      silenceRatio > 0.3 && energyVariation > 0.4 ? Math.min(0.66, 0.25 + energyVariation * 0.3) : Math.min(0.25, energyVariation * 0.2);

    // Instrumentalness
    const avgSpectral = spectralData.reduce((a, b) => a + b, 0) / spectralData.length;
    const spectralVariation = Math.sqrt(spectralData.reduce((a, b) => a + Math.pow(b - avgSpectral, 2), 0) / spectralData.length);
    const instrumentalness = speechiness < 0.15 ? Math.min(0.9, 0.4 + spectralVariation * 2) : Math.max(0.05, 0.4 - speechiness);

    // Spectral centroid (brightness)
    const spectralCentroid = (zeroCrossings / duration / sampleRate) * 10000;

    // Energy calculation
    const avgRMS = rmsEnergy.reduce((a, b) => a + b, 0) / rmsEnergy.length;
    const energy = Math.min(1, avgRMS * 2.5);

    // Acousticness
    const highFreqRatio = spectralCentroid / 5000;
    const acousticness =
      energy < 0.5 && highFreqRatio < 0.8 ? Math.min(0.95, 0.6 + (1 - energy) * 0.4) : Math.max(0.05, 0.4 - energy * 0.3);

    // Danceability
    const rhythmicConsistency = 1 - stdDev * 2;
    const danceability = Math.min(0.95, Math.max(0.15, energy * 0.4 + rhythmicConsistency * 0.3 + (estimatedTempo > 90 ? 0.3 : 0.1)));

    // Valence (happiness)
    const valence = Math.min(
      0.95,
      Math.max(0.05, energy * 0.3 + (estimatedTempo > 100 ? 0.25 : 0.1) + (1 - acousticness) * 0.2 + variance * 0.8)
    );

    // Loudness
    const loudness = -40 + avgRMS * 35 + energy * 10;

    return {
      tempo: estimatedTempo,
      energy,
      danceability,
      valence,
      acousticness,
      loudness,
      speechiness,
      instrumentalness,
      spectralCentroid,
      dynamicRange,
    };
  }

  async decide(chars: Characteristics): Promise<{ genre: string; subgenre: string; confidence: number; similar: SpotifyTrack[] }> {
    this.state = "deciding";

    // Multi-factor similarity scoring
    const scored = this.data
      .map((t) => {
        let score = 0;

        // Tempo similarity (critical)
        const tempoDiff = Math.abs(t.Tempo - chars.tempo);
        if (tempoDiff <= 10) score += 5;
        else if (tempoDiff <= 20) score += 3;
        else if (tempoDiff <= 30) score += 1;

        // Energy similarity
        if (Math.abs(t.Energy - chars.energy) <= 0.1) score += 4;
        else if (Math.abs(t.Energy - chars.energy) <= 0.2) score += 2;

        // Danceability
        if (Math.abs(t.Danceability - chars.danceability) <= 0.1) score += 3;
        else if (Math.abs(t.Danceability - chars.danceability) <= 0.2) score += 1.5;

        // Valence
        if (Math.abs(t.Valence - chars.valence) <= 0.15) score += 2;
        else if (Math.abs(t.Valence - chars.valence) <= 0.3) score += 1;

        // Acousticness
        if (Math.abs(t.Acousticness - chars.acousticness) <= 0.15) score += 2.5;

        // Loudness
        if (Math.abs(t.Loudness - chars.loudness) <= 4) score += 2;

        // Speechiness
        if (Math.abs(t.Speechiness - chars.speechiness) <= 0.1) score += 2;

        return { ...t, similarityScore: score };
      })
      .sort((a, b) => b.similarityScore! - a.similarityScore!)
      .slice(0, 20);

    // Genre classification with improved logic
    const input = tf.tensor2d([
      [
        chars.tempo / 200,
        chars.energy,
        chars.danceability,
        chars.valence,
        chars.acousticness,
        (chars.loudness + 60) / 60,
        chars.speechiness,
        chars.instrumentalness,
        chars.spectralCentroid / 5000,
        chars.dynamicRange / 10,
      ],
    ]);

    let genre = "Pop";
    let subgenre = "Contemporary Pop";
    let confidence = 0;

    if (this.model) {
      const pred = this.model.predict(input) as tf.Tensor;
      const data = await pred.data();
      const maxIdx = data.indexOf(Math.max(...Array.from(data)));
      const genres = [
        "Electronic/Dance",
        "Hip-Hop/Rap",
        "Pop",
        "Rock",
        "Acoustic/Folk",
        "R&B/Soul",
        "Indie/Alternative",
        "Classical/Ambient",
      ];
      genre = genres[maxIdx];
      confidence = Math.round(data[maxIdx] * 100);
      pred.dispose();
    } else {
      // Rule-based classification as fallback
      const scores = new Map<string, number>();

      this.genreStats.forEach((profile, genreName) => {
        let score = 0;

        if (profile.tempoMin && chars.tempo >= profile.tempoMin && chars.tempo <= profile.tempoMax) score += 25;
        if (profile.energy && Math.abs(chars.energy - profile.energy) < 0.2) score += 20;
        if (profile.danceability && Math.abs(chars.danceability - profile.danceability) < 0.2) score += 15;
        if (profile.acousticness && Math.abs(chars.acousticness - profile.acousticness) < 0.3) score += 15;
        if (profile.speechiness && Math.abs(chars.speechiness - profile.speechiness) < 0.2) score += 15;
        if (profile.valence && Math.abs(chars.valence - profile.valence) < 0.2) score += 10;

        scores.set(genreName, score);
      });

      let maxScore = 0;
      scores.forEach((score, genreName) => {
        if (score > maxScore) {
          maxScore = score;
          genre = genreName;
        }
      });

      confidence = Math.min(95, Math.max(60, maxScore));
    }

    // Determine subgenre
    if (genre === "Electronic/Dance") {
      if (chars.tempo > 130) subgenre = "Techno/Trance";
      else if (chars.energy > 0.8) subgenre = "Big Room/Festival";
      else if (chars.danceability > 0.75) subgenre = "House";
      else subgenre = "Electronic Pop";
    } else if (genre === "Hip-Hop/Rap") {
      if (chars.speechiness > 0.4) subgenre = "Rap";
      else if (chars.energy < 0.5) subgenre = "Lo-fi Hip-Hop";
      else subgenre = "Contemporary Hip-Hop";
    } else if (genre === "Pop") {
      if (chars.danceability > 0.7) subgenre = "Dance Pop";
      else if (chars.acousticness > 0.4) subgenre = "Acoustic Pop";
      else if (chars.energy > 0.7) subgenre = "Power Pop";
      else subgenre = "Contemporary Pop";
    } else if (genre === "Rock") {
      if (chars.energy > 0.8) subgenre = "Hard Rock";
      else if (chars.acousticness > 0.3) subgenre = "Folk Rock";
      else subgenre = "Alternative Rock";
    } else if (genre === "Acoustic/Folk") {
      if (chars.instrumentalness > 0.6) subgenre = "Instrumental Folk";
      else subgenre = "Singer-Songwriter";
    } else if (genre === "R&B/Soul") {
      if (chars.tempo < 90) subgenre = "Neo-Soul";
      else subgenre = "Contemporary R&B";
    }

    input.dispose();
    return { genre, subgenre, confidence, similar: scored };
  }

  async act(
    decision: { genre: string; subgenre: string; confidence: number; similar: SpotifyTrack[] },
    chars: Characteristics
  ): Promise<AnalysisResult> {
    this.state = "acting";
    const { genre, subgenre, confidence, similar } = decision;
    const avgPop = similar.slice(0, 7).reduce((s, t) => s + (t.Popularity || 50), 0) / 7;

    // Commercial Score
    const commercialScore = Math.min(
      10,
      Math.round(
        (chars.energy * 2.5 +
          chars.danceability * 2.5 +
          (chars.valence > 0.5 ? chars.valence * 1.5 : 0.5) +
          (avgPop / 10) * 2 +
          (chars.tempo > 95 && chars.tempo < 135 ? 1 : 0)) /
          1
      )
    );

    // Production Score
    const productionScore = Math.min(
      10,
      Math.round(
        ((1 - chars.acousticness) * 3 + chars.energy * 2.5 + ((chars.loudness + 60) / 60) * 2.5 + (chars.dynamicRange > 3 ? 1.5 : 0.5)) /
          0.95
      )
    );

    // Viral Potential
    const viralPotential = Math.min(
      10,
      Math.round(
        (chars.danceability * 3 + chars.energy * 2 + (chars.tempo > 100 && chars.tempo < 130 ? 2 : 0.5) + commercialScore * 0.3) / 0.8
      )
    );

    // Strengths
    const strengths: string[] = [];
    if (chars.energy > 0.75) strengths.push("Explosive energy - perfect for high-intensity moments");
    else if (chars.energy > 0.6) strengths.push("Strong energy levels - engaging and dynamic");

    if (chars.danceability > 0.75) strengths.push("Exceptional groove - club and party ready");
    else if (chars.danceability > 0.6) strengths.push("Solid rhythmic foundation - moves bodies");

    if (chars.valence > 0.7) strengths.push("Uplifting vibes - feel-good anthem potential");
    else if (chars.valence > 0.5) strengths.push("Positive emotional tone - accessible and warm");

    if (chars.tempo > 120 && chars.tempo < 135) strengths.push("Sweet spot tempo - optimal for mainstream appeal");
    else if (chars.tempo > 90) strengths.push("Engaging tempo - keeps momentum flowing");

    if (chars.acousticness > 0.7) strengths.push("Rich organic texture - authentic and intimate");
    else if (chars.acousticness < 0.3) strengths.push("Polished electronic production - modern sound");

    if (chars.loudness > -6) strengths.push("Competitive loudness - radio and streaming ready");
    if (chars.dynamicRange > 5) strengths.push("Great dynamic contrast - expressive and nuanced");
    if (avgPop > 65) strengths.push("Similar to chart-toppers - proven commercial appeal");
    if (chars.speechiness > 0.4) strengths.push("Strong vocal presence - lyric-driven narrative");
    if (chars.instrumentalness > 0.6) strengths.push("Rich instrumental layers - cinematic quality");

    // Improvements
    const improvements: string[] = [];
    if (chars.energy < 0.4) improvements.push("Boost energy - add driving elements and build intensity");
    if (chars.danceability < 0.45) improvements.push("Strengthen groove - enhance rhythmic pocket and pulse");
    if (productionScore < 6) improvements.push("Elevate production - refine mix clarity and sonic depth");
    if (chars.valence < 0.35) improvements.push("Brighten the mood - inject uplifting melodic elements");
    if (chars.tempo < 75) improvements.push("Consider uptempo version - increase pace for more energy");
    if (chars.loudness < -15) improvements.push("Increase loudness - optimize for streaming platforms");
    if (chars.dynamicRange < 2) improvements.push("Add dynamic variation - create more emotional peaks");
    if (avgPop < 35 && commercialScore < 6) improvements.push("Study current trends - incorporate contemporary production techniques");
    if (chars.speechiness > 0.7) improvements.push("Balance vocal density - allow instrumental space to breathe");
    if (chars.acousticness > 0.8 && genre !== "Acoustic/Folk") improvements.push("Consider subtle electronic elements for wider appeal");

    // Playlist Fit
    const playlistFit: string[] = [];
    if (chars.energy > 0.7 && chars.danceability > 0.7) playlistFit.push("Party Anthems", "Workout Motivation", "Club Bangers");
    if (chars.valence > 0.6 && chars.energy > 0.5) playlistFit.push("Feel Good Friday", "Happy Hits", "Mood Booster");
    if (chars.acousticness > 0.6) playlistFit.push("Acoustic Covers", "Unplugged Sessions", "Coffee Shop Vibes");
    if (chars.energy < 0.4 && chars.valence < 0.5) playlistFit.push("Sad Songs", "Melancholic Moods", "Rainy Day");
    if (chars.instrumentalness > 0.6) playlistFit.push("Instrumental Focus", "Study Beats", "Background Ambience");
    if (chars.speechiness > 0.4) playlistFit.push("Rap Caviar", "Hip-Hop Central", "Lyric Focused");
    if (chars.tempo > 120 && chars.energy > 0.6) playlistFit.push("Running Tracks", "Cardio", "High Energy");
    if (viralPotential > 7) playlistFit.push("Viral Hits", "TikTok Trending", "New Music Friday");

    // Market Fit
    let marketFit = "";
    if (genre === "Electronic/Dance") {
      marketFit = "EDM festivals, nightclubs, fitness streaming, gaming soundtracks, fashion shows";
    } else if (genre === "Hip-Hop/Rap") {
      marketFit = "Urban radio, TikTok, street culture brands, sports content, social media";
    } else if (genre === "Pop") {
      marketFit = "Top 40 radio, streaming playlists, TV commercials, retail stores, mainstream media";
    } else if (genre === "Rock") {
      marketFit = "Rock radio, live venues, sports broadcasts, action films, automotive ads";
    } else if (genre === "Acoustic/Folk") {
      marketFit = "Coffee shops, indie films, wellness content, travel vlogs, intimate venues";
    } else if (genre === "R&B/Soul") {
      marketFit = "R&B stations, late-night radio, romantic content, luxury brands, lifestyle media";
    } else {
      marketFit = "Indie radio, alternative playlists, film soundtracks, art installations, niche streaming";
    }

    // Vibe
    let vibe = "";
    if (chars.energy > 0.75 && chars.valence > 0.65) vibe = "Euphoric & Electric";
    else if (chars.energy > 0.75 && chars.valence < 0.4) vibe = "Intense & Aggressive";
    else if (chars.energy > 0.65 && chars.danceability > 0.7) vibe = "Party-Ready Banger";
    else if (chars.energy < 0.35 && chars.valence > 0.6) vibe = "Serene & Peaceful";
    else if (chars.energy < 0.4 && chars.valence < 0.4) vibe = "Melancholic & Reflective";
    else if (chars.danceability > 0.75) vibe = "Groovy & Infectious";
    else if (chars.acousticness > 0.7) vibe = "Organic & Intimate";
    else if (chars.valence > 0.6) vibe = "Uplifting & Positive";
    else vibe = "Balanced & Versatile";

    // Target Audience
    const targetAudience: string[] = [];
    if (chars.energy > 0.7 && chars.danceability > 0.65) targetAudience.push("Festival crowds & nightclub enthusiasts");
    if (chars.acousticness > 0.6) targetAudience.push("Indie & folk music aficionados");
    if (chars.tempo > 125 && chars.energy > 0.75) targetAudience.push("EDM fans & rave culture");
    if (chars.valence < 0.4 && chars.acousticness > 0.4) targetAudience.push("Introspective listeners & singer-songwriter fans");
    if (commercialScore > 7) targetAudience.push("Mainstream pop audience & radio listeners");
    if (chars.speechiness > 0.4) targetAudience.push("Hip-hop heads & lyric enthusiasts");
    if (chars.energy < 0.4) targetAudience.push("Chill & lo-fi lovers");
    if (viralPotential > 7) targetAudience.push("TikTok & social media users");
    if (targetAudience.length === 0) targetAudience.push("General music listeners across demographics");

    // Mood Profile
    const moodProfile: { mood: string; intensity: number }[] = [];
    moodProfile.push({ mood: "Happy", intensity: Math.round(chars.valence * 100) });
    moodProfile.push({ mood: "Energetic", intensity: Math.round(chars.energy * 100) });
    moodProfile.push({ mood: "Danceable", intensity: Math.round(chars.danceability * 100) });
    moodProfile.push({ mood: "Acoustic", intensity: Math.round(chars.acousticness * 100) });

    // Key Insights
    const keyInsights: string[] = [];
    if (commercialScore >= 8 && viralPotential >= 8) {
      keyInsights.push("🔥 Chart-topping potential - This track has all the ingredients for mainstream success");
    } else if (commercialScore >= 7) {
      keyInsights.push("💎 Strong commercial appeal - Radio and playlist-friendly");
    }

    if (chars.danceability > 0.75 && chars.energy > 0.7) {
      keyInsights.push("💃 Peak-time ready - Perfect for clubs and festivals");
    }

    if (chars.acousticness > 0.7 && chars.valence > 0.6) {
      keyInsights.push("🎸 Organic authenticity - Stands out in electronic-heavy market");
    }

    if (avgPop > 70) {
      keyInsights.push("📈 Similar to current hits - Aligned with what's working now");
    }

    if (productionScore >= 8) {
      keyInsights.push("🎚️ Professional production - Mix and master are competitive");
    }

    const prediction = `${genre} track with ${confidence}% confidence. ${subgenre} characteristics detected. Commercial score: ${commercialScore}/10, Viral potential: ${viralPotential}/10. Optimized for ${
      marketFit.split(",")[0]
    }.`;

    this.state = "idle";
    return {
      genre,
      subgenre,
      confidence,
      characteristics: chars,
      similarTracks: similar,
      commercialScore,
      productionScore,
      viralPotential,
      playlistFit: playlistFit.slice(0, 6),
      marketFit,
      strengths: strengths.length > 0 ? strengths : ["Unique sound profile - explore niche markets and alternative audiences"],
      improvements: improvements.length > 0 ? improvements : ["Solid fundamentals - fine-tuning will optimize commercial positioning"],
      prediction,
      vibe,
      targetAudience,
      moodProfile,
      keyInsights,
    };
  }

  async run(file: File): Promise<AnalysisResult | null> {
    try {
      if (!this.model) await this.initModel();
      const features = await this.observe(file);
      const chars = this.think(features);
      const decision = await this.decide(chars);
      return await this.act(decision, chars);
    } catch (err) {
      console.error(err);
      this.state = "error";
      return null;
    }
  }
}

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 animate-pulse">
    <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-white/10 rounded w-2/3 mb-3"></div>
    <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
    <div className="h-3 bg-white/10 rounded w-5/6"></div>
  </div>
);

export default function App() {
  const [agent, setAgent] = useState<MusicAgent | null>(null);
  const [data, setData] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [state, setState] = useState("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/SpotifySongs.csv");
        const csv = await res.text();
        const parsed = Papa.parse<SpotifyTrack>(csv, { header: true, dynamicTyping: true, skipEmptyLines: true });
        setData(parsed.data);
        const a = new MusicAgent(parsed.data);
        await a.initModel();
        setAgent(a);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    })();
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("audio/") || !agent) return;
    setAnalyzing(true);
    setResult(null);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + Math.random() * 15, 95));
    }, 200);

    const stateInterval = setInterval(() => setState(agent.state), 100);

    const res = await agent.run(file);

    clearInterval(progressInterval);
    clearInterval(stateInterval);
    setUploadProgress(100);

    setTimeout(() => {
      setState("idle");
      if (res) setResult(res);
      setAnalyzing(false);
    }, 500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "from-emerald-900/40 to-green-900/40 border-emerald-500/40 text-emerald-400";
    if (score >= 6) return "from-amber-900/40 to-yellow-900/40 border-amber-500/40 text-amber-400";
    return "from-rose-900/40 to-red-900/40 border-rose-500/40 text-rose-400";
  };

  const getStateMessage = (s: string) => {
    const messages: Record<string, string> = {
      observing: "Analyzing audio waveforms...",
      thinking: "Extracting musical features...",
      deciding: "Running ML classification...",
      acting: "Generating comprehensive insights...",
    };
    return messages[s] || "Processing...";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a15] to-[#0a0a0a] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto relative z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-9 h-9 text-purple-400 animate-pulse" />
            <div className="absolute inset-0 bg-purple-400/20 blur-xl rounded-full"></div>
          </div>
          <div>
            <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              MUSIC AGENT
            </span>
            <div className="text-xs text-gray-500">AI-Powered Analysis</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {data.length > 0 && (
            <div className="text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Database className="w-3 h-3 inline mr-2 text-purple-400" />
              <span className="text-gray-400">{data.length.toLocaleString()} tracks</span>
            </div>
          )}
        </div>
      </nav>

      {!result ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="text-center mb-12 space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 px-5 py-2 rounded-full text-sm text-purple-300 backdrop-blur-sm">
              <Brain className="w-4 h-4 animate-pulse" />
              TensorFlow.js Neural Network • Advanced ML
            </div>
            <h1 className="text-7xl font-bold leading-tight">
              AI Music{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Agent</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Upload your track for instant ML-powered analysis with genre detection, commercial scoring, and actionable insights
            </p>
            {loading && (
              <div className="flex items-center gap-3 justify-center text-sm text-purple-400 bg-purple-500/10 px-6 py-3 rounded-full border border-purple-500/30 backdrop-blur-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing neural network...</span>
              </div>
            )}
          </div>

          <div
            className="w-full max-w-5xl"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
          >
            <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border-2 border-dashed border-gray-700 rounded-3xl p-24 text-center hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
              {analyzing ? (
                <div className="flex flex-col items-center gap-8">
                  <div className="relative">
                    <Loader2 className="w-20 h-20 text-purple-400 animate-spin" />
                    <Brain className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-300" />
                    <div className="absolute inset-0 bg-purple-400/20 blur-2xl rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold mb-2">Analyzing Your Track</p>
                    <p className="text-purple-400 font-mono text-sm mb-4">{getStateMessage(state)}</p>
                    <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{Math.round(uploadProgress)}% complete</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8">
                  <div className="relative">
                    <Upload className="w-20 h-20 text-purple-400" />
                    <div className="absolute inset-0 bg-purple-400/20 blur-2xl rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Drop audio file or{" "}
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                        disabled={loading}
                      >
                        browse
                      </button>
                    </h3>
                    <p className="text-gray-500">Supports MP3, WAV, OGG, M4A • Max 50MB</p>
                  </div>
                  {!loading && (
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Waveform Analysis
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="w-3 h-3" />
                        ML Classification
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Market Insights
                      </div>
                    </div>
                  )}
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
                accept="audio/*"
              />
            </div>
          </div>

          <div className="mt-20 grid grid-cols-4 gap-6 max-w-5xl">
            {[
              { i: <Music className="w-7 h-7" />, l: "Observe", d: "Audio waveform analysis", c: "from-blue-500/20" },
              { i: <Brain className="w-7 h-7" />, l: "Think", d: "Feature extraction", c: "from-purple-500/20" },
              { i: <Target className="w-7 h-7" />, l: "Decide", d: "ML classification", c: "from-pink-500/20" },
              { i: <Zap className="w-7 h-7" />, l: "Act", d: "Generate insights", c: "from-emerald-500/20" },
            ].map((s, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${s.c} to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/40 hover:scale-105 transition-all duration-300 cursor-pointer group`}
              >
                <div className="text-purple-400 mb-3 flex justify-center group-hover:scale-110 transition-transform">{s.i}</div>
                <div className="font-bold text-base mb-2">{s.l}</div>
                <div className="text-xs text-gray-500">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-20 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Analysis Complete
              </h2>
              <p className="text-gray-500">Comprehensive insights powered by machine learning</p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-gray-400 hover:text-white flex items-center gap-2 bg-white/5 px-5 py-3 rounded-xl hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm group"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              New Analysis
            </button>
          </div>

          {/* Key Insights Banner */}
          {result.keyInsights && result.keyInsights.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="font-bold mb-3 text-sm text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                KEY INSIGHTS
              </h3>
              <div className="space-y-2">
                {result.keyInsights.map((insight, i) => (
                  <div key={i} className="text-sm text-white/90">
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
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
                        {result.genre}
                      </div>
                      <div className="text-lg text-purple-300 mt-1">{result.subgenre}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Confidence</div>
                    <div className="text-3xl font-bold text-white">{result.confidence}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">{result.prediction}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="text-xs text-gray-400 mb-1">VIBE</div>
                    <div className="text-lg font-bold text-purple-300">{result.vibe}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="text-xs text-gray-400 mb-1">VIRAL POTENTIAL</div>
                    <div className="text-lg font-bold text-pink-300">{result.viralPotential}/10</div>
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
                    { label: "Tempo", value: result.characteristics.tempo.toFixed(0), unit: "BPM", color: "purple" },
                    { label: "Energy", value: (result.characteristics.energy * 100).toFixed(0), unit: "%", color: "pink" },
                    { label: "Danceability", value: (result.characteristics.danceability * 100).toFixed(0), unit: "%", color: "blue" },
                    { label: "Valence", value: (result.characteristics.valence * 100).toFixed(0), unit: "%", color: "emerald" },
                    { label: "Acousticness", value: (result.characteristics.acousticness * 100).toFixed(0), unit: "%", color: "amber" },
                    { label: "Loudness", value: result.characteristics.loudness.toFixed(0), unit: "dB", color: "rose" },
                    { label: "Speechiness", value: (result.characteristics.speechiness * 100).toFixed(0), unit: "%", color: "cyan" },
                    {
                      label: "Instrumental",
                      value: (result.characteristics.instrumentalness * 100).toFixed(0),
                      unit: "%",
                      color: "violet",
                    },
                    { label: "Spectral", value: result.characteristics.spectralCentroid.toFixed(0), unit: "Hz", color: "fuchsia" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-white/5 to-transparent rounded-xl p-5 border border-white/5 hover:border-white/20 transition-all group"
                    >
                      <div className="text-xs text-gray-500 mb-2">{item.label}</div>
                      <div className={`text-3xl font-bold text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                        {item.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{item.unit}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Profile */}
              {result.moodProfile && result.moodProfile.length > 0 && (
                <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                  <h3 className="font-bold mb-6 text-sm text-gray-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    MOOD PROFILE
                  </h3>
                  <div className="space-y-4">
                    {result.moodProfile.map((mood, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-300">{mood.mood}</span>
                          <span className="text-sm font-bold text-purple-400">{mood.intensity}%</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                            style={{ width: `${mood.intensity}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Audience */}
              <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="font-bold mb-6 text-sm text-gray-400 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  TARGET AUDIENCE
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {result.targetAudience && result.targetAudience.length > 0 ? (
                    result.targetAudience.map((aud, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 text-sm flex items-center gap-3 hover:border-purple-500/40 transition-all group"
                      >
                        <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></div>
                        <span className="text-gray-200">{aud}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">General music listeners</div>
                  )}
                </div>
              </div>

              {/* Playlist Fit */}
              {result.playlistFit && result.playlistFit.length > 0 && (
                <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                  <h3 className="font-bold mb-6 text-sm text-gray-400 flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    PLAYLIST RECOMMENDATIONS
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {result.playlistFit.map((playlist, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 text-center hover:scale-105 transition-all cursor-pointer"
                      >
                        <div className="text-sm font-semibold text-blue-300">{playlist}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Scores */}
              <div className="grid grid-cols-1 gap-4">
                <div
                  className={`bg-gradient-to-br ${getScoreColor(
                    result.commercialScore
                  )} p-6 rounded-2xl border backdrop-blur-sm hover:scale-105 transition-all`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5" />
                    <div className="text-xs font-semibold">Commercial Potential</div>
                  </div>
                  <div className="text-5xl font-bold mb-1">{result.commercialScore}/10</div>
                  <div className="text-xs opacity-80">Mainstream Appeal</div>
                </div>

                <div
                  className={`bg-gradient-to-br ${getScoreColor(
                    result.productionScore
                  )} p-6 rounded-2xl border backdrop-blur-sm hover:scale-105 transition-all`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Mic2 className="w-5 h-5" />
                    <div className="text-xs font-semibold">Production Quality</div>
                  </div>
                  <div className="text-5xl font-bold mb-1">{result.productionScore}/10</div>
                  <div className="text-xs opacity-80">Mix & Mastering</div>
                </div>

                <div
                  className={`bg-gradient-to-br ${getScoreColor(
                    result.viralPotential
                  )} p-6 rounded-2xl border backdrop-blur-sm hover:scale-105 transition-all`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <div className="text-xs font-semibold">Viral Potential</div>
                  </div>
                  <div className="text-5xl font-bold mb-1">{result.viralPotential}/10</div>
                  <div className="text-xs opacity-80">Social Media Ready</div>
                </div>
              </div>

              {/* Market Fit */}
              <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-bold mb-4 text-sm text-gray-400 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  MARKET FIT
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{result.marketFit}</p>
              </div>

              {/* Strengths */}
              <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-bold mb-5 text-sm text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  STRENGTHS
                </h3>
                <div className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-4 text-sm text-emerald-100 leading-relaxed hover:border-emerald-500/50 transition-all"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-bold mb-5 text-sm text-gray-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  SUGGESTED IMPROVEMENTS
                </h3>
                <div className="space-y-3">
                  {result.improvements.map((imp, i) => (
                    <div
                      key={i}
                      className="border-l-2 border-purple-500 pl-4 py-3 text-sm text-gray-300 leading-relaxed bg-white/5 rounded-r-lg hover:bg-white/10 transition-all"
                    >
                      {imp}
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Tracks */}
              <div className="bg-gradient-to-br from-[#121212] to-[#1a1a2e] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-bold mb-5 text-sm text-gray-400 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  SIMILAR TRACKS
                </h3>
                <div className="space-y-3">
                  {result.similarTracks.slice(0, 5).map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl hover:from-white/10 hover:to-white/5 transition-all border border-white/5 hover:border-white/10 group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate text-white">{t.SongName}</div>
                        <div className="text-xs text-gray-500 truncate">{t.ArtistName}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                          {Math.round(t.Tempo)} BPM
                        </div>
                        <div className="text-xs text-purple-400 font-bold">♫ {t.Popularity || "N/A"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
