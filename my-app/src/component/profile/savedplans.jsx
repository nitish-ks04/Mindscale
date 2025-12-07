import React, { useEffect, useState } from "react";
import axios from "axios";

function SavedPlans() {
  const [savedChats, setSavedChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedChats = async () => {
      try {
        const token = localStorage.getItem("userInside");
        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/chat/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Get 3 most recent saved chats
        const saved = response.data.slice(0, 3).map((chat) => {
          // Create title from message
          const words = chat.message.split(" ");
          const title =
            words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");

          return {
            title: title || "Medical Topic",
            date: new Date(chat.createdAt).toISOString().split("T")[0],
          };
        });

        setSavedChats(saved);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching saved chats:", error);
        setLoading(false);
      }
    };

    fetchSavedChats();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 shadow-lg shadow-teal-500/20 text-white">
        <div className="font-semibold text-lg mb-4">Saved Health Topics</div>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (savedChats.length === 0) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 shadow-lg shadow-teal-500/20 text-white">
        <div className="font-semibold text-lg mb-4">Saved Health Topics</div>
        <p className="text-slate-400 text-sm">
          Save chats from your conversations to see them here!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 shadow-lg shadow-teal-500/20 text-white">
      <div className="font-semibold text-lg mb-4">Saved Health Topics</div>
      <div className="flex flex-col gap-3">
        {savedChats.map((plan, idx) => (
          <div
            key={idx}
            className="border border-teal-400/20 rounded-lg p-3 bg-slate-800/60 hover:bg-slate-800/80 transition-colors"
          >
            <div className="font-medium">{plan.title}</div>
            <div className="text-xs text-gray-400">Last saved: {plan.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedPlans;
