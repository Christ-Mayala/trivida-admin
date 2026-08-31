/**
 * App.jsx — TRIVIDA COMMAND CENTER
 * 
 * Routeur principal avec protection des routes admin.
 * Architecture complète : Dashboard, Intel, Business, Subscriptions, Support, Admin.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';

// Pages originales
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
import RetentionPage from './pages/RetentionPage';

// Pages Intel
import IntelPage from './pages/IntelPage';
import IntelProfilesPage from './pages/IntelProfilesPage';
import IntelHealthPage from './pages/IntelHealthPage';
import IntelGrowthPage from './pages/IntelGrowthPage';
import IntelDecisionsPage from './pages/IntelDecisionsPage';
import IntelPredictionsPage from './pages/IntelPredictionsPage';

// Pages nouvelles
import SubscriptionsPage from './pages/SubscriptionsPage';
import FeatureFlagsPage from './pages/FeatureFlagsPage';
import NotificationsPushPage from './pages/NotificationsPushPage';
import SupportPage from './pages/SupportPage';
import AdminsPage from './pages/AdminsPage';

/**
 * Composant de protection des routes
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
      <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
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
            {/* Dashboard */}
            <Route index element={<OverviewPage />} />
            
            {/* Utilisateurs */}
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            
            {/* Trivida Intel */}
            <Route path="intel" element={<IntelPage />} />
            <Route path="intel/profiles" element={<IntelProfilesPage />} />
            <Route path="intel/health" element={<IntelHealthPage />} />
            <Route path="intel/growth" element={<IntelGrowthPage />} />
            <Route path="intel/decisions" element={<IntelDecisionsPage />} />
            <Route path="intel/predictions" element={<IntelPredictionsPage />} />
            
            {/* Business */}
            <Route path="sync" element={<SyncPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="retention" element={<RetentionPage />} />
            
            {/* Abonnements & Revenus */}
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            
            {/* IA */}
            <Route path="ai" element={<AIPage />} />
            
            {/* Communication */}
            <Route path="messaging" element={<MessagingPage />} />
            <Route path="notifications" element={<NotificationsPushPage />} />
            
            {/* Support */}
            <Route path="support" element={<SupportPage />} />
            
            {/* Application */}
            <Route path="app-update" element={<AppUpdatePage />} />
            <Route path="feature-flags" element={<FeatureFlagsPage />} />
            
            {/* Configuration */}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admins" element={<AdminsPage />} />
            
            {/* Audit */}
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
