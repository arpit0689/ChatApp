import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ChatHeader from './ChatHeader';
import './ChatRoom.css';

const ChatRoom = ({
  room,
  messages,
  onSendMessage,
  onlineUsers,
  typingUsers,
  currentUser,
  isLoading,
  onTyping,
}) => {
  const messagesEndRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(true);

  const scrollToBottom = () => {
    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, shouldScroll]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShouldScroll(scrollHeight - scrollTop - clientHeight < 100);
  };

  if (!room) {
    return (
      <div className="chat-room chat-room-empty">
        <div className="empty-state">
          <h2>Welcome to Chat</h2>
          <p>Select a room from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room">
      <ChatHeader room={room} onlineUsersCount={onlineUsers.length} />

      {isLoading ? (
        <div className="chat-loading">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      ) : (
        <div className="messages-container" onScroll={handleScroll}>
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isCurrentUser={message.sender._id === currentUser?.id}
                  isEdited={message.edited}
                />
              ))}
              <TypingIndicator typingUsers={typingUsers} />
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      )}

      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        disabled={isLoading}
      />
    </div>
  );
};

export default ChatRoom;
