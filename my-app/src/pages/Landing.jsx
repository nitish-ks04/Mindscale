import { Link } from "react-router-dom";
import Hero from "../component/landing/hero";
import Features from "../component/landing/feature";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-fadeIn">
        <div className="p-8 md:p-8 text-center flex flex-col items-center">
          {/* Header / Logo Section */}
          <div className="flex items-center gap-3 mb-0 animate-slideInLeft">
            <div className="flex items-center gap-2 font-bold text-3xl tracking-wide">
              <span className="text-teal-400 text-4xl drop-shadow-lg animate-glow">
                🏥
              </span>
              <span className="text-white drop-shadow-md gradient-text">
                MediCare Assistant
              </span>
            </div>
          </div>

          <Hero />

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-8"></div>

          <Features />

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn">
            <Link
              to="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold px-8 shadow-lg shadow-teal-500/30 transform transition-all duration-300 hover:scale-[1.05] hover:shadow-teal-500/50"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-teal-500/50 bg-slate-800/50 text-teal-400 font-semibold px-8 hover:bg-teal-500/10 hover:border-teal-400 transition-all duration-300 transform hover:scale-[1.05]"
            >
              Sign Up
            </Link>
          </div>

          <p className="text-slate-400 text-sm mt-6">
            Your personal AI medical assistant with emotional support 💚
          </p>
        </div>
      </div>
    </div>
  );
}
