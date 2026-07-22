import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Socket } from 'socket.io-client';
import type { Message, Room, User } from '../types';

type Props = {
  room: Room;
  user: User;
  socket: Socket | null;
  onBack: () => void;
};

export function ChatScreen({ room, user, socket, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Array<{ userId: string; username: string }>>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!socket) {
      setError('Socket is not connected yet.');
      setLoading(false);
      return;
    }

    setMessages([]);
    setTypingUsers([]);
    setOnlineUsers([]);
    setLoading(true);
    setError('');

    socket.emit('joinRoom', {
      roomId: room._id,
      userId: user.id,
      username: user.username,
    });
    socket.emit('getOnlineUsers', { roomId: room._id });

    const handleHistory = (data: { messages?: Message[] }) => {
      setMessages(data.messages || []);
      setLoading(false);
    };

    const handleNewMessage = (message: Message) => {
      const messageRoomId = typeof message.room === 'string' ? message.room : message.room?._id;
      if (!messageRoomId || messageRoomId === room._id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleOnlineUsers = (data: {
      users?: Array<{ userId: string; username: string }>;
      onlineUsers?: Array<{ userId: string; username: string }>;
    }) => {
      setOnlineUsers(data.users || data.onlineUsers || []);
    };

    const handleTyping = (data: { username: string }) => {
      if (data.username === user.username) {
        return;
      }
      setTypingUsers(prev => (prev.includes(data.username) ? prev : [...prev, data.username]));
    };

    const handleStoppedTyping = (data: { username: string }) => {
      setTypingUsers(prev => prev.filter(name => name !== data.username));
    };

    const handleSocketError = (payload: { message?: string }) => {
      setError(payload?.message || 'Socket error');
      setLoading(false);
    };

    const handleEdited = (payload: Partial<Message> & { _id: string }) => {
      setMessages(prev => prev.map(item => (item._id === payload._id ? { ...item, ...payload } : item)));
    };

    const handleDeleted = (payload: { _id: string }) => {
      setMessages(prev => prev.filter(item => item._id !== payload._id));
    };

    socket.on('chatHistory', handleHistory);
    socket.on('newMessage', handleNewMessage);
    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('userJoined', handleOnlineUsers);
    socket.on('userLeft', handleOnlineUsers);
    socket.on('userTyping', handleTyping);
    socket.on('userStoppedTyping', handleStoppedTyping);
    socket.on('messageEdited', handleEdited);
    socket.on('messageDeleted', handleDeleted);
    socket.on('error', handleSocketError);

    return () => {
      socket.emit('stopTyping', { roomId: room._id, username: user.username });
      socket.off('chatHistory', handleHistory);
      socket.off('newMessage', handleNewMessage);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('userJoined', handleOnlineUsers);
      socket.off('userLeft', handleOnlineUsers);
      socket.off('userTyping', handleTyping);
      socket.off('userStoppedTyping', handleStoppedTyping);
      socket.off('messageEdited', handleEdited);
      socket.off('messageDeleted', handleDeleted);
      socket.off('error', handleSocketError);
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, [room._id, socket, user.id, user.username]);

  useEffect(() => {
    if (messages.length) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [messages.length]);

  const typingText = useMemo(() => {
    if (!typingUsers.length) {
      return '';
    }
    return `${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`;
  }, [typingUsers]);

  const sendMessage = () => {
    const text = content.trim();
    if (!text || !socket) {
      return;
    }

    socket.emit('chatMessage', {
      roomId: room._id,
      content: text,
      userId: user.id,
      username: user.username,
    });
    socket.emit('stopTyping', { roomId: room._id, username: user.username });
    setContent('');
  };

  const onTyping = (text: string) => {
    setContent(text);
    if (!socket) {
      return;
    }

    socket.emit('typing', { roomId: room._id, username: user.username });
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
    typingTimer.current = setTimeout(() => {
      socket.emit('stopTyping', { roomId: room._id, username: user.username });
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.roomName}>{room.name}</Text>
            <Text style={styles.onlineText}>{onlineUsers.length} online</Text>
          </View>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item._id}
            contentContainerStyle={messages.length ? styles.messageList : styles.emptyList}
            renderItem={({ item }) => {
              const mine = item.sender?._id === user.id;
              return (
                <View style={[styles.messageBubble, mine ? styles.myBubble : styles.theirBubble]}>
                  {!mine && <Text style={styles.sender}>{item.sender?.username || 'User'}</Text>}
                  <Text style={[styles.messageText, mine && styles.myMessageText]}>{item.content}</Text>
                  {!!item.createdAt && (
                    <Text style={[styles.timeText, mine && styles.myTimeText]}>
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No messages yet. Say hello.</Text>}
          />
        )}

        {!!typingText && <Text style={styles.typingText}>{typingText}</Text>}

        <View style={styles.inputRow}>
          <TextInput
            value={content}
            onChangeText={onTyping}
            placeholder="Type a message..."
            placeholderTextColor="#94a3b8"
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={sendMessage}
            disabled={!content.trim()}
            style={[styles.sendButton, !content.trim() && styles.sendButtonDisabled]}
          >
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff' },
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backText: { color: '#4338ca', fontSize: 34, lineHeight: 38, fontWeight: '600' },
  headerInfo: { flex: 1 },
  roomName: { color: '#0f172a', fontSize: 19, fontWeight: '800' },
  onlineText: { color: '#64748b', marginTop: 2 },
  error: { color: '#b91c1c', backgroundColor: '#fee2e2', padding: 10, margin: 12, borderRadius: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#64748b', marginTop: 10 },
  messageList: { padding: 14, paddingBottom: 20 },
  emptyList: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emptyText: { color: '#64748b', textAlign: 'center', fontSize: 16 },
  messageBubble: { maxWidth: '82%', padding: 12, borderRadius: 18, marginVertical: 5 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#4f46e5', borderBottomRightRadius: 6 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderBottomLeftRadius: 6 },
  sender: { color: '#4338ca', fontWeight: '800', marginBottom: 4 },
  messageText: { color: '#0f172a', fontSize: 15, lineHeight: 21 },
  myMessageText: { color: '#fff' },
  timeText: { color: '#94a3b8', fontSize: 11, alignSelf: 'flex-end', marginTop: 6 },
  myTimeText: { color: '#c7d2fe' },
  typingText: { color: '#64748b', fontStyle: 'italic', paddingHorizontal: 16, paddingBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
  input: { flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 18, backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 10, color: '#0f172a' },
  sendButton: { marginLeft: 8, minHeight: 44, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.45 },
  sendText: { color: '#fff', fontWeight: '800' },
});
