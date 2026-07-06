import React from 'react';
import './ChatHeader.css';

const ChatHeader = ({ room, onlineUsersCount }) => {
  if (!room) {
    return (
      <div className="chat-header">
        <h1>Select a room to start chatting</h1>
      </div>
    );
  }

  return (
    <div className="chat-header">
      <div className="header-content">
        <div className="header-info">
          <h2 className="room-title">{room.name}</h2>
          {room.description && (
            <p className="room-subtitle">{room.description}</p>
          )}
        </div>
        <div className="header-stats">
          <span className="stat-item">
            <span className="stat-label">Online:</span>
            <span className="stat-value">{onlineUsersCount}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Messages:</span>
            <span className="stat-value">{room.messageCount || 0}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
