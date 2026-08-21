/**
 * IntelPage — TRIVIDA INTEL DASHBOARD
 * 
 * Vue d'ensemble de l'intelligence Trivida Intel.
 * LifeOS, Decision Engine, Predictive Engine, Growth Brain.
 */
import React, { useState, useEffect } from 'react';
import { 
  Brain, Heart, Lightbulb, Trophy, Flame, Target, 
  Zap, Users, TrendingUp, Activity, BarChart3,
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { api, formatNumber } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { ComingSoonBadge } from '../components/ComingSoon';

const COLORS = ['#006B4D', '#3EC29A', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444'];

function IntelKPI({ label, value, icon: Icon, color, subtitle, onClick }) {
  return (
    <div 
      className={`admin-card group hover:border-${color}-600/30 transition-all cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <Icon className={`w-6 h-6 text-${color}-400`} />
        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>
      <div className="mt-3 text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function SectionBar({ label, percent, color = 'trivida', description }) {
  const colorMap = {
    trivida: 'bg-trivida-500', emerald: 'bg-emerald-500',
    amber: 'bg-amber-500', purple: 'bg-purple-500', blue: 'bg-blue-500',
  };
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-medium text-white">{percent}%</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colorMap[color]}`} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}

export default function IntelPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/api/v1/trivida/admin/intel/overview');
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
          <Brain className="w-7 h-7 text-trivida-400" />
          TRIVIDA INTEL
        </h1>
        <p className="text-gray-400 mt-1">Pilotage de l'intelligence Trivida — modules progressivement branchés au mobile</p>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <IntelKPI label="Utilisateurs Intel" value={formatNumber(data?.activeIntelUsers || 0)} icon={Users} color="trivida" subtitle="actifs ce mois" onClick={() => navigate('/intel/profiles')} />
        <IntelKPI label="Profiles complétés" value={formatNumber(data?.profilesCompleted || 0)} icon={Target} color="emerald" subtitle={`${data?.profilesCompletionRate || 0}% complétion`} onClick={() => navigate('/intel/profiles')} />
        <IntelKPI label="Insights générés" value={formatNumber(data?.insightsGenerated || 0)} icon={Lightbulb} color="amber" subtitle="ce mois" onClick={() => navigate('/intel/predictions')} />
        <IntelKPI label="Challenges actifs" value={formatNumber(data?.challengesActive || 0)} icon={Trophy} color="purple" onClick={() => navigate('/intel/growth')} />
      </div>

      {/* KPIs secondaires */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="admin-card text-center">
          <Heart className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{data?.avgHealthScore || 0}</div>
          <div className="text-xs text-gray-500">HealthScore moyen</div>
        </div>
        <div className="admin-card text-center">
          <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{data?.avgStreak || 0}j</div>
          <div className="text-xs text-gray-500">Streak moyen</div>
        </div>
        <div className="admin-card text-center">
          <Brain className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{formatNumber(data?.decisionsAnalyzed || 0)}</div>
          <div className="text-xs text-gray-500">Décisions analysées</div>
        </div>
        <div className="admin-card text-center">
          <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{formatNumber(data?.predictionsMade || 0)}</div>
          <div className="text-xs text-gray-500">Prédictions</div>
        </div>
      </div>

      {/* Engagement par module */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-trivida-400" />
          Engagement par module
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SectionBar label="LifeOS" percent={data?.lifeosEngagement || 0} color="trivida" description="Tableau de bord de vie" />
            <SectionBar label="Decision Engine" percent={data?.decisionEngagement || 0} color="purple" description="Analyse de décisions financières" />
          </div>
          <div className="space-y-4">
            <SectionBar label="Predictive Engine" percent={data?.predictiveEngagement || 0} color="blue" description="Prédictions et insights" />
            <SectionBar label="Growth Brain" percent={data?.growthEngagement || 0} color="amber" description="Challenges, badges, streaks" />
          </div>
        </div>
      </div>

      {/* Liens rapides vers les sous-pages Intel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { path: '/intel/profiles', label: 'Intel Profiles', icon: Target, desc: 'Profils utilisateur et objectifs', color: 'trivida' },
          { path: '/intel/health', label: 'HealthScore', icon: Heart, desc: 'Scores financiers et santé', color: 'emerald' },
          { path: '/intel/growth', label: 'Growth Brain', icon: Trophy, desc: 'Challenges, badges, streaks', color: 'amber', soon: true },
          { path: '/intel/decisions', label: 'Decision Engine', icon: Brain, desc: 'Analyses de décisions', color: 'purple', soon: true },
          { path: '/intel/predictions', label: 'Predictive Engine', icon: Zap, desc: 'Prédictions et insights', color: 'blue', soon: true },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="admin-card text-left group hover:border-trivida-600/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <item.icon className={`w-6 h-6 text-${item.color}-400`} />
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-trivida-400 transition-colors" />
          </div>
          <h4 className="text-lg font-semibold text-white mt-2 flex items-center gap-2">
            {item.label}
            {item.soon && <ComingSoonBadge />}
          </h4>
          <p className="text-sm text-gray-400">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
