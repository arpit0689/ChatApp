import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { roomService } from '../services/api';
import type { AuthMode, Room, User } from '../types';

type Props = {
  user: User;
  token: string;
  authMode: AuthMode;
  onLogout: () => void;
  onSelectRoom: (room: Room) => void;
};

export function RoomsScreen({ user, token, authMode, onLogout, onSelectRoom }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const loadRooms = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const response = await roomService.getAllRooms(token);
      setRooms(response.data.rooms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const createRoom = async () => {
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await roomService.createRoom(roomName.trim(), roomDescription.trim(), token);
      const nextRoom = response.data;
      setRooms(prev => [nextRoom, ...prev]);
      setRoomName('');
      setRoomDescription('');
      setShowCreate(false);
      onSelectRoom(nextRoom);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Chat Rooms</Text>
          <Text style={styles.subtitle}>Pick a room or create a new one.</Text>
        </View>
        <Pressable onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.username.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.username}</Text>
          <Text style={styles.profileMeta}>
            {authMode === 'guest' ? 'Guest mode' : user.email || 'Account user'}
          </Text>
        </View>
      </View>

      <View style={styles.createPanel}>
        <PrimaryButton
          title={showCreate ? 'Close Create Room' : '+ Create Room'}
          variant="secondary"
          onPress={() => setShowCreate(prev => !prev)}
        />
        {showCreate && (
          <View>
            <TextInput
              value={roomName}
              onChangeText={setRoomName}
              placeholder="Room name"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
            <TextInput
              value={roomDescription}
              onChangeText={setRoomDescription}
              placeholder="Description (optional)"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
            <PrimaryButton title="Create" loading={creating} onPress={createRoom} />
          </View>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#4f46e5" size="large" />
          <Text style={styles.loadingText}>Loading rooms...</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => item._id}
          contentContainerStyle={rooms.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRooms(true)} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => onSelectRoom(item)} style={styles.roomCard}>
              <View style={styles.roomAvatar}>
                <Text style={styles.roomAvatarText}>#</Text>
              </View>
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{item.name}</Text>
                {!!item.description && <Text style={styles.roomDescription}>{item.description}</Text>}
              </View>
              {!!item.messageCount && <Text style={styles.messageCount}>{item.messageCount}</Text>}
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No rooms yet. Create the first one.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12 },
  title: { color: '#0f172a', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#64748b', marginTop: 2 },
  logoutButton: { backgroundColor: '#fee2e2', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 },
  logoutText: { color: '#b91c1c', fontWeight: '800' },
  profileCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 18, backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  profileInfo: { marginLeft: 12 },
  profileName: { color: '#0f172a', fontSize: 17, fontWeight: '800' },
  profileMeta: { color: '#64748b', marginTop: 2 },
  createPanel: { paddingHorizontal: 18, paddingTop: 12 },
  input: { minHeight: 46, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 14, marginVertical: 6, backgroundColor: '#fff', color: '#0f172a' },
  error: { marginHorizontal: 18, marginVertical: 8, color: '#b91c1c', backgroundColor: '#fee2e2', padding: 10, borderRadius: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#64748b', marginTop: 10 },
  list: { padding: 18, paddingTop: 8 },
  emptyList: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28 },
  roomCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 18, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  roomAvatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  roomAvatarText: { color: '#4338ca', fontWeight: '900', fontSize: 18 },
  roomInfo: { flex: 1 },
  roomName: { color: '#0f172a', fontWeight: '800', fontSize: 16 },
  roomDescription: { color: '#64748b', marginTop: 2 },
  messageCount: { color: '#64748b', fontWeight: '700' },
  emptyText: { color: '#64748b', textAlign: 'center', fontSize: 16 },
});
