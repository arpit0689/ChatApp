import type { AuthMode, Session, User } from '../types';

let memorySession: Session | null = null;

export const saveSession = async (user: User, token = '', authMode: AuthMode) => {
  memorySession = { user, token, authMode };
};

export const getSession = async (): Promise<Session | null> => {
  return memorySession;
};

export const clearSession = async () => {
  memorySession = null;
};
