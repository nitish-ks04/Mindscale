import React, { useEffect, useState } from "react";
import axios from "axios";

function RecentActivity() {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const token = localStorage.getItem("userInside");
        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/chat/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Get the 3 most recent chats
        const recent = response.data.slice(0, 3).map((chat) => {
          // Detect emotion from message
          const message = chat.message.toLowerCase();
          let emotion = "Neutral";
          let labelColor = "bg-slate-600";

          if (
            message.includes("anxious") ||
            message.includes("worried") ||
            message.includes("nervous")
          ) {
            emotion = "Anxious";
            labelColor = "bg-yellow-600";
          } else if (
            message.includes("sad") ||
            message.includes("depressed") ||
            message.includes("down")
          ) {
            emotion = "Sad";
            labelColor = "bg-blue-600";
          } else if (
            message.includes("pain") ||
            message.includes("hurt") ||
            message.includes("ache")
          ) {
            emotion = "In Pain";
            labelColor = "bg-red-600";
          } else if (
            message.includes("angry") ||
            message.includes("frustrated") ||
            message.includes("upset")
          ) {
            emotion = "Frustrated";
            labelColor = "bg-orange-600";
          } else if (
            message.includes("happy") ||
            message.includes("good") ||
            message.includes("great")
          ) {
            emotion = "Positive";
            labelColor = "bg-green-600";
          } else if (message.includes("calm") || message.includes("relaxed")) {
            emotion = "Calm";
            labelColor = "bg-teal-600";
          }

          // Create title from first few words of message
          const words = chat.message.split(" ");
          const title =
            words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");

          return {
            title: title || "Medical Consultation",
            date: new Date(chat.createdAt).toISOString().split("T")[0],
            emotion,
            label: "Consultation",
            labelColor,
            color: labelColor.replace("bg-", "bg-").replace("-600", "-400"),
          };
        });

        setRecentChats(recent);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 shadow-lg shadow-teal-500/20 text-white">
        <div className="font-semibold text-lg mb-4">
          Recent Medical Consultations
        </div>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (recentChats.length === 0) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 shadow-lg shadow-teal-500/20 text-white">
        <div className="font-semibold text-lg mb-4">
          Recent Medical Consultations
        </div>
        <p className="text-slate-400">
          No consultations yet. Start a chat to see your activity here!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 shadow-lg shadow-teal-500/20 text-white">
      <div className="font-semibold text-lg mb-4">
        Recent Medical Consultations
      </div>
      <div className="flex flex-col gap-4">
        {recentChats.map((item, idx) => (
          <div
            key={idx}
            className="border border-teal-400/20 rounded-xl p-4 bg-slate-800/60 hover:bg-slate-800/80 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{item.title}</div>
              <span
                className={`text-xs px-2 py-1 rounded-full text-white ${item.labelColor} shadow-md`}
              >
                {item.label}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>Consulted on {item.date}</span>
              <span className="font-bold text-teal-300">
                Emotion: {item.emotion}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`${item.color} h-2 rounded-full transition-all duration-300`}
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
