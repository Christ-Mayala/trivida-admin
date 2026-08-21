/**
 * IntelHealthPage — HEALTHSCORE DASHBOARD
 * 
 * Statistiques du HealthScore : moyenne globale, par ville, par plan,
 * distribution, tendances, users en progression/chute.
 */
import React, { useState, useEffect } from 'react';
import { 
  Heart, TrendingUp, TrendingDown, Users, MapPin,
  Crown, BarChart3, ArrowUpRight, ArrowDownRight, Construction
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { api, formatNumber } from '../utils/api';

const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#006B4D'];

function ScoreBar({ label, score, max, color = 'trivida' }) {
  const percent = max > 0 ? (score / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{score} / {max}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full bg-${color}-500 transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function IntelHealthPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/api/v1/trivida/admin/intel/health');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error(err);
        if (err.message?.includes('404') || err.message?.includes('Not Found') || err.message?.includes('Failed to fetch')) {
          setError('endpoint_not_ready');
        } else {
          setError(err.message);
        }
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

  if (error === 'endpoint_not_ready') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-emerald-400" />
            HealthScore
          </h1>
          <p className="text-gray-400 mt-1">Santé financière globale des utilisateurs Trivida</p>
        </div>
        <div className="admin-card text-center py-16">
          <Construction className="w-16 h-16 text-amber-400/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Bientôt disponible</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Cette page sera connectée quand le backend exposera l'endpoint
            <code className="mx-1 px-2 py-0.5 bg-gray-800 rounded text-trivida-400 text-sm">GET /admin/intel/health</code>
          </p>
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg max-w-sm mx-auto text-left">
            <p className="text-xs text-gray-500 font-medium mb-2">Données attendues :</p>
            <div className="space-y-1 text-xs text-gray-400">
              <div>• Score moyen global (0-100)</div>
              <div>• Répartition : Épargne / Budget / Dettes / Régularité</div>
              <div>• Score par ville et par plan</div>
              <div>• Distribution des scores</div>
              <div>• Utilisateurs en progression / chute</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const distributionData = data?.distribution || [
    { range: '0-20', count: 0 },
    { range: '21-40', count: 0 },
    { range: '41-60', count: 0 },
    { range: '61-80', count: 0 },
    { range: '81-100', count: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Heart className="w-6 h-6 text-emerald-400" />
          HealthScore
        </h1>
        <p className="text-gray-400 mt-1">Santé financière globale des utilisateurs Trivida</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="admin-card text-center">
          <Heart className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-white">{Number(data?.avgScore) || 0}</div>
          <div className="text-sm text-gray-400">Score moyen</div>
        </div>
        <div className="admin-card text-center">
          <Users className="w-6 h-6 text-trivida-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-white">{formatNumber(Number(data?.totalScored) || 0)}</div>
          <div className="text-sm text-gray-400">Utilisateurs scorés</div>
        </div>
        <div className="admin-card text-center">
          <ArrowUpRight className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-emerald-400">{formatNumber(Number(data?.improving) || 0)}</div>
          <div className="text-sm text-gray-400">En progression</div>
        </div>
        <div className="admin-card text-center">
          <ArrowDownRight className="w-6 h-6 text-red-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-red-400">{formatNumber(Number(data?.declining) || 0)}</div>
          <div className="text-sm text-gray-400">En chute</div>
        </div>
      </div>

      {/* Composantes */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4">Composantes du HealthScore (sur 100)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScoreBar label="Épargne" score={Number(data?.avgSavings) || 0} max={30} color="trivida" />
          <ScoreBar label="Budget" score={Number(data?.avgBudget) || 0} max={25} color="blue" />
          <ScoreBar label="Dettes" score={Number(data?.avgDebts) || 0} max={25} color="amber" />
          <ScoreBar label="Régularité" score={Number(data?.avgRegularity) || 0} max={20} color="purple" />
        </div>
      </div>

      {/* Distribution + Tendances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <BarChart3 className="w-5 h-5 inline mr-2 text-trivida-400" />
            Distribution des scores
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
                <Bar dataKey="count" fill="#006B4D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <TrendingUp className="w-5 h-5 inline mr-2 text-trivida-400" />
            Évolution mensuelle
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.weeklyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
                <Line type="monotone" dataKey="avg" stroke="#006B4D" strokeWidth={2} dot={{ fill: '#006B4D' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Par ville + Par plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-trivida-400" />
            Score par ville
          </h3>
          <div className="space-y-3">
            {(data?.byCity || []).map((city, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50">
                <span className="text-gray-300">{city.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">({city.count})</span>
                  <span className={`font-bold ${city.avg >= 70 ? 'text-emerald-400' : city.avg >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{city.avg}</span>
                </div>
              </div>
            ))}
            {(!data?.byCity || data.byCity.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">Aucune donnée par ville</p>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Score par plan
          </h3>
          <div className="space-y-3">
            {(data?.byPlan || []).map((plan, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50">
                <span className="text-gray-300 capitalize">{plan.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">({plan.count})</span>
                  <span className={`font-bold ${plan.avg >= 70 ? 'text-emerald-400' : plan.avg >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{plan.avg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top en progression + Top en chute */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Forte progression
          </h3>
          <div className="space-y-2">
            {(data?.topImproving || []).slice(0, 5).map((u, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50">
                <span className="text-gray-300">{u.name}</span>
                <span className="text-emerald-400 font-bold">+{u.delta} pts</span>
              </div>
            ))}
            {(!data?.topImproving || data.topImproving.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">Aucune donnée</p>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Score en chute
          </h3>
          <div className="space-y-2">
            {(data?.topDeclining || []).slice(0, 5).map((u, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50">
                <span className="text-gray-300">{u.name}</span>
                <span className="text-red-400 font-bold">{u.delta} pts</span>
              </div>
            ))}
            {(!data?.topDeclining || data.topDeclining.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">Aucune donnée</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
