export default function ChatHeader({ onNewChat }) {
    return (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-t-3xl border border-slate-800 border-b-0 p-5 shadow-2xl animate-slideInLeft">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30 animate-glow">
                        <span className="text-2xl">🏥</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white gradient-text">
                            Mindscale AI
                        </h2>
                        <p className="text-slate-400 text-xs flex items-center gap-2 mt-0.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online • Powered by Gemini AI
                        </p>
                    </div>
                </div>
                <button
                    onClick={onNewChat}
                    className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-teal-500/50 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all duration-300 font-medium flex items-center gap-2 hover:scale-105"
                    title="Start a new conversation"
                >
                    <span className="text-lg">✨</span>
                    <span className="hidden sm:inline">New Chat</span>
                </button>
            </div>
        </div>
    );
}
