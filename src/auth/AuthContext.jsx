import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const parseToken = (jwtToken) => {
    if (!jwtToken) return null;
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      return {
        id: payload.id || payload.userId,
        email: payload.sub,
        tenantId: payload.tenantId,
        tenantCode: payload.tenantCode,
        isPlatformAdmin: payload.tenantId === 1 || payload.tenantCode === 'SYS',
      };
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedPermissions = localStorage.getItem('permissions');
    const storedModules = localStorage.getItem('modules');

    if (storedToken) {
      const parsedUser = parseToken(storedToken);
      if (parsedUser) {
        setToken(storedToken);
        setUser(parsedUser);
        setPermissions(JSON.parse(storedPermissions || '[]'));
        setModules(JSON.parse(storedModules || '[]'));
      } else {
        clearStorage();
      }
    }
    setLoading(false);
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    localStorage.removeItem('modules');
    localStorage.removeItem('tenantCode');
  };

  const login = (newToken, newPermissions, newModules, newTenantCode) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('permissions', JSON.stringify(newPermissions));
    localStorage.setItem('modules', JSON.stringify(newModules));
    if (newTenantCode) {
      localStorage.setItem('tenantCode', newTenantCode.toUpperCase());
    } else {
      localStorage.removeItem('tenantCode');
    }

    const parsedUser = parseToken(newToken);
    setToken(newToken);
    setUser(parsedUser);
    setPermissions(newPermissions);
    setModules(newModules);
  };

  const logout = () => {
    clearStorage();
    setToken(null);
    setUser(null);
    setPermissions([]);
    setModules([]);
  };

  const value = {
    token,
    user,
    permissions,
    modules,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
