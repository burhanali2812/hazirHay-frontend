import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { FaRobot, FaPaperPlane, FaTrash } from "react-icons/fa"; // Font Awesome icons

const AiChat = () => {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    setPrompt("");
    setAnswer("");
  };

  const handleAsk = async () => {
    if (!prompt.trim()) {
      toast.error("Please type something first");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const response = await axios.post(
        "https://hazir-hay-backend.vercel.app/worker/askAiWorker",
        { prompt },
        { timeout: 20000, headers: { "Content-Type": "application/json" } }
      );

      const text = response.data?.answer || "No answer found";
      setAnswer(text);
    } catch (error) {
      toast.error("AI request failed");
      console.error(error);
    }

    setLoading(false);
  };

  return (
  <div className="container">
      <div
      style={{
        maxWidth: "600px",
        margin: "30px auto",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #e0e0e0",
        background: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* AI Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <FaRobot style={{ fontSize: "24px", color: "#007bff" }} />
        <h2 style={{ margin: 0, fontSize: "1.6rem", color: "#333" }}>
          Ask Gemini AI
        </h2>
      </div>

      {/* Answer Box */}
      {answer && (
        <div
          style={{
            background: "#f1f5f9",
            padding: "15px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            borderLeft: "4px solid #007bff",
            wordBreak: "break-word",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0", color: "#007bff" }}>Answer:</h4>
          <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#333" }}>
            {answer}
          </p>
        </div>
      )}

      {/* Prompt Box */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your question..."
        style={{
          width: "100%",
          minHeight: "100px",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #ccc",
          resize: "vertical",
          fontSize: "15px",
          marginBottom: "15px",
          outline: "none",
        }}
      />

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleAsk}
          disabled={loading}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px 18px",
            background: loading ? "#777" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "15px",
            fontWeight: "bold",
            transition: "all 0.2s",
          }}
        >
          <FaPaperPlane />
          {loading ? "Thinking..." : "Ask AI"}
        </button>

        <button
          onClick={handleClear}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px 18px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "bold",
            transition: "all 0.2s",
          }}
        >
          <FaTrash />
          Clear
        </button>
      </div>

      {/* Mobile Responsiveness */}
      <style>
        {`
          @media (max-width: 480px) {
            div[style*="display: flex; gap: 10px; flex-wrap: wrap;"] {
              flex-direction: column;
            }
          }
        `}
      </style>
    </div>
  </div>
  );
};

export default AiChat;
