/**
 * AuthContext — Trivida Admin Panel
 * 
 * Gère l'authentification admin (JWT stocké en localStorage).
 * Fournit : user, token, login, logout, isAuthenticated, loading
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier le token au chargement
  useEffect(() => {
    const storedToken = localStorage.getItem('trivida_admin_token');
    const storedUser = localStorage.getItem('trivida_admin_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('trivida_admin_token');
        localStorage.removeItem('trivida_admin_user');
      }
    }
    
    setLoading(false);
  }, []);

  /**
   * Connexion admin
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = useCallback(async (email, password) => {
    try {
      const data = await api.post('/api/v1/trivida/admin/login', { email, password });
      
      if (data.success) {
        const { user: userData, token: newToken } = data.data;
        setUser(userData);
        setToken(newToken);
        localStorage.setItem('trivida_admin_token', newToken);
        localStorage.setItem('trivida_admin_user', JSON.stringify(userData));
        return { success: true };
      }
      
      return { success: false, error: data.message || 'Erreur de connexion' };
    } catch (error) {
      return { success: false, error: error.message || 'Erreur réseau' };
    }
  }, []);

  /**
   * Déconnexion admin
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('trivida_admin_token');
    localStorage.removeItem('trivida_admin_user');
  }, []);

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte d'authentification
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
