export type User = {
  id: string;
  username: string;
  email?: string;
};

export type Room = {
  _id: string;
  name: string;
  description?: string;
  messageCount?: number;
  createdAt?: string;
};

export type Message = {
  _id: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  room?: string | Room;
  createdAt?: string;
  edited?: boolean;
  messageType?: string;
};

export type ApiError = Error & {
  statusCode?: number;
  errors?: Array<{ field?: string; message: string }>;
};

export type AuthMode = 'account' | 'guest';

export type Session = {
  user: User;
  token: string;
  authMode: AuthMode;
};
