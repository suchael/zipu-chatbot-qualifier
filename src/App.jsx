import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import { handleMessage } from "./nlp/parser";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Hi! I'm Zipu 🤖 — your smart finance assistant.\n\nI can help you with:\n• Buying airtime 📱\n• Sending money 💸\n• Buying crypto 💰\n• Checking balances 🧾\n\nHow can I assist you today?`,
    },
  ]);

  const [context, setContext] = useState({});

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleBotReply = async (inputText) => {
    const userMsg = { id: Date.now(), sender: "user", text: inputText };
    addMessage(userMsg);

    const { reply, updatedContext } = await handleMessage(inputText, context);
    setContext(updatedContext);

    const botMsg = {
      id: Date.now() + 1,
      sender: "bot",
      text: reply,
    };

    setTimeout(() => addMessage(botMsg), 600); // simulate typing delay
  };

  return (
    <div className="app-container">
      <div className="chat-box">
        <ChatWindow messages={messages} onSend={handleBotReply} />
      </div>
    </div>
  );
}

export default App;
