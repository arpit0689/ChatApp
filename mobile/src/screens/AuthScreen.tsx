import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { authService } from '../services/api';
import type { AuthMode, User } from '../types';

type Props = {
  onAuthenticated: (user: User, token: string, authMode: AuthMode) => void;
};

export function AuthScreen({ onAuthenticated }: Props) {
  const [authMode, setAuthMode] = useState<AuthMode>('guest');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isGuest = authMode === 'guest';

  const submit = async () => {
    setError('');
    setLoading(true);

    try {
      if (isGuest) {
        const response = await authService.guestLogin(username.trim());
        onAuthenticated(response.data.user, '', 'guest');
        return;
      }

      if (isLogin) {
        const response = await authService.login(username.trim(), password);
        onAuthenticated(response.data.user, response.data.token, 'account');
        return;
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await authService.register(username.trim(), email.trim(), password);
      onAuthenticated(response.data.user, response.data.token, 'account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setAuthMode(nextMode);
    setError('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Real-Time Chat</Text>
            <Text style={styles.subtitle}>Use your account or jump in as a guest.</Text>

            <View style={styles.modeRow}>
              <Pressable
                onPress={() => switchMode('account')}
                style={[styles.modeButton, !isGuest && styles.modeButtonActive]}
              >
                <Text style={[styles.modeText, !isGuest && styles.modeTextActive]}>Account</Text>
              </Pressable>
              <Pressable
                onPress={() => switchMode('guest')}
                style={[styles.modeButton, isGuest && styles.modeButtonActive]}
              >
                <Text style={[styles.modeText, isGuest && styles.modeTextActive]}>Guest</Text>
              </Pressable>
            </View>

            {!isGuest && (
              <View style={styles.switchRow}>
                <Pressable
                  onPress={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                  style={[styles.switchButton, isLogin && styles.switchButtonActive]}
                >
                  <Text style={[styles.switchText, isLogin && styles.switchTextActive]}>Login</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                  style={[styles.switchButton, !isLogin && styles.switchButtonActive]}
                >
                  <Text style={[styles.switchText, !isLogin && styles.switchTextActive]}>
                    Register
                  </Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Enter username"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />

            {!isGuest && !isLogin && (
              <>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter email"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </>
            )}

            {!isGuest && (
              <>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </>
            )}

            {!isGuest && !isLogin && (
              <>
                <Text style={styles.label}>Confirm password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm password"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
              </>
            )}

            {!!error && <Text style={styles.error}>{error}</Text>}

            <PrimaryButton
              title={isGuest ? 'Continue as Guest' : isLogin ? 'Login' : 'Create Account'}
              loading={loading}
              onPress={submit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#eef2ff' },
  keyboard: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 22,
    shadowColor: '#1e1b4b',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  title: { color: '#111827', fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#64748b', fontSize: 15, marginTop: 8, marginBottom: 20, textAlign: 'center' },
  modeRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4, marginBottom: 14 },
  modeButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modeButtonActive: { backgroundColor: '#4f46e5' },
  modeText: { color: '#475569', fontWeight: '700' },
  modeTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
  switchButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: '#f8fafc' },
  switchButtonActive: { backgroundColor: '#e0e7ff' },
  switchText: { color: '#64748b', fontWeight: '700' },
  switchTextActive: { color: '#4338ca' },
  label: { color: '#334155', fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 14, color: '#0f172a', backgroundColor: '#fff' },
  error: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 12, marginTop: 14, marginBottom: 6 },
});
