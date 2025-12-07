import React from "react";
import { Link } from "react-router-dom";

function Activity() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center text-center border border-slate-700 card-hover animate-fadeIn">
        <div className="text-4xl mb-3">💬</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Ask Medical Questions
        </h2>
        <p className="text-slate-300 mb-4">
          Get instant answers about symptoms, conditions, medications, and
          wellness advice.
        </p>
        <Link
          to="/chatbot"
          className="mt-auto px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/30"
        >
          Start Chat
        </Link>
      </div>

      <div
        className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center text-center border border-slate-700 card-hover animate-fadeIn"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="text-4xl mb-3">📊</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Health Dashboard
        </h2>
        <p className="text-slate-300 mb-4">
          Monitor your chat history, saved conversations, and emotional wellness
          tracking.
        </p>
        <Link
          to="/profile"
          className="mt-auto px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/30"
        >
          View Dashboard
        </Link>
      </div>

      <div
        className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center text-center border border-slate-700 card-hover animate-fadeIn"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="text-4xl mb-3">🧠</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          AI Health Insights
        </h2>
        <p className="text-slate-300 mb-4">
          Get personalized health recommendations with sentiment analysis and
          emotional support.
        </p>
        <Link
          to="/history"
          className="mt-auto px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/30"
        >
          Explore Insights
        </Link>
      </div>
    </div>
  );
}

export default Activity;
