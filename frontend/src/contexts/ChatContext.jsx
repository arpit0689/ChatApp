import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback((messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, ...updates } : msg))
    );
  }, []);

  const deleteMessage = useCallback((messageId) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const setMessagesHistory = useCallback((msgs) => {
    setMessages(msgs);
  }, []);

  const addTypingUser = useCallback((username) => {
    setTypingUsers((prev) => {
      if (!prev.includes(username)) {
        return [...prev, username];
      }
      return prev;
    });
  }, []);

  const removeTypingUser = useCallback((username) => {
    setTypingUsers((prev) => prev.filter((u) => u !== username));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        rooms,
        setRooms,
        currentRoom,
        setCurrentRoom,
        messages,
        setMessages,
        addMessage,
        updateMessage,
        deleteMessage,
        clearMessages,
        setMessagesHistory,
        onlineUsers,
        setOnlineUsers,
        typingUsers,
        addTypingUser,
        removeTypingUser,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
