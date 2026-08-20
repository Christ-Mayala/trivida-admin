/**
 * Layout — Trivida Admin Panel
 * 
 * Layout principal avec sidebar de navigation + header + contenu.
 * Le sidebar est responsive (fermable sur mobile).
 */
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import {
  LayoutDashboard,
  Users,
  RefreshCw,
  Brain,
  DollarSign,
  Download,
  ScrollText,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Bell,
  Wifi,
  WifiOff,
  Settings,
  Send,
  Activity,
} from 'lucide-react';

/**
 * Éléments de navigation du sidebar
 */
const NAV_ITEMS = [
  { 
    path: '/', 
    label: 'Vue d\'ensemble', 
    icon: LayoutDashboard,
    description: 'KPIs et aperçu global'
  },
  { 
    path: '/users', 
    label: 'Utilisateurs', 
    icon: Users,
    description: 'Gestion des comptes'
  },
  { 
    path: '/sync', 
    label: 'Sync & Santé', 
    icon: RefreshCw,
    description: 'Synchronisation et erreurs'
  },
  { 
    path: '/ai', 
    label: 'IA & Quotas', 
    icon: Brain,
    description: 'Consommation intelligente'
  },
  { 
    path: '/revenue', 
    label: 'Revenus & Plans', 
    icon: DollarSign,
    description: 'Abonnements et facturation'
  },
  { 
    path: '/performance', 
    label: 'Performance', 
    icon: Activity,
    description: 'Dashboard audit & santé'
  },
  { 
    path: '/messaging', 
    label: 'Messagerie', 
    icon: Send,
    description: 'Email & WhatsApp'
  },
  { 
    path: '/settings', 
    label: 'Paramètres', 
    icon: Settings,
    description: 'Prix, quotas, configuration',
    role: 'superadmin'
  },
  { 
    path: '/app-update', 
    label: 'Mise à jour app', 
    icon: Download,
    description: 'Manifeste de mise à jour',
    role: 'superadmin'
  },
  { 
    path: '/logs', 
    label: 'Journal d\'audit', 
    icon: ScrollText,
    description: 'Actions administrateur'
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { unreadCount, connected } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* ─── Overlay mobile ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ────────────────────────────────────────────────── */}
      <aside className={`
        sticky top-0 h-screen z-50
        w-64 bg-gray-900 border-r border-gray-800
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shrink-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800">
          <img src={`${import.meta.env.BASE_URL}trivida-logo.png`} alt="Trivida" className="w-9 h-9 rounded-lg object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
          <div className="w-9 h-9 rounded-lg bg-trivida-600 items-center justify-center hidden">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">Trivida</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
          {/* Bouton fermer (mobile) */}
          <button 
            className="lg:hidden ml-auto text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto min-h-0">
          {NAV_ITEMS.filter(item => !item.role || item.role === user?.role).map(({ path, label, icon: Icon, description }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors group
                ${isActive 
                  ? 'bg-trivida-600/20 text-trivida-400 border border-trivida-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate">{label}</div>
                <div className="text-xs text-gray-600 truncate hidden group-hover:block">
                  {description}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar : utilisateur + déconnexion — TOUJOURS visible */}
        <div className="shrink-0 p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-trivida-600/20 flex items-center justify-center text-trivida-400 text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
              <div className="text-xs mt-0.5">
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${user?.role === 'superadmin' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                  {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 mt-1 text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ─── Contenu principal ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header desktop + mobile */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}trivida-logo.png`} alt="Trivida" className="w-6 h-6 rounded object-cover" onError={(e) => { e.target.style.display='none'; }} />
              <span className="font-bold text-white">Trivida Admin</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Indicateur de connexion Socket.IO */}
            <div className="flex items-center gap-1.5" title={connected ? 'Connecté en temps réel' : 'Déconnecté'}>
              {connected ? (
                <><Wifi className="w-4 h-4 text-emerald-400" /><span className="text-xs text-emerald-400 hidden sm:inline">En ligne</span></>
              ) : (
                <><WifiOff className="w-4 h-4 text-gray-500" /><span className="text-xs text-gray-500 hidden sm:inline">Hors ligne</span></>
              )}
            </div>
            
            {/* Bouton notifications avec badge */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Dropdown notifications */}
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <NotificationDropdown onClose={() => setNotifOpen(false)} />
                </>
              )}
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
