import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CHAT_API_BASE = "http://localhost:5000";
const PY_API_BASE = "http://localhost:8000";

export function useChatLogic() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [expandedAnalysis, setExpandedAnalysis] = useState(() => new Set());
    const [analysisLoading, setAnalysisLoading] = useState(() => new Set());
    const [analysisError, setAnalysisError] = useState(() => ({}));
    const [keystrokeEvents, setKeystrokeEvents] = useState([]);
    const inputRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Load saved chat on mount
    useEffect(() => {
        const savedChat = sessionStorage.getItem("sessionChat");
        if (savedChat) {
            try {
                const parsed = JSON.parse(savedChat);
                if (Array.isArray(parsed)) setMessages(parsed);
            } catch (e) {
                console.error("Error parsing chat history:", e);
            }
        }
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Clear chat on logout
    useEffect(() => {
        const token = localStorage.getItem("userInside");
        if (!token) {
            sessionStorage.removeItem("sessionChat");
            setMessages([]);
        }
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { sender: "user", text: input, keystrokeEvents: [...keystrokeEvents] };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        sessionStorage.setItem("sessionChat", JSON.stringify(newMessages));
        setInput("");
        setKeystrokeEvents([]);
        setIsThinking(true);

        try {
            const token = localStorage.getItem("userInside");
            if (!token) {
                toast.warning("Please log in to use the chatbot.", { theme: "colored" });
                setIsThinking(false);
                return;
            }

            const res = await axios.post(
                `${CHAT_API_BASE}/api/chat`,
                { message: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setIsThinking(false);

            const botMsg = {
                sender: "bot",
                text: res.data.reply,
                sentiment: res.data.sentiment,
                analysis: null,
            };
            const updated = [...newMessages, botMsg];
            setMessages(updated);
            sessionStorage.setItem("sessionChat", JSON.stringify(updated));
        } catch (err) {
            console.error(err);
            setIsThinking(false);
            const errMsg = { sender: "bot", text: "⚠️ Error connecting to chatbot." };
            const updated = [...newMessages, errMsg];
            setMessages(updated);
            sessionStorage.setItem("sessionChat", JSON.stringify(updated));
            toast.error("Failed to connect to chatbot.", { theme: "colored" });
        }
    };

    const handleKeyDown = (e) => {
        setKeystrokeEvents((prev) => [
            ...prev,
            { t_ms: Date.now(), key: e.key, type: "down" },
        ]);

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleKeyUp = (e) => {
        setKeystrokeEvents((prev) => [
            ...prev,
            { t_ms: Date.now(), key: e.key, type: "up" },
        ]);
    };

    const handleNewChat = () => {
        setMessages([]);
        sessionStorage.removeItem("sessionChat");
        toast.info("🆕 New chat started!", {
            position: "top-center",
            autoClose: 1500,
            hideProgressBar: true,
            theme: "colored",
            style: {
                background: "linear-gradient(to right, #14b8a6, #06b6d4)",
                color: "white",
                borderRadius: "10px",
            },
        });
    };

    const handleSaveChat = async (index) => {
        try {
            const token = localStorage.getItem("userInside");
            if (!token) {
                toast.warning("Please log in to save chats.", { theme: "colored" });
                return;
            }

            const botMsg = messages[index];
            const userMsg = [...messages].slice(0, index).reverse().find((m) => m.sender === "user");

            if (!botMsg || !userMsg) {
                toast.error("No valid message pair to save.", { theme: "colored" });
                return;
            }

            await axios.post(
                `${CHAT_API_BASE}/api/chat/save`,
                { message: userMsg.text, reply: botMsg.text },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("💾 Chat saved successfully!", {
                position: "top-center",
                autoClose: 2000,
                theme: "colored",
                style: {
                    background: "linear-gradient(to right, #14b8a6, #06b6d4)",
                    color: "white",
                    borderRadius: "10px",
                },
            });
        } catch (err) {
            console.error("Error saving chat:", err);
            toast.error("❌ Failed to save chat.", { theme: "colored" });
        }
    };

    const toggleAnalysis = async (index) => {
        const willExpand = !expandedAnalysis.has(index);
        setExpandedAnalysis((prev) => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
        if (willExpand) await ensureAnalysis(index);
    };

    const findPreviousUserText = (botIndex) => {
        for (let j = botIndex - 1; j >= 0; j--) {
            if (messages[j]?.sender === "user" && messages[j]?.text) {
                return { text: messages[j].text, keystrokeEvents: messages[j].keystrokeEvents || [] };
            }
        }
        return null;
    };

    const ensureAnalysis = async (botIndex) => {
        const msg = messages[botIndex];
        if (!msg || msg.sender !== "bot" || msg.analysis) return;

        const userData = findPreviousUserText(botIndex);
        if (!userData) {
            setAnalysisError((prev) => ({ ...prev, [botIndex]: "No matching user message found." }));
            return;
        }

        const { text: userText, keystrokeEvents } = userData;
        setAnalysisError((prev) => ({ ...prev, [botIndex]: null }));
        setAnalysisLoading((prev) => new Set(prev).add(botIndex));

        try {
            const [nlpRes, emoRes] = await Promise.all([
                axios.post(`${PY_API_BASE}/analyze-text`, { text: userText }),
                axios.post(`${PY_API_BASE}/mental/emotion-segmentation`, { text: userText }),
            ]);

            let keystroke = null;
            if (keystrokeEvents && keystrokeEvents.length >= 10) {
                try {
                    const keystrokeRes = await axios.post(`${PY_API_BASE}/mental/keystroke-analysis`, {
                        events: keystrokeEvents,
                    });
                    keystroke = keystrokeRes.data;
                } catch (err) {
                    console.warn("Keystroke analysis failed:", err);
                }
            }

            const scoreRes = await axios.post(`${PY_API_BASE}/mental/score`, {
                sentiment: msg.sentiment ?? null,
                nlp: nlpRes.data,
                emotion_segmentation: emoRes.data,
                keystroke,
            });

            const nextMessages = [...messages];
            nextMessages[botIndex] = {
                ...msg,
                analysis: { nlp: nlpRes.data, emotion_segmentation: emoRes.data, keystroke, score: scoreRes.data },
            };
            setMessages(nextMessages);
            sessionStorage.setItem("sessionChat", JSON.stringify(nextMessages));
        } catch (e) {
            setAnalysisError((prev) => ({
                ...prev,
                [botIndex]: e?.response?.data?.detail || e?.message || "Failed to fetch analysis.",
            }));
        } finally {
            setAnalysisLoading((prev) => {
                const next = new Set(prev);
                next.delete(botIndex);
                return next;
            });
        }
    };

    return {
        messages,
        input,
        isThinking,
        expandedAnalysis,
        analysisLoading,
        analysisError,
        inputRef,
        chatContainerRef,
        setInput,
        sendMessage,
        handleKeyDown,
        handleKeyUp,
        handleNewChat,
        handleSaveChat,
        toggleAnalysis,
    };
}
