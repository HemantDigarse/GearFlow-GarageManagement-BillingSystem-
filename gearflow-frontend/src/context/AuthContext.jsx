import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginAPI, register as registerAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const loginFn = async (credentials) => {
    const response = await loginAPI(credentials);
    const authData = response.data.data; // ApiResponse wraps in .data
    localStorage.setItem('token', authData.token);
    const userData = { username: authData.username, fullName: authData.fullName, email: authData.email, role: authData.role, garageId: authData.garageId, garageName: authData.garageName };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData.role;
  };

  const registerFn = async (data) => {
    const response = await registerAPI(data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user, loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isGarageOwner: user?.role === 'GARAGE_OWNER',
    login: loginFn, register: registerFn, logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
