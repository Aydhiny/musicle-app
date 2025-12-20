import Link from "next/link";
import { Music2 } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-6 w-full max-w-7xl mx-auto z-50 relative">
      <div className="flex items-center gap-2">
        <Music2 className="w-8 h-8 text-white" />
        <span className="text-xl font-bold tracking-wider text-white">MUSICLE</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        <Link href="#" className="hover:text-white transition-colors">
          Feed
        </Link>
        <Link href="#" className="hover:text-white transition-colors">
          Blog
        </Link>
        <Link href="#" className="hover:text-white transition-colors">
          About
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-sm font-medium text-white hover:text-gray-300 transition-colors">Log In</button>
        <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
          Get Started
        </button>
      </div>
    </nav>
  );
}
