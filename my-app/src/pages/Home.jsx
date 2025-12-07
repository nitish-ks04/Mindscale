import React, { useState } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/Sidebar";
import Review from "../component/home/review";
import Activity from "../component/home/activity";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Navbar
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        isSidebarOpen={sidebarOpen}
      />
      <Sidebar isOpen={sidebarOpen} />
      <div
        className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-10 px-4 flex justify-center transition-all duration-300 ${
          sidebarOpen ? "pl-60" : "pl-4"
        }`}
      >
        <div className="w-full max-w-6xl bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Medical Assistant Dashboard
          </h1>
          <p className="mb-8 text-slate-300">
            Get personalized medical guidance with sentiment analysis and
            emotional support.
          </p>
          <Activity />
          <Review />
        </div>
      </div>
    </>
  );
}
