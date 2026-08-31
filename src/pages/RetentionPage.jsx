/**
 * RetentionPage — Trivida Admin Panel
 *
 * Dashboard de rétention avec :
 *   - Funnel d'activation complet
 *   - Métriques D1 / D3 / D7 / D30
 *   - DAU / WAU / MAU
 *   - Métriques métier (transactions, goals, LifeOS, IA)
 *   - Cohortes par semaine
 */
import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, ArrowUpRight, ArrowDownRight, 
  BarChart3, Target, Heart, Brain, Activity, RefreshCw,
  Calendar, UserCheck, UserX, Zap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Cell 
} from 'recharts';
import { api, formatNumber } from '../utils/api';

const FUNNEL_COLORS = ['#006B4D', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

function FunnelStep({ label, users, conversion, index, total }) {
  const width = total > 0 ? Math.max(20, (users / total) * 100) : 20;
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-28 text-right">
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="flex-1 relative">
        <div 
          className="h-8 rounded-lg flex items-center px-3 transition-all duration-500"
          style={{ 
            width: `${width}%`, 
            backgroundColor: FUNNEL_COLORS[index % FUNNEL_COLORS.length] + '30',
            borderLeft: `3px solid ${FUNNEL_COLORS[index % FUNNEL_COLORS.length]}`
          }}
        >
          <span className="text-sm font-bold text-white">{formatNumber(users)}</span>
        </div>
      </div>
      {conversion !== null && conversion !== undefined && (
        <div className="w-16 text-right">
          <span className={`text-xs font-medium ${conversion >= 50 ? 'text-emerald-400' : conversion >= 25 ? 'text-amber-400' : 'text-red-400'}`}>
            {conversion}%
          </span>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color = 'trivida', subtitle, trend }) {
  const colors = {
    trivida: 'bg-trivida-600/20 text-trivida-400',
    emerald: 'bg-emerald-600/20 text-emerald-400',
    amber: 'bg-amber-600/20 text-amber-400',
    red: 'bg-red-600/20 text-red-400',
    purple: 'bg-purple-600/20 text-purple-400',
    blue: 'bg-blue-600/20 text-blue-400',
    cyan: 'bg-cyan-600/20 text-cyan-400',
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
      {trend !== undefined && (
        <div className={`text-xs mt-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs semaine dernière
        </div>
      )}
    </div>
  );
}

export default function RetentionPage() {
  const [funnel, setFunnel] = useState([]);
  const [retention, setRetention] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [funnelRes, retentionRes, businessRes] = await Promise.allSettled([
          api.get('/api/v1/trivida/analytics/funnel'),
          api.get(`/api/v1/trivida/analytics/retention?days=${period}`),
          api.get('/api/v1/trivida/analytics/business'),
        ]);

        if (funnelRes.status === 'fulfilled') setFunnel(funnelRes.value?.data || []);
        if (retentionRes.status === 'fulfilled') setRetention(retentionRes.value?.data || null);
        if (businessRes.status === 'fulfilled') setBusiness(businessRes.value?.data || null);

        const hasData = funnelRes.status === 'fulfilled' || retentionRes.status === 'fulfilled';
        if (!hasData) setError('API analytics non joignable');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500" />
      </div>
    );
  }

  // Calculer le taux d'activation (première transaction / inscriptions)
  const funnelTotal = funnel.length > 0 ? funnel[0]?.users || 0 : 0;
  const firstTxUsers = funnel.find(f => f.event === 'first_transaction')?.users || 0;
  const activationRate = funnelTotal > 0 ? Math.round((firstTxUsers / funnelTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-trivida-400" />
            RÉTENTION & ACTIVATION
          </h1>
          <p className="text-gray-400 mt-1">Funnel, rétention D1-D30 et métriques métier</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(parseInt(e.target.value))}
          className="admin-select w-40"
        >
          <option value={7}>7 jours</option>
          <option value={30}>30 jours</option>
          <option value={90}>90 jours</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg">
          <p className="text-amber-300 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* ── KPIs Principaux ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard 
          label="Activation" 
          value={`${activationRate}%`} 
          icon={UserCheck} 
          color="emerald" 
          subtitle={`${firstTxUsers} / ${funnelTotal} inscrits`} 
        />
        <MetricCard 
          label="DAU" 
          value={formatNumber(retention?.engagement?.DAU || 0)} 
          icon={Users} 
          color="blue" 
          subtitle="Utilisateurs actifs aujourd'hui" 
        />
        <MetricCard 
          label="WAU" 
          value={formatNumber(retention?.engagement?.WAU || 0)} 
          icon={Activity} 
          color="purple" 
          subtitle="Utilisateurs actifs cette semaine" 
        />
        <MetricCard 
          label="MAU" 
          value={formatNumber(retention?.engagement?.MAU || 0)} 
          icon={TrendingUp} 
          color="trivida" 
          subtitle="Utilisateurs actifs ce mois" 
        />
      </div>

      {/* ── Rétention D1 / D3 / D7 / D30 ── */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-trivida-400" />
          RÉTENTION
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'D1', value: retention?.retention?.D1, color: '#10B981' },
            { label: 'D3', value: retention?.retention?.D3, color: '#3B82F6' },
            { label: 'D7', value: retention?.retention?.D7, color: '#8B5CF6' },
            { label: 'D30', value: retention?.retention?.D30, color: '#F59E0B' },
          ].map((r) => (
            <div key={r.label} className="text-center p-4 rounded-xl bg-gray-800/50">
              <div className="text-3xl font-bold mb-1" style={{ color: r.color }}>
                {r.value !== null && r.value !== undefined ? `${r.value}%` : '—'}
              </div>
              <div className="text-xs text-gray-400 font-medium">{r.label} Return</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          DAU/WAU: {retention?.engagement?.dauWauRatio || 0}% · WAU/MAU: {retention?.engagement?.wauMauRatio || 0}%
        </div>
      </div>

      {/* ── Funnel d'activation ── */}
      {funnel.length > 0 && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            FUNNEL D'ACTIVATION
          </h3>
          <div className="space-y-1">
            {funnel.map((step, i) => (
              <FunnelStep
                key={step.event}
                label={step.label}
                users={step.users}
                conversion={step.conversionFromPrevious}
                index={i}
                total={funnelTotal}
              />
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400">
              <span className="text-white font-bold">Insight :</span>{' '}
              {activationRate >= 50 
                ? `Bon taux d'activation (${activationRate}%). Les utilisateurs comprennent la valeur.`
                : activationRate >= 25
                ? `Taux moyen (${activationRate}%). Vérifiez si l'onboarding guide bien vers la première transaction.`
                : `Taux faible (${activationRate}%). Beaucoup d'inscrits ne font pas de première transaction.`
              }
            </p>
          </div>
        </div>
      )}

      {/* ── Métriques métier ── */}
      {business && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            MÉTRIQUES MÉTIER
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Transactions aujourd'hui", value: business.transactions?.today || 0, icon: Activity, color: 'blue' },
              { label: 'Transactions semaine', value: business.transactions?.week || 0, icon: BarChart3, color: 'trivida' },
              { label: 'Transactions mois', value: business.transactions?.month || 0, icon: TrendingUp, color: 'emerald' },
              { label: 'Objectifs complétés', value: business.goalsCompleted || 0, icon: Target, color: 'amber' },
              { label: 'LifeOS visits', value: business.lifeOsVisits || 0, icon: Heart, color: 'red' },
              { label: 'Questions IA', value: business.aiQuestions || 0, icon: Brain, color: 'purple' },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-800/50 text-center">
                <m.icon className={`w-5 h-5 mx-auto mb-2 text-${m.color}-400`} />
                <div className="text-xl font-bold text-white">{formatNumber(m.value)}</div>
                <div className="text-[10px] text-gray-500 mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Ratios de qualité ── */}
      {retention && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">QUALITÉ DE L'UTILISATION</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-800/50">
              <div className="text-xs text-gray-400 mb-2">Ratio DAU/WAU</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-trivida-500 rounded-full" 
                    style={{ width: `${Math.min(100, retention.engagement?.dauWauRatio || 0)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white">{retention.engagement?.dauWauRatio || 0}%</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {(retention.engagement?.dauWauRatio || 0) >= 20 ? '✅ Excellent' : (retention.engagement?.dauWauRatio || 0) >= 10 ? '⚠️ Moyen' : '❌ Faible'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50">
              <div className="text-xs text-gray-400 mb-2">Ratio WAU/MAU</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${Math.min(100, retention.engagement?.wauMauRatio || 0)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white">{retention.engagement?.wauMauRatio || 0}%</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {(retention.engagement?.wauMauRatio || 0) >= 30 ? '✅ Bon' : (retention.engagement?.wauMauRatio || 0) >= 15 ? '⚠️ Moyen' : '❌ Faible'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50">
              <div className="text-xs text-gray-400 mb-2">Nouveaux inscrits</div>
              <div className="text-2xl font-bold text-white">{formatNumber(retention.newUsers || 0)}</div>
              <p className="text-[10px] text-gray-500 mt-1">sur les {period} derniers jours</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
