import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

const AuthContext = createContext(null);

function mapUserData(data) {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    department: data.department,
    statusMessage: data.statusMessage || null,
    profilePicUrl: data.profilePicUrl || null,
    onlineStatus: data.onlineStatus ?? false,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await userApi.getMe();
    const userData = mapUserData(data);
    persistUser(userData);
    return userData;
  }, [persistUser]);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await refreshProfile();
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          const stored = localStorage.getItem('user');
          if (stored) setUser(JSON.parse(stored));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshProfile]);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('token', data.token);
    const userData = mapUserData(data);
    persistUser(userData);
    try {
      return await refreshProfile();
    } catch {
      return userData;
    }
  }, [persistUser, refreshProfile]);

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData);
    localStorage.setItem('token', data.token);
    const userData = mapUserData(data);
    persistUser(userData);
    try {
      return await refreshProfile();
    } catch {
      return userData;
    }
  }, [persistUser, refreshProfile]);

  const updateProfile = useCallback(async (profileData) => {
    const { data } = await userApi.updateProfile(profileData);
    const userData = mapUserData(data);
    persistUser(userData);
    return userData;
  }, [persistUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
