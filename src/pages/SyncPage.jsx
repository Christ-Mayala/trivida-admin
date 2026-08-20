/**
 * SyncPage — Trivida Admin Panel
 * 
 * Page Sync & Santé avec :
 *   - Volume de sync par jour/semaine
 *   - Utilisateurs synchronisés vs jamais synchronisés
 *   - Appareils enregistrés
 *   - Utilisateurs bloqués
 */
import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Smartphone, AlertTriangle, CheckCircle, 
  Wifi, WifiOff, Users, Clock
} from 'lucide-react';
import { api, formatNumber } from '../utils/api';

/**
 * Carte de métrique
 */
function MetricCard({ label, value, icon: Icon, color = 'trivida', description }) {
  const colors = {
    trivida: 'bg-trivida-600/20 text-trivida-400',
    emerald: 'bg-emerald-600/20 text-emerald-400',
    amber: 'bg-amber-600/20 text-amber-400',
    red: 'bg-red-600/20 text-red-400',
    blue: 'bg-blue-600/20 text-blue-400',
  };
  
  return (
    <div className="admin-card">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{formatNumber(value)}</div>
      {description && <div className="text-xs text-gray-500">{description}</div>}
    </div>
  );
}

export default function SyncPage() {
  const [syncStats, setSyncStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [syncRes, overviewRes] = await Promise.all([
          api.get('/api/v1/trivida/admin/stats/sync'),
          api.get('/api/v1/trivida/admin/stats/overview'),
        ]);
        
        if (syncRes.success) setSyncStats(syncRes.data);
        if (overviewRes.success) setOverview(overviewRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Erreur de chargement</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  // Calcul du taux de sync
  const totalUsers = (overview?.activeUsers || 0);
  const syncRate = totalUsers > 0 
    ? Math.round(((syncStats?.usersSyncWeek || 0) / totalUsers) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Sync & Santé</h1>
        <p className="text-gray-400 mt-1">Monitoring de la synchronisation et de l'état des appareils</p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Sync aujourd'hui"
          value={syncStats?.usersSyncToday || 0}
          icon={RefreshCw}
          color="emerald"
          description="Utilisateurs ayant synchronisé"
        />
        <MetricCard
          label="Sync cette semaine"
          value={syncStats?.usersSyncWeek || 0}
          icon={Clock}
          color="trivida"
          description={`${syncRate}% des actifs`}
        />
        <MetricCard
          label="Jamais synchronisé"
          value={syncStats?.usersNeverSynced || 0}
          icon={WifiOff}
          color="amber"
          description="Inscrits mais jamais sync"
        />
        <MetricCard
          label="Appareils enregistrés"
          value={syncStats?.totalDeviceIds || 0}
          icon={Smartphone}
          color="blue"
          description="Multi-device total"
        />
      </div>

      {/* Santé du système */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4">
          <CheckCircle className="w-5 h-5 inline mr-2 text-emerald-400" />
          État de santé
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Taux de sync */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#374151"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - syncRate / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-bold text-white">{syncRate}%</div>
                <div className="text-xs text-gray-400">Taux sync</div>
              </div>
            </div>
          </div>
          
          {/* Utilisateurs verrouillés */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-white">{overview?.lockedUsers || 0}</div>
            <div className="text-sm text-gray-400">Utilisateurs verrouillés</div>
            <div className="text-xs text-gray-500 mt-1">Tentatives de login échouées</div>
          </div>
          
          {/* Multi-device */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center mb-3">
              <Smartphone className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{syncStats?.totalDeviceIds || 0}</div>
            <div className="text-sm text-gray-400">Appareils actifs</div>
            <div className="text-xs text-gray-500 mt-1">Moyen par user : {
              overview?.activeUsers > 0 
                ? (syncStats?.totalDeviceIds / overview.activeUsers).toFixed(1)
                : '0'
            }</div>
          </div>
        </div>
      </div>

      {/* Dernières synchronisations */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4">
          <Wifi className="w-5 h-5 inline mr-2 text-trivida-400" />
          Résumé de connectivité
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-gray-300">Utilisateurs synchronisés (7j)</span>
            </div>
            <span className="text-white font-medium">{formatNumber(syncStats?.usersSyncWeek || 0)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span className="text-gray-300">Utilisateurs jamais synchronisés</span>
            </div>
            <span className="text-white font-medium">{formatNumber(syncStats?.usersNeverSynced || 0)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-gray-300">Total appareils enregistrés</span>
            </div>
            <span className="text-white font-medium">{formatNumber(syncStats?.totalDeviceIds || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
