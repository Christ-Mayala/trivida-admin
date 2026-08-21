/**
 * IntelPredictionsPage — PREDICTIVE ENGINE
 * 
 * Statistiques des prédictions et insights générés.
 * Types : Post-salaire, Jour-pic, Habitude-économie, Prévision budgétaire.
 */
import React, { useState, useEffect } from 'react';
import { Zap, Eye, EyeOff, Lightbulb, TrendingUp, Users } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { api, formatNumber } from '../utils/api';
import ComingSoon from '../components/ComingSoon';

export default function IntelPredictionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/api/v1/trivida/admin/intel/predictions');
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

  const typeData = data?.byType || [
    { type: 'Post-salaire', count: 0 },
    { type: 'Jour-pic', count: 0 },
    { type: 'Habitude-économie', count: 0 },
    { type: 'Prévision budgétaire', count: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyan-400" />
          Predictive Engine
          <span className="text-xs font-bold text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-800/50">Bientôt disponible</span>
        </h1>
        <p className="text-gray-400 mt-1">Insights prédictifs — sera branché quand le mobile implémentera le Predictive Engine</p>
      </div>
      <ComingSoon>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="admin-card text-center">
          <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-white">{formatNumber(data?.totalPredictions || 0)}</div>
          <div className="text-sm text-gray-400">Prédictions totales</div>
        </div>
        <div className="admin-card text-center">
          <Lightbulb className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-white">{formatNumber(data?.insightsGenerated || 0)}</div>
          <div className="text-sm text-gray-400">Insights générés</div>
        </div>
        <div className="admin-card text-center">
          <Eye className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-emerald-400">{formatNumber(data?.insightsRead || 0)}</div>
          <div className="text-sm text-gray-400">Insights lus</div>
        </div>
        <div className="admin-card text-center">
          <EyeOff className="w-6 h-6 text-red-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-red-400">{formatNumber(data?.insightsIgnored || 0)}</div>
          <div className="text-sm text-gray-400">Insights ignorés</div>
        </div>
      </div>

      {/* Taux d'engagement insights */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-trivida-400" />
          Taux d'engagement insights
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{data?.readRate || 0}%</div>
            <div className="text-sm text-gray-400 mt-1">Lus</div>
            <div className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data?.readRate || 0}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{data?.actedRate || 0}%</div>
            <div className="text-sm text-gray-400 mt-1">Agis dessus</div>
            <div className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${data?.actedRate || 0}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{data?.ignoredRate || 0}%</div>
            <div className="text-sm text-gray-400 mt-1">Ignorés</div>
            <div className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${data?.ignoredRate || 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Types de prédictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">Types de prédictions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#6b7280" fontSize={11} />
                <YAxis dataKey="type" type="category" stroke="#6b7280" fontSize={11} width={140} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
                <Bar dataKey="count" fill="#006B4D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">Détails</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
              <span className="text-gray-400">Analyses locales (offline)</span>
              <span className="text-white font-bold">{formatNumber(data?.localAnalyses || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
              <span className="text-gray-400">Analyses serveur</span>
              <span className="text-white font-bold">{formatNumber(data?.serverAnalyses || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
              <span className="text-gray-400">Max insights actifs/user</span>
              <span className="text-trivida-400 font-bold">{data?.maxActiveInsights || 3}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
              <span className="text-gray-400">Période d'analyse</span>
              <span className="text-white font-bold">{data?.analysisPeriod || 30} jours</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Utilisateurs avec insights actifs</span>
              <span className="text-emerald-400 font-bold">{formatNumber(data?.usersWithActiveInsights || 0)}</span>
            </div>
          </div>
        </div>
      </div>
      </ComingSoon>
    </div>
  );
}
