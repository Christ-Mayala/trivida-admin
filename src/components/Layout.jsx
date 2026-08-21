/**
 * Layout — TRIVIDA COMMAND CENTER
 * 
 * Layout principal avec sidebar groupée par domaine.
 * Navigation : Dashboard, Intel, Business, Abonnements, Communication, Support, Système, Admin.
 */
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import {
  LayoutDashboard, Users, RefreshCw, Brain, DollarSign, Download,
  ScrollText, LogOut, Menu, X, Shield, ChevronRight, Bell,
  Wifi, WifiOff, Settings, Send, Activity, Heart, Trophy, Zap,
  Target, Crown, Flag, LifeBuoy, CreditCard, BarChart3,
  ChevronDown, ChevronUp, Lightbulb
} from 'lucide-react';

/**
 * Navigation groupée par domaine
 */
const NAV_SECTIONS = [
  {
    label: 'COMMAND CENTER',
    items: [
      { path: '/', label: 'Vue globale', icon: LayoutDashboard },
    ],
  },
  {
    label: 'UTILISATEURS',
    items: [
      { path: '/users', label: 'Tous les utilisateurs', icon: Users },
    ],
  },
  {
    label: 'TRIVIDA INTEL',
    items: [
      { path: '/intel', label: 'Dashboard Intel', icon: Brain },
      { path: '/intel/profiles', label: 'Intel Profiles', icon: Target },
      { path: '/intel/health', label: 'HealthScore', icon: Heart },
      { path: '/intel/growth', label: 'Growth Brain', icon: Trophy },
      { path: '/intel/decisions', label: 'Decision Engine', icon: Lightbulb },
      { path: '/intel/predictions', label: 'Predictive Engine', icon: Zap },
    ],
  },
  {
    label: 'BUSINESS',
    items: [
      { path: '/sync', label: 'Sync & Santé', icon: RefreshCw },
      { path: '/performance', label: 'Performance', icon: Activity },
    ],
  },
  {
    label: 'ABONNEMENTS',
    items: [
      { path: '/subscriptions', label: 'Plans & Revenus', icon: Crown },
      { path: '/revenue', label: 'Revenus détaillés', icon: DollarSign },
    ],
  },
  {
    label: 'IA',
    items: [
      { path: '/ai', label: 'Consommation IA', icon: Brain },
    ],
  },
  {
    label: 'COMMUNICATION',
    items: [
      { path: '/messaging', label: 'Email / WhatsApp / SMS', icon: Send },
      { path: '/notifications', label: 'Notifications Push', icon: Bell },
    ],
  },
  {
    label: 'SUPPORT',
    items: [
      { path: '/support', label: 'Tickets & Signalements', icon: LifeBuoy },
    ],
  },
  {
    label: 'SYSTÈME',
    items: [
      { path: '/feature-flags', label: 'Feature Flags', icon: Flag },
      { path: '/app-update', label: 'Mise à jour app', icon: Download },
      { path: '/logs', label: 'Journal d\'audit', icon: ScrollText },
    ],
    role: 'superadmin',
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { path: '/settings', label: 'Paramètres', icon: Settings },
      { path: '/admins', label: 'Administrateurs', icon: Shield },
    ],
    role: 'superadmin',
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { unreadCount, connected } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  function toggleSection(label) {
    setCollapsedSections(prev => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
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
            <p className="text-[10px] text-trivida-400 font-medium">COMMAND CENTER</p>
          </div>
          <button className="lg:hidden ml-auto text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation groupée */}
        <nav className="flex-1 py-3 px-3 space-y-3 overflow-y-auto min-h-0">
          {NAV_SECTIONS.filter(s => !s.role || s.role === user?.role).map((section) => {
            const isCollapsed = collapsedSections[section.label];
            return (
              <div key={section.label}>
                {/* Header de section */}
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:text-gray-400"
                >
                  <span>{section.label}</span>
                  {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
                
                {/* Items */}
                {!isCollapsed && (
                  <div className="space-y-0.5 mt-1">
                    {section.items.map(({ path, label, icon: Icon }) => (
                      <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) => `
                          flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                          transition-colors
                          ${isActive
                            ? 'bg-trivida-600/20 text-trivida-400 border border-trivida-600/30'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer : user + déconnexion — TOUJOURS visible */}
        <div className="shrink-0 p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-trivida-600/20 flex items-center justify-center text-trivida-400 text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
              <div className="text-xs mt-0.5">
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${user?.role === 'superadmin' ? 'bg-purple-900/50 text-purple-300' : user?.role === 'support' ? 'bg-emerald-900/50 text-emerald-300' : user?.role === 'analyst' ? 'bg-amber-900/50 text-amber-300' : 'bg-blue-900/50 text-blue-300'}`}>
                  {user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'support' ? 'Support' : user?.role === 'analyst' ? 'Analyst' : 'Admin'}
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

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}trivida-logo.png`} alt="Trivida" className="w-6 h-6 rounded object-cover" onError={(e) => { e.target.style.display='none'; }} />
              <span className="font-bold text-white hidden sm:inline">Trivida Admin</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5" title={connected ? 'Connecté en temps réel' : 'Déconnecté'}>
              {connected ? (
                <><Wifi className="w-4 h-4 text-emerald-400" /><span className="text-xs text-emerald-400 hidden sm:inline">En ligne</span></>
              ) : (
                <><WifiOff className="w-4 h-4 text-gray-500" /><span className="text-xs text-gray-500 hidden sm:inline">Hors ligne</span></>
              )}
            </div>
            
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
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
