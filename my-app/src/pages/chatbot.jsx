import React, { useState, useRef, useEffect } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/Sidebar";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const savedChat = sessionStorage.getItem("sessionChat");
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed)) setMessages(parsed);
        console.debug("[Chat] Restored chat with", parsed.length, "messages");
      } catch (e) {
        console.error("Error parsing chat history:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("userInside");
    if (!token) {
      sessionStorage.removeItem("sessionChat");
      setMessages([]);
      console.debug("[Chat] Cleared sessionChat on logout");
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    sessionStorage.setItem("sessionChat", JSON.stringify(newMessages));
    setInput("");
    setIsThinking(true);

    try {
      const token = localStorage.getItem("userInside");
      if (!token) {
        toast.warning("Please log in to use the chatbot.", {
          theme: "colored",
        });
        setIsThinking(false);
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsThinking(false);
      const botMsg = {
        sender: "bot",
        text: res.data.reply,
        sentiment: res.data.sentiment, // Store sentiment data
      };
      const updated = [...newMessages, botMsg];
      setMessages(updated);
      sessionStorage.setItem("sessionChat", JSON.stringify(updated));
      console.debug("[Chat] Saved sessionChat, count:", updated.length);
    } catch (err) {
      console.error(err);
      setIsThinking(false);
      const errMsg = { sender: "bot", text: "⚠️ Error connecting to chatbot." };
      const updated = [...newMessages, errMsg];
      setMessages(updated);
      sessionStorage.setItem("sessionChat", JSON.stringify(updated));
      toast.error("Failed to connect to chatbot.", { theme: "colored" });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    sessionStorage.removeItem("sessionChat");
    toast.info("🆕 New chat started!", {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "colored",
      style: {
        background: "linear-gradient(to right, #14b8a6, #06b6d4)",
        color: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      },
    });
    console.debug("[Chat] Started new chat");
  };

  const handleSaveChat = async (index) => {
    try {
      const token = localStorage.getItem("userInside");
      if (!token) {
        toast.warning("Please log in to save chats.", { theme: "colored" });
        return;
      }

      const botMsg = messages[index];
      const userMsg = [...messages]
        .slice(0, index)
        .reverse()
        .find((m) => m.sender === "user");

      if (!botMsg || !userMsg) {
        toast.error("No valid message pair to save.", { theme: "colored" });
        return;
      }

      await axios.post(
        "http://localhost:5000/api/chat/save",
        { message: userMsg.text, reply: botMsg.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("💾 Chat saved successfully!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
        style: {
          background: "linear-gradient(to right, #14b8a6, #06b6d4)",
          color: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        },
      });
    } catch (err) {
      console.error("Error saving chat:", err);
      toast.error("❌ Failed to save chat.", {
        position: "bottom-right",
        theme: "colored",
        style: {
          background: "linear-gradient(to right, #ef4444, #dc2626)",
          color: "white",
          borderRadius: "10px",
        },
      });
    }
  };

  return (
    <>
      <Navbar
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        isSidebarOpen={sidebarOpen}
      />
      <Sidebar isOpen={sidebarOpen} />

      <div
        className={`fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-4 px-4 flex justify-center transition-all duration-300 ${
          sidebarOpen ? "pl-60" : "pl-4"
        }`}
      >
        <div className="w-full max-w-6xl flex flex-col overflow-hidden">
          {/* Modern Header with Glass Effect */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-t-3xl border border-slate-800 border-b-0 p-5 shadow-2xl animate-slideInLeft">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30 animate-glow">
                  <span className="text-2xl">🏥</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white gradient-text">
                    MediScale AI 
                  </h2>
                  <p className="text-slate-400 text-xs flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online • Powered by Gemini AI
                  </p>
                </div>
              </div>
              <button
                onClick={handleNewChat}
                className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-teal-500/50 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all duration-300 font-medium flex items-center gap-2 hover:scale-105"
                title="Start a new conversation"
              >
                <span className="text-lg">✨</span>
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </div>

          {/* Chat Container with Modern Design */}
          <div className="flex-1 bg-slate-900/70 backdrop-blur-xl border border-slate-800 border-t-0 shadow-2xl overflow-hidden flex flex-col">
            <div
              ref={chatContainerRef}
              className="chat-scroll-area flex-1 overflow-y-auto overflow-x-hidden px-6 py-6"
              style={{
                maxHeight: "calc(100vh - 280px)",
              }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-teal-500/30">
                    <span className="text-5xl">🏥</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Welcome to MediCare AI
                  </h3>
                  <p className="text-slate-400 max-w-md mb-6">
                    Your personal AI medical assistant with emotional
                    intelligence. Ask about symptoms, conditions, or wellness
                    advice.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-teal-500/50 transition-all cursor-pointer">
                      <div className="text-2xl mb-2">💊</div>
                      <p className="text-sm text-slate-300">Medication Info</p>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-teal-500/50 transition-all cursor-pointer">
                      <div className="text-2xl mb-2">🩺</div>
                      <p className="text-sm text-slate-300">Symptom Check</p>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-teal-500/50 transition-all cursor-pointer">
                      <div className="text-2xl mb-2">💚</div>
                      <p className="text-sm text-slate-300">Wellness Tips</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex mb-6 animate-fadeIn ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.sender === "bot" && (
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 shadow-lg shadow-teal-500/30">
                          <span className="text-xl">🏥</span>
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] break-words overflow-hidden ${
                          msg.sender === "user"
                            ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl rounded-tr-sm px-5 py-4 shadow-xl"
                            : "bg-slate-800/90 backdrop-blur-sm border border-slate-700 text-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl"
                        }`}
                      >
                        {msg.sender === "bot" && (
                          <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-teal-400">
                                MediCare AI
                              </span>
                              {msg.sentiment && (
                                <span
                                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                    msg.sentiment.emotion === "positive"
                                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                      : msg.sentiment.emotion === "sad"
                                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                      : msg.sentiment.emotion === "anxious"
                                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                      : msg.sentiment.emotion === "frustrated"
                                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                      : msg.sentiment.emotion === "in pain"
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : msg.sentiment.emotion === "calm"
                                      ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                                      : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                                  }`}
                                >
                                  {msg.sentiment.emotion === "positive"
                                    ? "😊 Positive"
                                    : msg.sentiment.emotion === "sad"
                                    ? "😢 Sad"
                                    : msg.sentiment.emotion === "anxious"
                                    ? "😰 Anxious"
                                    : msg.sentiment.emotion === "frustrated"
                                    ? "😤 Frustrated"
                                    : msg.sentiment.emotion === "in pain"
                                    ? "😣 In Pain"
                                    : msg.sentiment.emotion === "calm"
                                    ? "😌 Calm"
                                    : "😐 Neutral"}
                                </span>
                              )}
                            </div>
                            <button
                              className="text-xs bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-teal-400 px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                              onClick={() => handleSaveChat(i)}
                            >
                              💾
                            </button>
                          </div>
                        )}
                        <div className="break-words whitespace-pre-wrap overflow-x-hidden leading-relaxed text-sm">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                      {msg.sender === "user" && (
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center ml-3 flex-shrink-0 border border-slate-600">
                          <span className="text-xl">👤</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Modern Thinking Animation */}
                  {isThinking && (
                    <div className="flex mb-6 justify-start animate-fadeIn">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 shadow-lg shadow-teal-500/30 animate-pulse">
                        <span className="text-xl">🏥</span>
                      </div>
                      <div className="max-w-[75%] bg-slate-800/90 backdrop-blur-sm border border-slate-700 text-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <span
                              className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></span>
                            <span
                              className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></span>
                            <span
                              className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></span>
                          </div>
                          <span className="text-sm text-slate-400">
                            Analyzing with AI...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Modern Input Area */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-b-3xl border border-slate-800 border-t-0 p-5 shadow-2xl animate-slideInRight">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  rows={1}
                  className="w-full resize-none bg-slate-800/80 border-2 border-slate-700 focus:border-teal-500 rounded-2xl px-5 py-4 pr-12 focus:outline-none text-white placeholder-slate-500 shadow-inner transition-all duration-300"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your symptoms or ask a health question..."
                  disabled={isThinking}
                  style={{ maxHeight: "120px" }}
                />
                <div className="absolute right-4 top-4 text-slate-600 text-xs">
                  {input.length > 0 && `${input.length} chars`}
                </div>
              </div>
              <button
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-600 text-white p-4 rounded-2xl shadow-lg shadow-teal-500/30 transition-all duration-300 font-medium hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
                onClick={sendMessage}
                disabled={isThinking || !input.trim()}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              AI can make mistakes. Always consult a healthcare professional for
              medical advice.
            </p>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </>
  );
}
