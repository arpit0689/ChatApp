import React from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import './styles/global.css';

function App() {
  const { user } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return <ChatPage />;
}

export default App;
