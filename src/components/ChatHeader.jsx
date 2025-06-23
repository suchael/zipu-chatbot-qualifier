import React from "react";
import "./ChatHeader.css";

const ChatHeader = () => {
  return (
    <div className="chat-header">
      <img src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS65xrzRYdo8Id9Sr-Qy4gbiI0-yUusnCc4Bw&s"} alt="Zipu AI" className="avatar" />
      <div className="chat-info">
        <div className="chat-name">Zipu AI - Success Ahmed</div>
        <div className="chat-status">online</div>
      </div>
    </div>
  );
};

export default ChatHeader;
