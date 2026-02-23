import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Chat.css";

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const token = localStorage.getItem("token");
    const userMessage = message;

    // Add user message immediately
    setChat(prev => [...prev, { role: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post(
        "/chat/send",
        { message: userMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Add AI response
      setChat(prev => [
        ...prev,
        { role: "ai", text: res.data.reply }
      ]);

    } catch (err) {
      console.error("Chat Error:", err.response?.data || err.message);
      
      setChat(prev => [
        ...prev,
        { role: "ai", text: "Sorry, I'm having trouble responding right now. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What should I eat for breakfast?",
    "How can I lose weight?",
    "Best exercises for beginners?",
    "Tips for better sleep?"
  ];

  const handleQuickQuestion = (question) => {
    setMessage(question);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-content">
          <h1 className="chat-logo" onClick={() => navigate("/dashboard")}>
            💪 SwasthAI
          </h1>
          <button className="chat-back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="chat-main">
        <div className="chat-hero">
          <h2 className="chat-hero-title">💬 AI Fitness Coach</h2>
          <p className="chat-hero-subtitle">
            Ask me anything about diet, fitness, health, and wellness
          </p>
        </div>

        <div className="chat-wrapper">
          {/* Chat Messages */}
          <div className="chat-messages">
            {chat.length === 0 && (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">🤖</div>
                <h3 className="chat-welcome-title">Welcome to SwasthAI Coach!</h3>
                <p className="chat-welcome-text">
                  I'm your personal AI fitness assistant. Ask me about:
                </p>
                <ul className="chat-welcome-list">
                  <li>🥗 Nutrition and diet plans</li>
                  <li>🏋️ Exercise and workout routines</li>
                  <li>💊 Health tips and wellness</li>
                  <li>🧘 Yoga and meditation</li>
                </ul>
                <div className="chat-quick-questions">
                  <p className="chat-quick-title">Quick Questions:</p>
                  <div className="chat-quick-buttons">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        className="chat-quick-btn"
                        onClick={() => handleQuickQuestion(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {chat.map((c, i) => (
              <div
                key={i}
                className={`chat-message ${c.role === "user" ? "chat-message-user" : "chat-message-ai"}`}
              >
                <div className="chat-message-avatar">
                  {c.role === "user" ? "👤" : "🤖"}
                </div>
                <div className="chat-message-content">
                  <div className="chat-message-name">
                    {c.role === "user" ? "You" : "SwasthAI Coach"}
                  </div>
                  <div className="chat-message-text">
                    {c.text}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message chat-message-ai">
                <div className="chat-message-avatar">🤖</div>
                <div className="chat-message-content">
                  <div className="chat-message-name">SwasthAI Coach</div>
                  <div className="chat-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-wrapper">
            <div className="chat-input-container">
              <input
                type="text"
                placeholder="Ask about diet, fitness, health..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="chat-input"
              />

              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className={`chat-send-btn ${(loading || !message.trim()) ? "chat-send-btn-disabled" : ""}`}
              >
                {loading ? "⏳" : "📤"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
