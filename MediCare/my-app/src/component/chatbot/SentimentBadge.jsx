const SENTIMENT_CONFIG = {
    positive: { emoji: "😊", label: "Positive", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    sad: { emoji: "😢", label: "Sad", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    anxious: { emoji: "😰", label: "Anxious", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    frustrated: { emoji: "😤", label: "Frustrated", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    "in pain": { emoji: "😣", label: "In Pain", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    calm: { emoji: "😌", label: "Calm", color: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
    neutral: { emoji: "😐", label: "Neutral", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

export default function SentimentBadge({ emotion }) {
    const config = SENTIMENT_CONFIG[emotion] || SENTIMENT_CONFIG.neutral;

    return (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${config.color}`}>
            {config.emoji} {config.label}
        </span>
    );
}
