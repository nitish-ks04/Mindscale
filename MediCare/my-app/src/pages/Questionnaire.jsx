import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../component/navbar";
import Sidebar from "../component/Sidebar";

export default function Questionnaire() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
    const [questionnaire, setQuestionnaire] = useState(null);
    const [responses, setResponses] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const PY_API_BASE = "http://localhost:8000";

    const questionnaires = [
        {
            id: "phq9",
            title: "PHQ-9 Depression Screening",
            description: "Patient Health Questionnaire for depression assessment",
            icon: "😔",
            color: "from-blue-600 to-indigo-600",
        },
        {
            id: "gad7",
            title: "GAD-7 Anxiety Screening",
            description: "Generalized Anxiety Disorder assessment",
            icon: "😰",
            color: "from-yellow-600 to-orange-600",
        },
    ];

    const scaleOptions = [
        { label: "Not at all", value: 0 },
        { label: "Several days", value: 1 },
        { label: "More than half the days", value: 2 },
        { label: "Nearly every day", value: 3 },
    ];

    const loadQuestionnaire = async (qid) => {
        try {
            setLoading(true);
            const res = await axios.get(`${PY_API_BASE}/mental/questionnaires/${qid}`);
            setQuestionnaire(res.data);
            setSelectedQuestionnaire(qid);
            setResponses({});
            setResult(null);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load questionnaire", { theme: "colored" });
            setLoading(false);
        }
    };

    const handleResponseChange = (questionId, value) => {
        setResponses((prev) => ({ ...prev, [questionId]: value }));
    };

    const submitQuestionnaire = async () => {
        if (!questionnaire) return;

        // Check if all questions are answered
        const allAnswered = questionnaire.questions.every((q) => q.id in responses);
        if (!allAnswered) {
            toast.warning("Please answer all questions", { theme: "colored" });
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${PY_API_BASE}/mental/questionnaires/score`, {
                questionnaire_id: selectedQuestionnaire,
                responses: responses,
            });
            setResult(res.data);
            setLoading(false);
            toast.success("Questionnaire submitted successfully!", { theme: "colored" });
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit questionnaire", { theme: "colored" });
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case "minimal":
                return "text-green-400 bg-green-500/20 border-green-500/50";
            case "mild":
                return "text-teal-400 bg-teal-500/20 border-teal-500/50";
            case "moderate":
                return "text-yellow-400 bg-yellow-500/20 border-yellow-500/50";
            case "moderately_severe":
                return "text-orange-400 bg-orange-500/20 border-orange-500/50";
            case "severe":
                return "text-red-400 bg-red-500/20 border-red-500/50";
            default:
                return "text-slate-400 bg-slate-500/20 border-slate-500/50";
        }
    };

    const resetQuestionnaire = () => {
        setSelectedQuestionnaire(null);
        setQuestionnaire(null);
        setResponses({});
        setResult(null);
    };

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
                <div className="w-full max-w-5xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-t-3xl border border-slate-800 border-b-0 p-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white gradient-text">
                                    Mental Health Questionnaires
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Complete standardized assessments for depression and anxiety
                                </p>
                            </div>
                            {selectedQuestionnaire && (
                                <button
                                    onClick={resetQuestionnaire}
                                    className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-teal-500/50 text-white px-4 py-2 rounded-xl transition-all"
                                >
                                    ← Back
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-slate-900/70 backdrop-blur-xl border border-slate-800 border-t-0 rounded-b-3xl shadow-2xl overflow-y-auto p-6">
                        {!selectedQuestionnaire ? (
                            /* Questionnaire Selection */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {questionnaires.map((q) => (
                                    <div
                                        key={q.id}
                                        onClick={() => loadQuestionnaire(q.id)}
                                        className="bg-slate-800/60 border border-slate-700 hover:border-teal-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-xl hover:shadow-teal-500/20"
                                    >
                                        <div className="text-5xl mb-4">{q.icon}</div>
                                        <h3 className="text-xl font-bold text-white mb-2">{q.title}</h3>
                                        <p className="text-slate-400 text-sm mb-4">{q.description}</p>
                                        <div
                                            className={`inline-block px-4 py-2 bg-gradient-to-r ${q.color} text-white rounded-lg text-sm font-medium`}
                                        >
                                            Start Assessment
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : loading && !questionnaire ? (
                            <div className="text-center text-slate-400 mt-10">
                                Loading questionnaire...
                            </div>
                        ) : questionnaire && !result ? (
                            /* Questionnaire Form */
                            <div>
                                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {questionnaire.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm">{questionnaire.instructions}</p>
                                </div>

                                <div className="space-y-4">
                                    {questionnaire.questions.map((question, idx) => (
                                        <div
                                            key={question.id}
                                            className="bg-slate-800/60 border border-slate-700 rounded-xl p-5"
                                        >
                                            <div className="text-white font-medium mb-3">
                                                {idx + 1}. {question.text}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {scaleOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => handleResponseChange(question.id, option.value)}
                                                        className={`px-3 py-2 rounded-lg text-sm transition-all ${responses[question.id] === option.value
                                                                ? "bg-teal-600 text-white border-2 border-teal-400"
                                                                : "bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-700"
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={submitQuestionnaire}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-600 text-white px-8 py-3 rounded-xl shadow-lg transition-all font-medium hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                                    >
                                        {loading ? "Submitting..." : "Submit Assessment"}
                                    </button>
                                </div>
                            </div>
                        ) : result ? (
                            /* Results */
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 text-center">
                                    <div className="text-6xl mb-4">📊</div>
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        Assessment Complete
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-900/60 rounded-xl p-4">
                                            <div className="text-slate-400 text-sm mb-2">Raw Score</div>
                                            <div className="text-3xl font-bold text-white">
                                                {result.raw_score}
                                            </div>
                                        </div>
                                        <div className="bg-slate-900/60 rounded-xl p-4">
                                            <div className="text-slate-400 text-sm mb-2">Severity Level</div>
                                            <div
                                                className={`text-xl font-bold capitalize px-4 py-2 rounded-lg border ${getSeverityColor(
                                                    result.severity
                                                )}`}
                                            >
                                                {result.severity.replace(/_/g, " ")}
                                            </div>
                                        </div>
                                    </div>

                                    {result.flags && Object.keys(result.flags).length > 0 && (
                                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                                            <div className="text-red-400 font-semibold mb-2">⚠️ Important Flags</div>
                                            <div className="text-slate-300 text-sm">
                                                {Object.entries(result.flags)
                                                    .filter(([, v]) => v)
                                                    .map(([k]) => (
                                                        <div key={k}>{k.replace(/_/g, " ")}</div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-slate-900/60 rounded-xl p-4 mb-6">
                                        <p className="text-slate-400 text-sm">
                                            This is a screening tool, not a diagnostic test. If you're experiencing
                                            symptoms, please consult with a mental health professional.
                                        </p>
                                    </div>

                                    <button
                                        onClick={resetQuestionnaire}
                                        className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-6 py-2 rounded-xl transition-all"
                                    >
                                        Take Another Assessment
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}
