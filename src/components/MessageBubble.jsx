import React from "react";
import { motion } from "framer-motion";
import classNames from "classnames";
import "./MessageBubble.css";

const MessageBubble = ({ sender, text }) => {
  const isUser = sender === "user";

  return (
    <motion.div
      className={classNames("message-bubble", { user: isUser, bot: !isUser })}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {text}
    </motion.div>
  );
};

export default MessageBubble;
