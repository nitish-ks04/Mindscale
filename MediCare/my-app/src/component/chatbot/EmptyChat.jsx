export default function EmptyChat() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-teal-500/30">
                <span className="text-5xl">🏥</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
                Welcome to Mindscale AI
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
    );
}
