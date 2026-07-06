import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
    }
  };

  return (
    <div className="message-input-container">
      <textarea
        ref={textareaRef}
        className="message-input"
        placeholder="Type a message... (Shift + Enter for new line)"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          onTyping?.();
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows="1"
      />
      <button
        className="send-button"
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        title="Send message"
      >
        ➤
      </button>
    </div>
  );
};

export default MessageInput;
