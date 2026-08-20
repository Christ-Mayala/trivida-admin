/**
 * AIPage — Trivida Admin Panel
 * 
 * Page IA & Quotas avec :
 *   - Requêtes IA totales par jour (graphique Recharts)
 *   - Utilisateurs ayant atteint leur quota
 *   - Consommation globale + jauge
 *   - Historique 30 jours
 */
import React, { useState, useEffect } from 'react';
import { 
  Brain, Zap, Users, AlertTriangle, TrendingUp, 
  Activity, Target, BarChart3, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { api, formatNumber } from '../utils/api';

export default function AIPage() {
  const [aiStats, setAIStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [aiHistory, setAIHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(aiStats === null); // spinner only on first load
    setError(null);
    
    try {
      const [aiRes, overviewRes, historyRes] = await Promise.all([
        api.get('/api/v1/trivida/admin/stats/ai'),
        api.get('/api/v1/trivida/admin/stats/overview'),
        api.get('/api/v1/trivida/admin/stats/ai/history?days=30'),
      ]);
      
      if (aiRes.success) setAIStats(aiRes.data);
      if (overviewRes.success) setOverview(overviewRes.data);
      if (historyRes.success) setAIHistory(historyRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !aiStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500"></div>
      </div>
    );
  }

  if (error && !aiStats) {
    return (
      <div className="admin-card text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Erreur de chargement</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  const quotaUsage = aiStats?.quotaLimit > 0 
    ? Math.round(((aiStats?.usersQuotaReached || 0) / Math.max(1, overview?.activeUsers || 1)) * 100)
    : 0;

  // Préparer les données pour le graphique (dates formatées FR)
  const chartData = aiHistory.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">IA & Quotas</h1>
          <p className="text-gray-400 mt-1">Consommation de l'intelligence artificielle Trivida Intel</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Requêtes aujourd'hui</span>
            <div className="w-10 h-10 rounded-lg bg-trivida-600/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-trivida-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{formatNumber(aiStats?.totalAIRequestsToday || 0)}</div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Utilisateurs actifs IA</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{formatNumber(aiStats?.usersWithAIRequests || 0)}</div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Quota atteint (5/jour)</span>
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{formatNumber(aiStats?.usersQuotaReached || 0)}</div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Limite par user</span>
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{aiStats?.quotaLimit || 5}</div>
          <div className="text-xs text-gray-500 mt-1">requêtes / jour</div>
        </div>
      </div>

      {/* ── Graphique consommation IA par jour ─────────────────────────────── */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4">
          <BarChart3 className="w-5 h-5 inline mr-2 text-trivida-400" />
          Consommation IA — 30 derniers jours
        </h3>
        
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQuota" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="label" 
                  stroke="#6b7280" 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalRequests" 
                  name="Requêtes totales"
                  stroke="#3b82f6" 
                  fill="url(#colorRequests)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="activeUsers" 
                  name="Utilisateurs actifs"
                  stroke="#10b981" 
                  fill="url(#colorActive)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="quotaReached" 
                  name="Quota atteint"
                  stroke="#f59e0b" 
                  fill="url(#colorQuota)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Pas encore de données historiques</p>
              <p className="text-xs mt-1">Les snapshots quotidiens commenceront demain à minuit</p>
            </div>
          </div>
        )}
      </div>

      {/* Graphique et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consommation globale */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Activity className="w-5 h-5 inline mr-2 text-trivida-400" />
            Consommation IA
          </h3>
          
          <div className="space-y-6">
            {/* Jauge de quota */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Utilisateurs au quota</span>
                <span className="text-white font-medium">{quotaUsage}%</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-trivida-500 to-trivida-600"
                  style={{ width: `${Math.min(100, quotaUsage)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {aiStats?.usersQuotaReached || 0} sur {overview?.activeUsers || 0} actifs ont atteint le quota
              </div>
            </div>
            
            {/* Répartition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-gray-300">Utilisateurs avec requêtes</span>
                </div>
                <span className="text-white font-medium">{formatNumber(aiStats?.usersWithAIRequests || 0)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <span className="text-gray-300">Quota atteint</span>
                </div>
                <span className="text-white font-medium">{formatNumber(aiStats?.usersQuotaReached || 0)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-gray-300">Pas de requêtes</span>
                </div>
                <span className="text-white font-medium">
                  {formatNumber((overview?.activeUsers || 0) - (aiStats?.usersWithAIRequests || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations sur l'IA */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Brain className="w-5 h-5 inline mr-2 text-purple-400" />
            Trivida Intel
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-trivida-600/10 border border-trivida-600/20 rounded-lg">
              <h4 className="text-sm font-semibold text-trivida-300 mb-2">Comment ça marche</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-trivida-400 mt-0.5">•</span>
                  <span>Chaque utilisateur a un quota de <strong className="text-white">{aiStats?.quotaLimit || 5} requêtes/jour</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-trivida-400 mt-0.5">•</span>
                  <span>Le quota est remis à zéro automatiquement à minuit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-trivida-400 mt-0.5">•</span>
                  <span>L'IA analyse les transactions et fournit des conseils personnalisés</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-trivida-400 mt-0.5">•</span>
                  <span>Le profil Intel (objectifs, habitudes) améliore la pertinence des réponses</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Statut du service IA</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-white text-sm font-medium">Actif — Clé API FreeLLM configurée</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
