import React, { useEffect, useState } from "react";
import axios from "axios";

function ProfileCard({ user }) {
  const [stats, setStats] = useState({
    consultations: 0,
    savedChats: 0,
    emotionalSupport: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("userInside");
        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/chat/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const chatHistory = response.data;

        // Calculate stats from real data
        const totalChats = chatHistory.length;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const savedThisMonth = chatHistory.filter((chat) => {
          const chatDate = new Date(chat.createdAt);
          return (
            chatDate.getMonth() === currentMonth &&
            chatDate.getFullYear() === currentYear
          );
        }).length;

        // Count emotional support sessions (chats with keywords)
        const emotionalKeywords = [
          "anxious",
          "worried",
          "sad",
          "depressed",
          "stressed",
          "afraid",
          "nervous",
        ];
        const emotionalChats = chatHistory.filter((chat) =>
          emotionalKeywords.some((keyword) =>
            chat.message.toLowerCase().includes(keyword)
          )
        ).length;

        setStats({
          consultations: totalChats,
          savedChats: savedThisMonth,
          emotionalSupport: emotionalChats,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (!user) return <p className="text-gray-300">Loading profile...</p>;

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-teal-500/20">
      <img
        src={
          user.avatar ||
          "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(user.name) +
            "&background=14b8a6&color=fff"
        }
        alt="avatar"
        className="w-24 h-24 rounded-full object-cover border-2 border-teal-500 shadow-md"
      />
      <div className="flex-1">
        <div className="font-bold text-lg text-white">{user.name}</div>
        <div className="text-gray-400">{user.email}</div>
        <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full text-xs font-semibold shadow-md">
          {user.role || "Patient"}
        </span>
      </div>
      <div className="flex gap-6 mt-4 md:mt-0 text-white">
        <div className="text-center">
          <div className="font-bold text-xl text-teal-400">
            {loading ? "..." : stats.consultations}
          </div>
          <div className="text-xs text-gray-400">
            Consultations
            <br />
            Total
          </div>
        </div>
        <div className="text-center">
          <div className="font-bold text-xl text-teal-400">
            {loading ? "..." : stats.savedChats}
          </div>
          <div className="text-xs text-gray-400">
            Saved Chats
            <br />
            This month
          </div>
        </div>
        <div className="text-center">
          <div className="font-bold text-xl text-teal-400">
            {loading ? "..." : stats.emotionalSupport}
          </div>
          <div className="text-xs text-gray-400">
            Emotional
            <br />
            Support Sessions
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
