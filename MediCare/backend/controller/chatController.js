import ChatHistory from "../models/chatHistory.js";

export const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?._id;

    if (!message) return res.status(400).json({ error: "Message is required" });
    if (!userId) return res.status(401).json({ error: "User not authenticated" });

    const fetchFn =
      globalThis.fetch || (await import("node-fetch").then((m) => m.default));

    const response = await fetchFn("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_input: message,
        detail_mode: "concise",
        user_id: userId.toString(),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Chatbot service error",
        detail: text,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Chat error:", error);
    res
      .status(502)
      .json({ error: "Chatbot service unavailable", message: error.message });
  }
};

export const saveChatManually = async (req, res) => {
  try {
    const { message, reply } = req.body;
    const userId = req.user?._id;

    if (!message || !reply)
      return res
        .status(400)
        .json({ error: "Message and reply are required" });

    await ChatHistory.create({ user: userId, message, reply });

    res.json({ success: true, message: "Chat saved successfully" });
  } catch (err) {
    console.error("Save chat error:", err);
    res.status(500).json({ error: "Failed to save chat" });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await ChatHistory.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.json(history);
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

export const deleteChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!id) return res.status(400).json({ error: "Chat ID is required" });

    const deleted = await ChatHistory.findOneAndDelete({ _id: id, user: userId });

    if (!deleted)
      return res.status(404).json({ message: "Chat not found or unauthorized" });

    res.json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Delete chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
