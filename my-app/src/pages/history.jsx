import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../component/navbar";
import Sidebar from "../component/Sidebar";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";

function History() {
  const [items, setItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const token = localStorage.getItem("userInside");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/chat/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = res.data;
        setItems(Array.isArray(d) ? d : d.history || []);
      } catch (err) {
        console.error("Error fetching chat history:", err);
        toast.error("Failed to load chat history ❌");
      }
    };
    if (token) fetchHistory();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/chat/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((chat) => chat._id !== id));
      toast.success("Chat deleted successfully 🗑️");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete chat ❌");
    }
  };

  return (
    <>
      <Navbar
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        isSidebarOpen={sidebarOpen}
      />
      <Sidebar isOpen={sidebarOpen} />

      <div
        className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-10 px-4 flex justify-center transition-all duration-300 ${
          sidebarOpen ? "pl-60" : "pl-4"
        }`}
      >
        <div className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Saved Chat History
          </h1>
          <p className="mb-8 text-gray-300">
            Review or delete your saved medical conversations with the AI
            assistant.
          </p>

          {items.length === 0 ? (
            <p className="text-gray-300">
              No saved chats yet. Messages appear here once saved.
            </p>
          ) : (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 chat-scroll-area">
              {items.map((h) => (
                <div
                  key={h._id}
                  className="bg-slate-700/40 border border-white/10 rounded-2xl p-5 text-white shadow-lg relative group"
                >
                  <button
                    onClick={() => handleDelete(h._id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md"
                  >
                    Delete
                  </button>

                  <div className="text-xs text-gray-400 mb-2">
                    {format(new Date(h.createdAt), "yyyy-MM-dd HH:mm")}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-teal-300 mb-1">You:</p>
                      <p className="text-gray-100 break-words">{h.message}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-cyan-300 mb-1">
                        MediCare AI:
                      </p>
                      <div className="text-gray-200 break-words leading-relaxed prose prose-invert max-w-none">
                        <ReactMarkdown>{h.reply}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default History;
