import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { useSocket } from '../contexts/SocketContext';
import { roomService } from '../services/api';
import RoomSidebar from '../components/RoomSidebar';
import ChatRoom from '../components/ChatRoom';
import OnlineUsersList from '../components/OnlineUsersList';
import './ChatPage.css';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const {
    rooms,
    setRooms,
    currentRoom,
    setCurrentRoom,
    messages,
    setMessagesHistory,
    addMessage,
    onlineUsers,
    setOnlineUsers,
    typingUsers,
    addTypingUser,
    removeTypingUser,
    loading,
    setLoading,
  } = useChat();

  const socket = useSocket();
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Load rooms on component mount
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await roomService.getAllRooms(1, 100);
        setRooms(response.data.rooms);
      } catch (error) {
        console.error('Failed to load rooms:', error);
      }
    };
    loadRooms();
  }, [setRooms]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Receive new message
    socket.on('newMessage', (message) => {
      addMessage({
        ...message,
        sender: {
          _id: message.sender._id,
          username: message.sender.username,
          avatar: message.sender.avatar,
        },
      });
    });

    // Chat history
    socket.on('chatHistory', (data) => {
      setMessagesHistory(data.messages || []);
      setLoading(false);
    });

    // Online users
    socket.on('onlineUsers', (data) => {
      setOnlineUsers(data.users || []);
    });

    // User joined
    socket.on('userJoined', (data) => {
      setOnlineUsers(data.onlineUsers || []);
    });

    // User left
    socket.on('userLeft', (data) => {
      setOnlineUsers(data.onlineUsers || []);
    });

    // User typing
    socket.on('userTyping', (data) => {
      addTypingUser(data.username);
    });

    // User stopped typing
    socket.on('userStoppedTyping', (data) => {
      removeTypingUser(data.username);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.off('newMessage');
      socket.off('chatHistory');
      socket.off('onlineUsers');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('error');
    };
  }, [socket, addMessage, setMessagesHistory, setLoading, setOnlineUsers, addTypingUser, removeTypingUser]);

  const handleSelectRoom = (room) => {
    setCurrentRoom(room);
    setLoading(true);
    setMessagesHistory([]);
    setOnlineUsers([]);

    if (socket && user) {
      socket.emit('joinRoom', {
        roomId: room._id,
        userId: user.id,
        username: user.username,
      });
    }
  };

  const handleCreateRoom = (newRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    handleSelectRoom(newRoom);
  };

  const handleSendMessage = (content) => {
    if (!socket || !currentRoom || !user) return;

    socket.emit('chatMessage', {
      roomId: currentRoom._id,
      content,
      userId: user.id,
      username: user.username,
    });

    // Stop typing indicator
    socket.emit('stopTyping', {
      roomId: currentRoom._id,
      username: user.username,
    });

    if (typingTimeout) clearTimeout(typingTimeout);
  };

  const handleTyping = () => {
    if (!socket || !currentRoom || !user) return;

    socket.emit('typing', {
      roomId: currentRoom._id,
      username: user.username,
    });

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      socket.emit('stopTyping', {
        roomId: currentRoom._id,
        username: user.username,
      });
    }, 3000);

    setTypingTimeout(timeout);
  };

  return (
    <div className="chat-page">
      <RoomSidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onSelectRoom={handleSelectRoom}
        onCreateRoom={handleCreateRoom}
      />

      <ChatRoom
        room={currentRoom}
        messages={messages}
        onSendMessage={handleSendMessage}
        onlineUsers={onlineUsers}
        typingUsers={typingUsers}
        currentUser={user}
        isLoading={loading}
        onTyping={handleTyping}
      />

      <OnlineUsersList users={onlineUsers} />

      <div className="chat-page-header">
        <div className="user-info">
          <span className="username">{user?.username}</span>
        </div>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
