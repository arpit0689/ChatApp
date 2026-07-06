import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, isCurrentUser, isEdited }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`message-bubble ${isCurrentUser ? 'sent' : 'received'}`}>
      <div className="message-content">
        {!isCurrentUser && <span className="message-sender">{message.sender?.username}</span>}
        <p className="message-text">{message.content}</p>
        <span className="message-timestamp">
          {formatTime(message.createdAt)}
          {isEdited && ' (edited)'}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
