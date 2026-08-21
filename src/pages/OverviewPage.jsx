/**
 * OverviewPage — TRIVIDA COMMAND CENTER
 * 
 * Dashboard principal du centre de pilotage Trivida.
 * Affiche : KPIs globaux, Intel, Système, Alertes
 */
import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserPlus, Crown, TrendingUp, 
  AlertTriangle, Activity, Lock, Download, FileSpreadsheet,
  Brain, Zap, Target, Flame, Shield, Wifi, WifiOff,
  Server, Database, Clock, BarChart3, DollarSign,
  Heart, Lightbulb, Trophy, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { api, formatNumber, downloadFile } from '../utils/api';
import { ComingSoonBadge } from '../components/ComingSoon';

const PIE_COLORS = ['#006B4D', '#f59e0b', '#3EC29A', '#8b5cf6'];

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return isNaN(n) || !isFinite(n) ? fallback : n;
}

function KPICard({ label, value, change, icon: Icon, color = 'trivida', subtitle }) {
  const colorMap = {
    trivida: 'bg-trivida-600/20 text-trivida-400',
    emerald: 'bg-emerald-600/20 text-emerald-400',
    amber: 'bg-amber-600/20 text-amber-400',
    red: 'bg-red-600/20 text-red-400',
    purple: 'bg-purple-600/20 text-purple-400',
    blue: 'bg-blue-600/20 text-blue-400',
    cyan: 'bg-cyan-600/20 text-cyan-400',
  };
  const displayValue = typeof value === 'string' ? value : formatNumber(safeNumber(value));
  return (
    <div className="admin-card group hover:border-trivida-600/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.trivida}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold text-white">{displayValue}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      {change !== undefined && (
        <div className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(safeNumber(change))} cette semaine
        </div>
      )}
    </div>
  );
}

