/**
 * OverviewPage — Trivida Admin Panel
 * 
 * Page Vue d'ensemble avec :
 *   - KPI cards (total users, actifs, nouveaux, premium)
 *   - Courbe d'inscriptions (30 derniers jours)
 *   - Pie chart : répartition Free / Basic / Premium
 *   - Dernières erreurs de sync
 */
import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserPlus, Crown, TrendingUp, 
  AlertTriangle, Activity, Lock, Download, FileSpreadsheet
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { api, formatNumber, timeAgo, downloadFile } from '../utils/api';

/**
 * Carte KPI réutilisable
 */
function KPICard({ label, value, change, icon: Icon, color = 'trivida' }) {
  const colorClasses = {
    trivida: 'bg-trivida-600/20 text-trivida-400',
    emerald: 'bg-emerald-600/20 text-emerald-400',
    amber: 'bg-amber-600/20 text-amber-400',
    red: 'bg-red-600/20 text-red-400',
    purple: 'bg-purple-600/20 text-purple-400',
  };
  
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="kpi-value">{formatNumber(value)}</div>
      {change !== undefined && (
        <div className={`kpi-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)} cette semaine
        </div>
      )}
    </div>
  );
}

/**
 * Données mock pour le pie chart (remplacées par les données réelles)
 */
const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

export default function OverviewPage() {
  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, growthRes] = await Promise.all([
          api.get('/api/v1/trivida/admin/stats/overview'),
          api.get('/api/v1/trivida/admin/stats/growth?days=30'),
        ]);
        
        if (overviewRes.success) setOverview(overviewRes.data);
        if (growthRes.success) setGrowth(growthRes.data);
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

  // Données pour le pie chart
  const planData = [
    { name: 'Free', value: overview?.freeUsers || 0 },
    { name: 'Basic', value: overview?.basicUsers || 0 },
    { name: 'Premium', value: overview?.premiumUsers || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Vue d'ensemble</h1>
          <p className="text-gray-400 mt-1">Aperçu global de Trivida</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadFile('/api/v1/trivida/admin/export/stats?format=csv', 'trivida_stats.csv')}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Stats CSV
          </button>
          <button
            onClick={() => downloadFile('/api/v1/trivida/admin/export/stats?format=excel', 'trivida_stats.xlsx')}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Stats Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total utilisateurs"
          value={overview?.totalUsers}
          change={overview?.newUsersThisWeek}
          icon={Users}
          color="trivida"
        />
        <KPICard
          label="Actifs aujourd'hui"
          value={overview?.usersActiveToday}
          icon={UserCheck}
          color="emerald"
        />
        <KPICard
          label="Nouveaux (7j)"
          value={overview?.newUsersThisWeek}
          icon={UserPlus}
          color="amber"
        />
        <KPICard
          label="Premium actifs"
          value={overview?.premiumUsers}
          icon={Crown}
          color="purple"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courbe d'inscriptions */}
        <div className="lg:col-span-2 admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <TrendingUp className="w-5 h-5 inline mr-2 text-trivida-400" />
            Inscriptions (30 jours)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tickFormatter={(d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  fontSize={11}
                />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                  labelFormatter={(d) => new Date(d).toLocaleDateString('fr-FR')}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart plans */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Crown className="w-5 h-5 inline mr-2 text-amber-400" />
            Répartition des plans
          </h3>
          <div className="h-64">
            {planData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Aucune donnée
              </div>
            )}
          </div>
          {/* Légende */}
          <div className="flex justify-center gap-4 mt-2">
            {planData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-gray-400">{entry.name}</span>
                <span className="text-white font-medium">{formatNumber(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-600/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Utilisateurs verrouillés</div>
            <div className="text-xl font-bold text-white">{formatNumber(overview?.lockedUsers || 0)}</div>
          </div>
        </div>
        
        <div className="admin-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-600/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Comptes supprimés</div>
            <div className="text-xl font-bold text-white">{formatNumber(overview?.deletedUsers || 0)}</div>
          </div>
        </div>
        
        <div className="admin-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Nouveaux (30j)</div>
            <div className="text-xl font-bold text-white">{formatNumber(overview?.newUsersThisMonth || 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
