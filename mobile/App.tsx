import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from './src/config';
import { clearSession, getSession, saveSession } from './src/services/storage';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { RoomsScreen } from './src/screens/RoomsScreen';
import type { AuthMode, Room, User } from './src/types';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </>
  );
}

function AppContent() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('guest');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    const restore = async () => {
      const session = await getSession();
      if (session) {
        setUser(session.user);
        setToken(session.token);
        setAuthMode(session.authMode);
      }
      setBooting(false);
    };

    restore();
  }, []);

  const socket: Socket | null = useMemo(() => {
    if (!user) {
      return null;
    }

    return io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });
  }, [user]);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  const handleAuthenticated = async (nextUser: User, nextToken: string, nextAuthMode: AuthMode) => {
    await saveSession(nextUser, nextToken, nextAuthMode);
    setUser(nextUser);
    setToken(nextToken);
    setAuthMode(nextAuthMode);
  };

  const handleLogout = async () => {
    socket?.disconnect();
    await clearSession();
    setSelectedRoom(null);
    setUser(null);
    setToken('');
    setAuthMode('guest');
  };

  if (booting) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#4f46e5" size="large" />
        <Text style={styles.loadingText}>Opening chat...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  if (selectedRoom) {
    return (
      <ChatScreen
        room={selectedRoom}
        user={user}
        socket={socket}
        onBack={() => setSelectedRoom(null)}
      />
    );
  }

  return (
    <RoomsScreen
      user={user}
      token={token}
      authMode={authMode}
      onLogout={handleLogout}
      onSelectRoom={setSelectedRoom}
    />
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    color: '#64748b',
    marginTop: 10,
  },
});

export default App;