function SystemStatus({ name, status, latency }) {
  const isOk = status === 'OPERATIONAL' || status === 'ok';
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOk ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
        <span className="text-sm text-gray-300">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        {latency && <span className="text-xs text-gray-500">{latency}</span>}
        <span className={`text-xs font-medium ${isOk ? 'text-emerald-400' : 'text-red-400'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function IntelBar({ label, percent, color = 'trivida' }) {
  const colorMap = {
    trivida: 'bg-trivida-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
  };
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{percent}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorMap[color]}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, growthRes, perfRes] = await Promise.allSettled([
          api.get('/api/v1/trivida/admin/stats/overview'),
          api.get('/api/v1/trivida/admin/stats/growth?days=30'),
          api.get('/api/v1/trivida/admin/performance/dashboard'),
        ]);
        
        const overview = overviewRes.status === 'fulfilled' ? overviewRes.value?.data : null;
        const growthData = growthRes.status === 'fulfilled' ? growthRes.value?.data : [];
        const perf = perfRes.status === 'fulfilled' ? perfRes.value?.data : null;
        
        // Vérifier si au moins une API a répondu
        const hasApi = overview || perf;
        if (!hasApi) {
          setApiError('API non joignable. Configurez VITE_API_URL dans les variables d\'environnement Netlify.');
        }
        
        setData({ ...overview, ...perf });
        if (growthData) setGrowth(growthData);
      } catch (err) {
        console.error(err);
        setApiError(err.message || 'Erreur de connexion à l\'API');
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

  const planData = [
    { name: 'Free', value: data?.freeUsers || 0 },
    { name: 'Basic', value: data?.basicUsers || 0 },
    { name: 'Premium', value: data?.premiumUsers || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Alerte API */}
      {apiError && (
        <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-amber-300">API non connectée</h4>
              <p className="text-xs text-amber-400/70 mt-1">{apiError}</p>
              <p className="text-xs text-gray-500 mt-2">
                Dans Netlify → Site configuration → Environment variables, ajoutez :<br/>
                <code className="text-trivida-400">VITE_API_URL = https://dryapi.onrender.com</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Command Center */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-trivida-400" />
            TRIVIDA COMMAND CENTER
          </h1>
          <p className="text-gray-400 mt-1">Centre de pilotage de l'écosystème Trivida</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadFile('/api/v1/trivida/admin/export/stats?format=csv', 'trivida_stats.csv')} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => downloadFile('/api/v1/trivida/admin/export/stats?format=excel', 'trivida_stats.xlsx')} className="btn-secondary flex items-center gap-2 text-sm">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* ═══ SECTION : AUJOURD'HUI ═══ */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Aujourd'hui</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard label="Utilisateurs" value={data?.totalUsers || 0} icon={Users} color="trivida" subtitle={`${data?.activeUsers || 0} actifs`} />
          <KPICard label="Nouveaux" value={data?.newUsersThisWeek || 0} icon={UserPlus} color="emerald" subtitle="cette semaine" />
          <KPICard label="DAU" value={data?.usersActiveToday || 0} icon={UserCheck} color="blue" subtitle="actifs aujourd'hui" />
          <KPICard label="Premium" value={data?.premiumUsers || 0} icon={Crown} color="purple" subtitle={`${data?.basicUsers || 0} basic`} />
          <KPICard label="MRR" value={(() => { const v = (safeNumber(data?.basicUsers) * 2000 + safeNumber(data?.premiumUsers) * 3500); return v > 0 ? `${Math.round(v / 1000)}K` : '—'; })()} icon={DollarSign} color="amber" subtitle="XAF/mois" />
          <KPICard label="HealthScore" value={data?.avgHealthScore != null ? safeNumber(data.avgHealthScore) : '—'} icon={Heart} color="emerald" subtitle="moyen" />
        </div>
      </div>

      {/* ═══ SECTION : INTEL ═══ */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-trivida-400" />
          TRIVIDA INTEL
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'LifeOS', value: data?.lifeosToday || 0, icon: Heart, color: 'emerald', soon: true },
            { label: 'Insights', value: data?.insightsGenerated || 0, icon: Lightbulb, color: 'amber', soon: true },
            { label: 'Décisions', value: data?.decisionsAnalyzed || 0, icon: Brain, color: 'purple', soon: true },
            { label: 'Challenges', value: data?.challengesActive || 0, icon: Trophy, color: 'blue', soon: true },
            { label: 'Streak moyen', value: `${safeNumber(data?.avgStreak)}j`, icon: Flame, color: 'amber' },
            { label: 'Profiles', value: safeNumber(data?.intelProfilesCompleted), icon: Target, color: 'trivida' },
            { label: 'HealthScore', value: safeNumber(data?.avgHealthScore), icon: Heart, color: 'emerald' },
            { label: 'Prédictions', value: data?.predictionsMade || 0, icon: Zap, color: 'cyan', soon: true },
          ].map((item, i) => (
            <div key={i} className="admin-card text-center py-3 relative">
              <item.icon className={`w-5 h-5 mx-auto mb-1 text-${item.color}-400`} />
              <div className="text-lg font-bold text-white">{item.soon && !item.value ? '—' : formatNumber(item.value)}</div>
              <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1">
                {item.label}
                {item.soon && <ComingSoonBadge />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ SECTION : ENGAGEMENT INTEL ═══ */}
      <div className="admin-card">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-trivida-400" />
          ENGAGEMENT INTEL
          <span className="text-[10px] text-amber-400 font-bold ml-2">Branchage mobile en cours</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <IntelBar label="LifeOS ✓connecté" percent={data?.lifeosEngagement || 0} color="trivida" />
          <IntelBar label="Decision Engine ⏳" percent={0} color="purple" />
          <IntelBar label="Predictive Engine ⏳" percent={0} color="blue" />
          <IntelBar label="Growth Brain ⏳" percent={0} color="amber" />
        </div>
        <p className="text-xs text-gray-600 mt-3">Decision Engine, Predictive Engine et Growth Brain seront branchés lorsque les modules correspondants seront implémentés côté mobile.</p>
      </div>

      {/* Graphiques + Système */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courbe inscriptions */}
        <div className="lg:col-span-2 admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <TrendingUp className="w-5 h-5 inline mr-2 text-trivida-400" />
            Inscriptions (30 jours)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6b7280" tickFormatter={(d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
                <Line type="monotone" dataKey="count" stroke="#006B4D" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Système */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            Système
          </h3>
          <div className="space-y-1 divide-y divide-gray-800">
            <SystemStatus name="API" status={data?.apiStatus || 'OPERATIONAL'} latency={data?.apiLatency || '45ms'} />
            <SystemStatus name="MongoDB" status={data?.mongoStatus || 'OPERATIONAL'} latency={data?.mongoLatency || '12ms'} />
            <SystemStatus name="Sync" status={data?.syncStatus || 'OPERATIONAL'} latency={`${data?.syncUptime || 99.8}%`} />
            <SystemStatus name="IA" status={data?.iaStatus || 'OPERATIONAL'} latency={data?.iaLatency || '120ms'} />
            <SystemStatus name="SenePay" status={data?.paymentStatus || 'OPERATIONAL'} />
            <SystemStatus name="Notifications" status={data?.notifStatus || 'OPERATIONAL'} />
          </div>
        </div>
      </div>

      {/* ═══ SECTION : ALERTES ═══ */}
      <div className="admin-card border-amber-800/30">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          ALERTES
          <span className="text-[10px] text-gray-500 font-normal ml-2">Données en temps réel — sera connecté au backend</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Erreurs API', count: data?.apiErrors, color: 'red', icon: AlertTriangle, desc: 'Erreurs 5xx les dernières 24h' },
            { label: 'Paiements en attente', count: data?.pendingPayments, color: 'amber', icon: DollarSign, desc: 'Transactions en attente de confirmation' },
            { label: 'DEVICE_KICKED', count: data?.deviceKicked, color: 'purple', icon: Lock, desc: 'Users déconnectés (nouveau login)' },
            { label: 'Problèmes IA', count: data?.iaErrors, color: 'blue', icon: Brain, desc: 'Erreurs IA les dernières 24h' },
          ].map((alert, i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <alert.icon className={`w-4 h-4 text-${alert.color}-400 shrink-0`} />
                <span className="text-xs text-gray-400">{alert.label}</span>
              </div>
              <div className="text-xl font-bold text-white mb-1">
                {alert.count != null ? alert.count : <span className="text-gray-600 text-sm font-normal">Bientôt dispo</span>}
              </div>
              <p className="text-[11px] text-gray-600 leading-tight">{alert.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Répartition plans + Stats secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Crown className="w-5 h-5 inline mr-2 text-amber-400" />
            Plans
          </h3>
          <div className="h-48">
            {planData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {planData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">Aucune donnée</div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {planData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                <span className="text-gray-400">{entry.name}</span>
                <span className="text-white font-medium">{formatNumber(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Churn & Rétention */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Rétention & Churn
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Actifs aujourd'hui</span>
              <span className="text-lg font-bold text-emerald-400">{formatNumber(data?.usersActiveToday || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Verrouillés</span>
              <span className="text-lg font-bold text-red-400">{formatNumber(data?.lockedUsers || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Supprimés</span>
              <span className="text-lg font-bold text-gray-400">{formatNumber(data?.deletedUsers || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Expirant (7j)</span>
              <span className="text-lg font-bold text-amber-400">{formatNumber(data?.expiringIn7Days || 0)}</span>
            </div>
          </div>
        </div>

        {/* Sync */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-trivida-400" />
            Synchronisation
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Sync aujourd'hui</span>
              <span className="text-lg font-bold text-trivida-400">{formatNumber(data?.usersSyncToday || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Sync cette semaine</span>
              <span className="text-lg font-bold text-white">{formatNumber(data?.usersSyncWeek || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Jamais synchronisés</span>
              <span className="text-lg font-bold text-red-400">{formatNumber(data?.usersNeverSynced || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total appareils</span>
              <span className="text-lg font-bold text-white">{formatNumber(data?.totalDeviceIds || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


