/**
 * NotificationDropdown — Trivida Admin Panel
 * 
 * Dropdown de notifications temps réel.
 * Affiche les notifications non lues avec :
 *   - Badge de type (info/warning/critical)
 *   - Icône selon le type
 *   - Temps relatif
 *   - Bouton "Tout marquer comme lu"
 */
import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { timeAgo } from '../utils/api';
import {
  UserPlus, Lock, Brain, AlertTriangle, Crown,
  RefreshCw, Trash2, Download, Bell, CheckCheck,
} from 'lucide-react';

/**
 * Icône et couleur selon le type de notification
 */
function getNotificationConfig(type, severity) {
  const configs = {
    new_user: { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
    user_locked: { icon: Lock, color: 'text-red-400', bg: 'bg-red-900/30' },
    quota_reached: { icon: Brain, color: 'text-amber-400', bg: 'bg-amber-900/30' },
    subscription_expiring: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-900/30' },
    subscription_expired: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/30' },
    sync_error: { icon: RefreshCw, color: 'text-red-400', bg: 'bg-red-900/30' },
    plan_changed: { icon: Crown, color: 'text-purple-400', bg: 'bg-purple-900/30' },
    user_deleted: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-900/30' },
    app_update: { icon: Download, color: 'text-trivida-400', bg: 'bg-trivida-900/30' },
    system_alert: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/30' },
  };
  
  return configs[type] || { icon: Bell, color: 'text-gray-400', bg: 'bg-gray-800' };
}

export default function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Filtrer pour n'afficher que les 20 premières
  const displayNotifications = notifications.slice(0, 20);

  return (
    <div className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-trivida-400" />
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-trivida-600 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-trivida-400 hover:text-trivida-300 flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tout lire
          </button>
        )}
      </div>

      {/* Liste des notifications */}
      <div className="flex-1 overflow-y-auto">
        {displayNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {displayNotifications.map((notif) => {
              const config = getNotificationConfig(notif.type, notif.severity);
              const Icon = config.icon;
              
              return (
                <div
                  key={notif._id}
                  className={`px-4 py-3 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-trivida-600/5' : ''
                  }`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif._id);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white truncate">{notif.title}</h4>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-trivida-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      <span className="text-xs text-gray-600 mt-1 block">{timeAgo(notif.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 20 && (
        <div className="px-4 py-2 border-t border-gray-800 text-center">
          <span className="text-xs text-gray-500">{notifications.length} notifications au total</span>
        </div>
      )}
    </div>
  );
}
