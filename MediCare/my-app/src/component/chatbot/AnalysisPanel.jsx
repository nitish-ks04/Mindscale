export default function AnalysisPanel({ analysis, isLoading, error }) {
    if (isLoading) {
        return (
            <div className="text-slate-300 text-xs mb-3">
                Fetching analysis…
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-300 text-xs mb-3">
                {String(error)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Wellbeing Score */}
            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-3">
                <div className="text-slate-400 mb-1">Wellbeing score</div>
                <div className="text-white font-semibold text-lg">
                    {analysis?.score?.wellbeing_score ?? "—"}
                </div>
                <div className="text-slate-300">
                    Risk:{" "}
                    <span className="font-medium text-teal-300">
                        {analysis?.score?.risk_bucket ?? "—"}
                    </span>
                </div>
            </div>

            {/* NLP Analysis */}
            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-3">
                <div className="text-slate-400 mb-2">NLP</div>
                <div className="space-y-1 text-slate-200">
                    <div>Sentiment: {analysis?.nlp?.sentiment_label ?? "—"}</div>
                    <div>Negations: {analysis?.nlp?.negation_count ?? "—"}</div>
                    <div>Pronoun ratio: {analysis?.nlp?.pronoun_ratio ?? "—"}</div>
                    <div>Intensity: {analysis?.nlp?.emotional_intensity ?? "—"}</div>
                </div>
            </div>

            {/* Emotion Segmentation */}
            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-3">
                <div className="text-slate-400 mb-2">Emotion segmentation</div>
                <div className="text-slate-200">
                    Dominant:{" "}
                    <span className="font-medium text-cyan-300">
                        {analysis?.emotion_segmentation?.summary?.dominant_emotion ?? "—"}
                    </span>
                </div>
                <div className="text-slate-300 mt-1">
                    {analysis?.emotion_segmentation?.summary?.counts
                        ? Object.entries(analysis.emotion_segmentation.summary.counts)
                            .map(([k, v]) => `${k}:${v}`)
                            .join("  ")
                        : "—"}
                </div>
            </div>

            {/* Keystroke Dynamics */}
            <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-3">
                <div className="text-slate-400 mb-2">Keystroke dynamics</div>
                <div className="space-y-1 text-slate-200">
                    {analysis?.keystroke?.features ? (
                        <>
                            <div>Keys: {analysis.keystroke.features.n_keys ?? "—"}</div>
                            <div>Pauses: {analysis.keystroke.features.pause_count ?? "—"}</div>
                            <div>
                                Avg hold: {analysis.keystroke.features.hold_ms_mean
                                    ? Math.round(analysis.keystroke.features.hold_ms_mean) + "ms"
                                    : "—"}
                            </div>
                            <div>
                                Backspace: {analysis.keystroke.features.backspace_rate
                                    ? (analysis.keystroke.features.backspace_rate * 100).toFixed(1) + "%"
                                    : "—"}
                            </div>
                        </>
                    ) : (
                        <div className="text-slate-400">Not available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
