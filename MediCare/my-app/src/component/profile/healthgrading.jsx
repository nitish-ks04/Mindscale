import React, { useEffect, useState } from "react";

function HealthGrading() {
    const [gradeData, setGradeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateGrade = () => {
            try {
                // Get all saved session chats
                const sessionChat = sessionStorage.getItem("sessionChat");
                if (!sessionChat) {
                    setLoading(false);
                    return;
                }

                const messages = JSON.parse(sessionChat);

                // Find all bot messages with analysis and scores
                const analyzedMessages = messages.filter(
                    (msg) => msg.sender === "bot" && msg.analysis && msg.analysis.score
                );

                if (analyzedMessages.length === 0) {
                    setLoading(false);
                    return;
                }

                // Get the most recent wellbeing score
                const latestAnalysis = analyzedMessages[analyzedMessages.length - 1].analysis;
                const wellbeingScore = latestAnalysis.score.wellbeing_score || 0;
                const riskBucket = latestAnalysis.score.risk_bucket || "unknown";

                // Calculate average wellbeing score
                const allScores = analyzedMessages.map(
                    (msg) => msg.analysis.score.wellbeing_score || 0
                );
                const avgScore =
                    allScores.reduce((sum, score) => sum + score, 0) / allScores.length;

                // Determine grade (A to E) based on wellbeing score
                // Higher score = better mental health
                let grade = "E";
                let gradeColor = "text-red-400";
                let gradeDescription = "Critical - Seek immediate support";
                let bgGradient = "from-red-600/20 to-red-800/20";

                if (avgScore >= 80) {
                    grade = "A";
                    gradeColor = "text-green-400";
                    gradeDescription = "Excellent mental wellbeing";
                    bgGradient = "from-green-600/20 to-emerald-800/20";
                } else if (avgScore >= 65) {
                    grade = "B";
                    gradeColor = "text-teal-400";
                    gradeDescription = "Good mental health";
                    bgGradient = "from-teal-600/20 to-cyan-800/20";
                } else if (avgScore >= 50) {
                    grade = "C";
                    gradeColor = "text-yellow-400";
                    gradeDescription = "Fair - Monitor your wellbeing";
                    bgGradient = "from-yellow-600/20 to-orange-800/20";
                } else if (avgScore >= 35) {
                    grade = "D";
                    gradeColor = "text-orange-400";
                    gradeDescription = "Poor - Consider professional help";
                    bgGradient = "from-orange-600/20 to-red-800/20";
                }

                setGradeData({
                    grade,
                    gradeColor,
                    gradeDescription,
                    bgGradient,
                    currentScore: Math.round(wellbeingScore),
                    averageScore: Math.round(avgScore),
                    riskLevel: riskBucket,
                    totalAssessments: analyzedMessages.length,
                });
                setLoading(false);
            } catch (error) {
                console.error("Error calculating grade:", error);
                setLoading(false);
            }
        };

        calculateGrade();

        // Update when sessionStorage changes
        window.addEventListener("storage", calculateGrade);
        return () => window.removeEventListener("storage", calculateGrade);
    }, []);

    if (loading) {
        return (
            <div className="bg-slate-900/70 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 shadow-lg shadow-teal-500/20 text-white">
                <div className="font-semibold text-lg mb-4">Mental Health Grade</div>
                <p className="text-slate-400">Loading...</p>
            </div>
        );
    }

    if (!gradeData) {
        return (
            <div className="bg-slate-900/70 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 shadow-lg shadow-teal-500/20 text-white">
                <div className="font-semibold text-lg mb-4">Mental Health Grade</div>
                <p className="text-slate-400 text-sm">
                    Complete chatbot conversations with analysis to see your mental health grade!
                </p>
                <div className="mt-4 text-center">
                    <div className="text-6xl font-bold text-slate-600">—</div>
                    <div className="text-xs text-slate-500 mt-2">No data yet</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`bg-gradient-to-br ${gradeData.bgGradient} backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 shadow-lg shadow-teal-500/20 text-white`}
        >
            <div className="font-semibold text-lg mb-4 flex items-center justify-between">
                <span>Mental Health Grade</span>
                <span className="text-xs bg-slate-800/50 px-2 py-1 rounded-full">
                    {gradeData.totalAssessments} assessments
                </span>
            </div>

            {/* Grade Display */}
            <div className="text-center mb-6">
                <div className={`text-8xl font-bold ${gradeData.gradeColor} mb-2`}>
                    {gradeData.grade}
                </div>
                <div className="text-sm text-slate-300">{gradeData.gradeDescription}</div>
            </div>

            {/* Score Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/60 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Current Score</div>
                    <div className={`text-2xl font-bold ${gradeData.gradeColor}`}>
                        {gradeData.currentScore}
                    </div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Average Score</div>
                    <div className={`text-2xl font-bold ${gradeData.gradeColor}`}>
                        {gradeData.averageScore}
                    </div>
                </div>
            </div>

            {/* Risk Level */}
            <div className="bg-slate-800/60 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Risk Level</div>
                <div className="text-sm font-medium capitalize">
                    {gradeData.riskLevel.replace(/_/g, " ")}
                </div>
            </div>

            {/* Info */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-400">
                    Grade is calculated based on your wellbeing scores from chatbot analysis.
                    Lower scores indicate higher mental health concerns.
                </p>
            </div>
        </div>
    );
}

export default HealthGrading;
