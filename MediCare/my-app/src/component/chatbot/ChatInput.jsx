export default function ChatInput({
    input,
    isThinking,
    inputRef,
    onInputChange,
    onKeyDown,
    onKeyUp,
    onSend,
}) {
    return (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-b-3xl border border-slate-800 border-t-0 p-5 shadow-2xl animate-slideInRight">
            <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        rows={1}
                        className="w-full resize-none bg-slate-800/80 border-2 border-slate-700 focus:border-teal-500 rounded-2xl px-5 py-4 pr-12 focus:outline-none text-white placeholder-slate-500 shadow-inner transition-all duration-300"
                        value={input}
                        onChange={onInputChange}
                        onKeyDown={onKeyDown}
                        onKeyUp={onKeyUp}
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
                    onClick={onSend}
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
    );
}
