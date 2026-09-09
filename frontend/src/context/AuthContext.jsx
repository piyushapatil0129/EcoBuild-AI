import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecobuild_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ecobuild_token');
      const storedUser = localStorage.getItem('ecobuild_user');
      
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // verify profile
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('ecobuild_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired, clearing stored credentials');
          localStorage.removeItem('ecobuild_token');
          localStorage.removeItem('ecobuild_user');
          setUser(null);
          setToken(null);
        }
      } else {
        // Automatically activate demo user for frictionless instant access
        const demoUser = {
          id: 'demo-user-001',
          name: 'Alex Vance',
          email: 'demo@ecobuild.ai',
          role: 'Lead Sustainability Architect'
        };
        setUser(demoUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: loggedUser } = res.data;
    setToken(access_token);
    setUser(loggedUser);
    localStorage.setItem('ecobuild_token', access_token);
    localStorage.setItem('ecobuild_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { access_token, user: newUser } = res.data;
    setToken(access_token);
    setUser(newUser);
    localStorage.setItem('ecobuild_token', access_token);
    localStorage.setItem('ecobuild_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('ecobuild_token');
    localStorage.removeItem('ecobuild_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
