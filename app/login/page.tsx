"use client";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, Music2, ArrowRight, AlertCircle, Github, Chrome } from "lucide-react";
import { BackgroundCircles } from "@/components/ui/shadcn-io/background-circles";
import { GridPattern } from "@/components/ui/shadcn-io/grid-pattern";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Simulate success - in real app, handle authentication here
      console.log("Login successful");
    }, 2000);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    // Simulate social login
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Logged in with ${provider}`);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <main className="relative min-h-screen bg-[#171717] text-white overflow-hidden font-sans selection:bg-[#BCAAF9] selection:text-black">
      {/* Background Elements */}
      <GridPattern className={cn("[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]")} strokeDasharray="2 6" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="w-full max-w-md">
            {/* Hero Text */}
            <div className="text-center mb-8 sm:mb-12">
              {/* Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
                <div className="flex items-center justify-center mx-auto w-fit">
                  <span className="inline-block bg-gradient-to-b from-[#8c738e] via-[#e2e2e2] to-[#ffffff] bg-clip-text text-transparent">
                    {isSignUp ? "Join Musicle" : "Sign In"}
                  </span>
                </div>
              </h1>

              <p className="text-sm sm:text-base text-gray-400">
                {isSignUp ? "Start analyzing your music with AI-powered insights" : "Continue your journey to perfect sound"}
              </p>
            </div>

            {/* Login Form Container */}
            <div className="relative">
              <div className="relative bg-[#111111] border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8">
                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleSocialLogin("google")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <Chrome className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium">Continue with Google</span>
                  </button>

                  <button
                    onClick={() => handleSocialLogin("github")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <Github className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium">Continue with GitHub</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-[#111111] text-gray-500 uppercase tracking-wider">Or continue with email</span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-300 block">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#BCAAF9] transition-colors pointer-events-none" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="you@example.com"
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#BCAAF9]/50 focus:border-[#BCAAF9]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-gray-300 block">
                        Password
                      </label>
                      {!isSignUp && (
                        <a href="#" className="text-xs text-[#BCAAF9] hover:text-[#d9cbff] transition-colors">
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#BCAAF9] transition-colors pointer-events-none" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#BCAAF9]/50 focus:border-[#BCAAF9]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full mt-6 py-3.5 rounded-lg bg-gradient-to-b from-[#BCAAF9] to-[#9f85f6] text-black font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg shadow-[#BCAAF9]/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                {/* Toggle Sign Up / Sign In */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                      }}
                      disabled={isLoading}
                      className="text-[#BCAAF9] hover:text-[#d9cbff] font-medium transition-colors disabled:opacity-50"
                    >
                      {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                  </p>
                </div>

                {/* Terms */}
                {isSignUp && (
                  <p className="mt-6 text-xs text-center text-gray-500 leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="text-gray-400 hover:text-white transition-colors underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-gray-400 hover:text-white transition-colors underline">
                      Privacy Policy
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center space-y-2">
              <p className="text-xs text-gray-600">Protected by industry-standard encryption</p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-700">
                <span>256-bit SSL</span>
                <span>•</span>
                <span>GDPR Compliant</span>
                <span>•</span>
                <span>SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 px-4 py-6 border-t border-white/5">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© 2026 Musicle. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
