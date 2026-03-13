export default function ThinkingAnimation() {
    return (
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
    );
}
