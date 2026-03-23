import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('unibridge_auth');
    if (stored) {
      const { user, token } = JSON.parse(stored);
      setUser(user);
      setToken(token);
    }
  }, []);

  const login = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('unibridge_auth', JSON.stringify({ user, token }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('unibridge_auth');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
