/**
 * NotificationsPushPage — PUSH NOTIFICATIONS
 * 
 * Statistiques des notifications push et gestion des campagnes.
 */
import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Eye, EyeOff, AlertTriangle, CheckCircle,
  Clock, Users, TrendingUp, Plus
} from 'lucide-react';
import { api, formatNumber } from '../utils/api';

const NOTIF_TYPES = [
  { key: 'budget', label: 'Budget', color: 'trivida' },
  { key: 'dette', label: 'Dette', color: 'red' },
  { key: 'epargne', label: 'Épargne', color: 'emerald' },
  { key: 'lifeos', label: 'LifeOS', color: 'purple' },
  { key: 'daily_insight', label: 'Daily Insight', color: 'amber' },
  { key: 'challenge', label: 'Challenge', color: 'blue' },
  { key: 'streak', label: 'Streak', color: 'amber' },
  { key: 'monthly_summary', label: 'Résumé mensuel', color: 'trivida' },
  { key: 'promotion', label: 'Promotion', color: 'purple' },
  { key: 'maintenance', label: 'Maintenance', color: 'gray' },
];

const WINDOWS = [
  { time: '08:00', label: 'Matin' },
  { time: '13:00', label: 'Midi' },
  { time: '18:00', label: 'Soir' },
  { time: '22:00', label: 'Nuit' },
];

export default function NotificationsPushPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/api/v1/trivida/admin/notifications/stats');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-trivida-400" />
          Notifications Push
        </h1>
        <p className="text-gray-400 mt-1">Statistiques et campagnes de notifications push</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="admin-card text-center">
          <Send className="w-5 h-5 text-trivida-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{formatNumber(data?.sent || 0)}</div>
          <div className="text-xs text-gray-400">Envoyées</div>
        </div>
        <div className="admin-card text-center">
          <Eye className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{formatNumber(data?.delivered || 0)}</div>
          <div className="text-xs text-gray-400">Délivrées</div>
        </div>
        <div className="admin-card text-center">
          <EyeOff className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{formatNumber(data?.opened || 0)}</div>
          <div className="text-xs text-gray-400">Ouvertes</div>
        </div>
        <div className="admin-card text-center">
          <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-amber-400">{data?.openRate || 0}%</div>
          <div className="text-xs text-gray-400">Taux ouverture</div>
        </div>
        <div className="admin-card text-center">
          <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-red-400">{formatNumber(data?.errors || 0)}</div>
          <div className="text-xs text-gray-400">Erreurs</div>
        </div>
      </div>

      {/* Fenêtres horaires */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-trivida-400" />
          Fenêtres quotidiennes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {WINDOWS.map(w => (
            <div key={w.time} className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-white">{w.time}</div>
              <div className="text-sm text-gray-400 mt-1">{w.label}</div>
              <div className="text-xs text-gray-500 mt-2">
                {formatNumber(data?.windows?.[w.time]?.sent || 0)} envoyées
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Types de notifications */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4">Types de notifications</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {NOTIF_TYPES.map(type => (
            <div key={type.key} className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-lg font-bold text-white">{formatNumber(data?.byType?.[type.key] || 0)}</div>
              <div className="text-xs text-gray-400 mt-1">{type.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dernières campagnes */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-trivida-400" />
          Dernières campagnes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Titre</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Envoyées</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Ouvertes</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentCampaigns || []).map((c, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-white">{c.title}</td>
                  <td className="py-3 px-4 text-gray-400 capitalize">{c.type}</td>
                  <td className="py-3 px-4 text-center text-gray-300">{formatNumber(c.sent)}</td>
                  <td className="py-3 px-4 text-center text-emerald-400">{c.openRate}%</td>
                  <td className="py-3 px-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
              {(!data?.recentCampaigns || data.recentCampaigns.length === 0) && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">Aucune campagne</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
