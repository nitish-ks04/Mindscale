import React, { useEffect, useState } from "react";
import Navbar from "../component/navbar";
import ProfileCard from "../component/profile/profilecard";
import RecentActivity from "../component/profile/recentactivity";
import SavedPlans from "../component/profile/savedplans";
import AccountSettings from "../component/profile/accountsetting";
import Sidebar from "../component/Sidebar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentuser"));
    if (storedUser) setUser(storedUser);
  }, []);

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
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="mb-8 text-gray-300">
            Manage your account and review your medical consultation activity.
          </p>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-8">
              <ProfileCard user={user} />
              <RecentActivity />
            </div>
            <div className="flex flex-col gap-8 w-full md:w-80">
              <SavedPlans />
              {/* <AccountSettings /> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
