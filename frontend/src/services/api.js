import apiClient from './apiClient';

export const authService = {
  register: async (username, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  guestLogin: async (username) => {
    try {
      const response = await apiClient.post('/auth/guest', { username });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const roomService = {
  createRoom: async (name, description) => {
    try {
      const response = await apiClient.post('/rooms', {
        name,
        description,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAllRooms: async (page = 1, limit = 50) => {
    try {
      const response = await apiClient.get('/rooms', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRoomById: async (roomId) => {
    try {
      const response = await apiClient.get(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateRoom: async (roomId, updates) => {
    try {
      const response = await apiClient.put(`/rooms/${roomId}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteRoom: async (roomId) => {
    try {
      const response = await apiClient.delete(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const messageService = {
  createMessage: async (content, roomId) => {
    try {
      const response = await apiClient.post('/messages', {
        content,
        roomId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMessagesByRoom: async (roomId, page = 1, limit = 50) => {
    try {
      const response = await apiClient.get(`/messages/${roomId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  editMessage: async (messageId, content) => {
    try {
      const response = await apiClient.put(`/messages/${messageId}`, {
        content,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const response = await apiClient.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  searchMessages: async (roomId, query) => {
    try {
      const response = await apiClient.get(`/messages/${roomId}/search`, {
        params: { query },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
