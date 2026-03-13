import ReactMarkdown from "react-markdown";
import SentimentBadge from "./SentimentBadge";
import AnalysisPanel from "./AnalysisPanel";

export default function ChatMessage({
    message,
    index,
    isExpanded,
    isAnalysisLoading,
    analysisError,
    onToggleAnalysis,
    onSaveChat,
}) {
    const isBot = message.sender === "bot";
    const isUser = message.sender === "user";

    return (
        <div className={`flex mb-6 animate-fadeIn ${isUser ? "justify-end" : "justify-start"}`}>
            {/* Bot Avatar */}
            {isBot && (
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 shadow-lg shadow-teal-500/30">
                    <span className="text-xl">🏥</span>
                </div>
            )}

            {/* Message Content */}
            <div
                className={`max-w-[75%] break-words overflow-hidden ${isUser
                        ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl rounded-tr-sm px-5 py-4 shadow-xl"
                        : "bg-slate-800/90 backdrop-blur-sm border border-slate-700 text-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl"
                    }`}
            >
                {/* Bot Header */}
                {isBot && (
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-teal-400">Mindscale AI</span>
                            {message.sentiment && <SentimentBadge emotion={message.sentiment.emotion} />}
                        </div>
                        <button
                            className="text-xs bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-teal-400 px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                            onClick={() => onSaveChat(index)}
                        >
                            💾
                        </button>
                    </div>
                )}

                {/* Message Text */}
                <div className="break-words whitespace-pre-wrap overflow-x-hidden leading-relaxed text-sm">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>

                {/* Analysis Section */}
                {isBot && (
                    <div className="mt-4 pt-4 border-t border-slate-700/70">
                        <button
                            onClick={() => onToggleAnalysis(index)}
                            className="text-xs bg-slate-700/40 hover:bg-slate-700/60 border border-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition-all"
                            title="Show NLP + emotion analysis"
                        >
                            {isExpanded ? "Hide analysis" : "Show analysis"}
                        </button>

                        {isExpanded && (
                            <div className="mt-3">
                                <AnalysisPanel
                                    analysis={message.analysis}
                                    isLoading={isAnalysisLoading}
                                    error={analysisError}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* User Avatar */}
            {isUser && (
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center ml-3 flex-shrink-0 border border-slate-600">
                    <span className="text-xl">👤</span>
                </div>
            )}
        </div>
    );
}
