import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";

import ChatHeader from "./ChatHeader";
import "./ChatWindow.css";

function ChatWindow({ messages, onSend }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-window">
      <ChatHeader />
      <div className="chat-body">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${msg.sender === "bot" ? "bot" : "user"}`}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>
          <FaPaperPlane size={16} />
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
