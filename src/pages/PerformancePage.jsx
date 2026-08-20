/**
 * PerformancePage — Trivida Admin Panel
 * 
 * Dashboard complet de performance avec :
 *   - Score de santé global (0-100)
 *   - Taux de sync, conversion, DAU
 *   - Toutes les métriques en un coup d'œil
 *   - Entités métier (transactions, dettes, etc.)
 *   - Graphiques Recharts
 */
import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, RefreshCw, Brain, TrendingUp, 
  DollarSign, AlertTriangle, Shield, Wifi, WifiOff,
  ArrowUpRight, ArrowDownRight, BarChart3, Zap, Heart
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { api, formatNumber, formatCurrency, timeAgo } from '../utils/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

function MetricCard({ label, value, icon: Icon, color = 'trivida', subtitle }) {
  const colors = {
    trivida: 'bg-trivida-600/20 text-trivida-400',
    emerald: 'bg-emerald-600/20 text-emerald-400',
    amber: 'bg-amber-600/20 text-amber-400',
    red: 'bg-red-600/20 text-red-400',
    purple: 'bg-purple-600/20 text-purple-400',
    blue: 'bg-blue-600/20 text-blue-400',
  };
  return (
    <div className="admin-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function HealthGauge({ score }) {
  const getColor = (s) => {
    if (s >= 80) return { stroke: '#10b981', label: 'Excellent', bg: 'text-emerald-400' };
    if (s >= 60) return { stroke: '#3b82f6', label: 'Bon', bg: 'text-blue-400' };
    if (s >= 40) return { stroke: '#f59e0b', label: 'Moyen', bg: 'text-amber-400' };
    return { stroke: '#ef4444', label: 'Critique', bg: 'text-red-400' };
  };
  const { stroke, label, bg } = getColor(score);
  
  return (
    <div className="admin-card flex flex-col items-center justify-center py-8">
      <h3 className="text-lg font-semibold text-white mb-4">
        <Heart className="w-5 h-5 inline mr-2 text-red-400" />
        Santé globale
      </h3>
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-36 h-36 transform -rotate-90">
          <circle cx="68" cy="68" r="60" stroke="#374151" strokeWidth="10" fill="none" />
          <circle cx="68" cy="68" r="60" stroke={stroke} strokeWidth="10" fill="none"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - score / 100)}`}
            strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute text-center">
          <div className="text-4xl font-bold text-white">{score}</div>
          <div className={`text-sm font-medium ${bg}`}>{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function PerformancePage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.get('/api/v1/trivida/admin/performance/dashboard');
        if (data.success) setDashboard(data.data);
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

  const d = dashboard;
  
  // Données pour le radar chart
  const radarData = [
    { metric: 'Sync', value: d.ratios?.syncRate || 0 },
    { metric: 'Conversion', value: d.ratios?.conversionRate || 0 },
    { metric: 'DAU', value: d.ratios?.dauRatio || 0 },
    { metric: 'IA', value: d.ai?.activeUsers > 0 ? Math.min(100, (d.ai.activeUsers / Math.max(1, d.users.active)) * 100) : 0 },
    { metric: 'Retention', value: Math.max(0, 100 - ((d.users.deleted / Math.max(1, d.users.total)) * 100)) },
  ];
  
  // Données pour le bar chart des entités
  const entityData = [
    { name: 'Transactions', value: d.entities?.transactions || 0, fill: '#3b82f6' },
    { name: 'Clients', value: d.entities?.customers || 0, fill: '#10b981' },
    { name: 'Activités', value: d.entities?.activities || 0, fill: '#f59e0b' },
    { name: 'Dettes', value: d.entities?.debts || 0, fill: '#8b5cf6' },
    { name: 'Épargne', value: d.entities?.savingsGoals || 0, fill: '#06b6d4' },
    { name: 'Factures', value: d.entities?.invoices || 0, fill: '#ef4444' },
  ];

  // Données pie chart plans
  const planData = [
    { name: 'Free', value: d.users?.free || 0 },
    { name: 'Basic', value: d.users?.basic || 0 },
    { name: 'Premium', value: d.users?.premium || 0 },
  ].filter(p => p.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Performance & Audit</h1>
        <p className="text-gray-400 mt-1">Vue complète de la santé et performance de Trivida</p>
      </div>

      {/* Score de santé + KPIs principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <HealthGauge score={d.healthScore || 0} />
        <MetricCard label="Utilisateurs actifs" value={formatNumber(d.users?.active)} icon={Users} color="trivida" subtitle={`/${d.users?.total} total`} />
        <MetricCard label="Revenu mensuel" value={formatCurrency(d.revenue?.estimatedMonthly)} icon={DollarSign} color="emerald" subtitle={`${d.revenue?.expiringIn7Days} expiration(s) 7j`} />
        <MetricCard label="Taux de conversion" value={`${d.ratios?.conversionRate || 0}%`} icon={TrendingUp} color="purple" subtitle="Free → Payant" />
      </div>

      {/* Ratios et métriques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-trivida-400">{d.ratios?.syncRate || 0}%</div>
          <div className="text-sm text-gray-400 mt-1">Taux de sync (7j)</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-emerald-400">{d.ratios?.dauRatio || 0}%</div>
          <div className="text-sm text-gray-400 mt-1">DAU Ratio</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-amber-400">{formatNumber(d.ai?.requestsToday || 0)}</div>
          <div className="text-sm text-gray-400 mt-1">Requêtes IA aujourd'hui</div>
        </div>
        <div className="admin-card text-center">
          <div className="text-3xl font-bold text-blue-400">{formatNumber(d.sync?.devices || 0)}</div>
          <div className="text-sm text-gray-400 mt-1">Appareils enregistrés</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <BarChart3 className="w-5 h-5 inline mr-2 text-trivida-400" />
            Profil de performance
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#6b7280" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6b7280" fontSize={10} />
                <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart entités */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Activity className="w-5 h-5 inline mr-2 text-emerald-400" />
            Entités métier
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entityData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#6b7280" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {entityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Répartition plans + Détails sync */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart plans */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <DollarSign className="w-5 h-5 inline mr-2 text-amber-400" />
            Répartition des plans
          </h3>
          <div className="flex items-center gap-8">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                    {planData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {planData.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-gray-400 text-sm">{p.name}</span>
                  <span className="text-white font-medium">{formatNumber(p.value)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-800 text-sm">
                <span className="text-gray-400">Revenu :</span> <span className="text-emerald-400 font-bold">{formatCurrency(d.revenue?.estimatedMonthly)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Détails synchronisation */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <RefreshCw className="w-5 h-5 inline mr-2 text-blue-400" />
            Détails synchronisation
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Sync aujourd\'hui', value: d.sync?.today, color: 'bg-emerald-400' },
              { label: 'Sync cette semaine', value: d.sync?.week, color: 'bg-trivida-400' },
              { label: 'Jamais synchronisé', value: d.sync?.neverSynced, color: 'bg-amber-400' },
              { label: 'Appareils enregistrés', value: d.sync?.devices, color: 'bg-blue-400' },
              { label: 'Utilisateurs verrouillés', value: d.users?.locked, color: 'bg-red-400' },
              { label: 'Nouveaux cette semaine', value: d.users?.newWeek, color: 'bg-purple-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-400">{item.label}</span>
                </div>
                <span className="text-white font-medium">{formatNumber(item.value || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
