import { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatHeader from "../component/chatbot/ChatHeader";
import EmptyChat from "../component/chatbot/EmptyChat";
import ChatMessage from "../component/chatbot/ChatMessage";
import ThinkingAnimation from "../component/chatbot/ThinkingAnimation";
import ChatInput from "../component/chatbot/ChatInput";
import { useChatLogic } from "../component/chatbot/useChatLogic";

export default function Chatbot() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    messages,
    input,
    isThinking,
    expandedAnalysis,
    analysisLoading,
    analysisError,
    inputRef,
    chatContainerRef,
    setInput,
    handleKeyDown,
    handleKeyUp,
    handleNewChat,
    handleSaveChat,
    toggleAnalysis,
  } = useChatLogic();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <Navbar
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        isSidebarOpen={sidebarOpen}
      />
      <Sidebar isOpen={sidebarOpen} />

      <div
        className={`fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-4 px-4 flex justify-center transition-all duration-300 ${sidebarOpen ? "pl-60" : "pl-4"
          }`}
      >
        <div className="w-full max-w-6xl flex flex-col overflow-hidden">
          <ChatHeader onNewChat={handleNewChat} />

          <div className="flex-1 bg-slate-900/70 backdrop-blur-xl border border-slate-800 border-t-0 shadow-2xl overflow-hidden flex flex-col">
            <div
              ref={chatContainerRef}
              className="chat-scroll-area flex-1 overflow-y-auto overflow-x-hidden px-6 py-6"
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              {messages.length === 0 ? (
                <EmptyChat />
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <ChatMessage
                      key={i}
                      message={msg}
                      index={i}
                      isExpanded={expandedAnalysis.has(i)}
                      isAnalysisLoading={analysisLoading.has(i)}
                      analysisError={analysisError[i]}
                      onToggleAnalysis={toggleAnalysis}
                      onSaveChat={handleSaveChat}
                    />
                  ))}
                  {isThinking && <ThinkingAnimation />}
                </>
              )}
            </div>
          </div>

          <ChatInput
            input={input}
            isThinking={isThinking}
            inputRef={inputRef}
            onInputChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onSend={handleNewChat}
          />
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </>
  );
}
