import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medibook_token'));
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('medibook_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setDoctor(res.data.doctor);
        } catch {
          localStorage.removeItem('medibook_token');
          localStorage.removeItem('medibook_user');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: u, token: t, doctor: d } = res.data;
    localStorage.setItem('medibook_token', t);
    localStorage.setItem('medibook_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    setDoctor(d);
    return { user: u, doctor: d };
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('medibook_token');
    localStorage.removeItem('medibook_user');
    setToken(null);
    setUser(null);
    setDoctor(null);
  };

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));
  const updateDoctor = (updates) => setDoctor(prev => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, token, doctor, loading, login, logout, updateUser, updateDoctor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
