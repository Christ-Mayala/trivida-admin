/**
 * IntelDecisionsPage — DECISION ENGINE ANALYTICS
 * 
 * Statistiques agrégées des décisions analysées.
 * Pas de données privées — uniquement les métriques.
 */
import React, { useState, useEffect } from 'react';
import { Brain, Clock, AlertTriangle, Zap, Users, BarChart3 } from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import { api, formatNumber } from '../utils/api';
import ComingSoon from '../components/ComingSoon';

const COLORS = ['#006B4D', '#3EC29A', '#f59e0b', '#8b5cf6', '#6b7280'];

export default function IntelDecisionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/api/v1/trivida/admin/intel/decisions');
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

  const categoryData = data?.categories || [
    { name: "Puis-je acheter ?", percent: 0 },
    { name: "Puis-je économiser ?", percent: 0 },
    { name: "Objectif d'épargne", percent: 0 },
    { name: "Dette", percent: 0 },
    { name: "Autres", percent: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Decision Engine
          <span className="text-xs font-bold text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-800/50">Bientôt disponible</span>
        </h1>
        <p className="text-gray-400 mt-1">Analyses agrégées des décisions financières — sera branché quand le mobile implémentera le Decision Engine</p>
      </div>
      <ComingSoon>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="admin-card text-center">
          <Brain className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-white">{formatNumber(data?.totalDecisions || 0)}</div>
          <div className="text-sm text-gray-400">Décisions aujourd'hui</div>
        </div>
        <div className="admin-card text-center">
          <Clock className="w-6 h-6 text-trivida-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-white">{data?.avgResponseTime || '—'}</div>
          <div className="text-sm text-gray-400">Temps moyen réponse</div>
        </div>
        <div className="admin-card text-center">
          <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-white">{data?.errorRate || 0}%</div>
          <div className="text-sm text-gray-400">Taux d'erreur IA</div>
        </div>
        <div className="admin-card text-center">
          <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-white">{data?.quotaUsed || 0}%</div>
          <div className="text-sm text-gray-400">Quota consommé</div>
        </div>
      </div>

      {/* Répartition par plan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Premium', value: data?.byPlan?.premium || 0, color: 'purple' },
          { label: 'Business', value: data?.byPlan?.business || 0, color: 'amber' },
          { label: 'Autres', value: data?.byPlan?.other || 0, color: 'gray' },
        ].map((item, i) => (
          <div key={i} className="admin-card flex items-center justify-between">
            <span className="text-gray-400">{item.label}</span>
            <span className="text-xl font-bold text-white">{formatNumber(item.value)}</span>
          </div>
        ))}
      </div>

      {/* Catégories de décisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-trivida-400" />
            Catégories de décisions
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="percent" nameKey="name">
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-gray-400">{cat.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{cat.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Détails */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">Détails</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
              <span className="text-gray-400">Analyses locales (hors-ligne)</span>
              <span className="text-white font-bold">{formatNumber(data?.localAnalyses || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
              <span className="text-gray-400">Analyses serveur</span>
              <span className="text-white font-bold">{formatNumber(data?.serverAnalyses || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
              <span className="text-gray-400">Total requêtes IA</span>
              <span className="text-white font-bold">{formatNumber(data?.totalAIRequests || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
              <span className="text-gray-400">Utilisateurs actifs IA</span>
              <span className="text-white font-bold">{formatNumber(data?.activeAIUsers || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Quota atteint</span>
              <span className="text-amber-400 font-bold">{formatNumber(data?.quotaReachedUsers || 0)} users</span>
            </div>
          </div>
        </div>
      </div>
      </ComingSoon>
    </div>
  );
}
