/**
 * App.jsx — Trivida Admin Panel
 * 
 * Routeur principal avec protection des routes admin.
 * Toutes les routes sauf /login nécessitent une authentification.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import SyncPage from './pages/SyncPage';
import AIPage from './pages/AIPage';
import RevenuePage from './pages/RevenuePage';
import AppUpdatePage from './pages/AppUpdatePage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import MessagingPage from './pages/MessagingPage';
import PerformancePage from './pages/PerformancePage';

/**
 * Composant de protection des routes
 * Redirige vers /login si non authentifié
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

/**
 * Route publique — redirige vers / si déjà connecté
 */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          {/* Route publique : Login */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          
          {/* Routes protégées avec Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<OverviewPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="sync" element={<SyncPage />} />
            <Route path="ai" element={<AIPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="messaging" element={<MessagingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="app-update" element={<AppUpdatePage />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
          
          {/* Fallback : redirect vers / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
