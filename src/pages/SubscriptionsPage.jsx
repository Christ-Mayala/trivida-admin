/**
 * SubscriptionsPage — ABONNEMENTS & REVENUS
 * 
 * Vue complète des plans, trials, churn, paiements.
 */
import React, { useState, useEffect } from 'react';
import { 
  Crown, Users, DollarSign, TrendingUp, TrendingDown,
  Clock, AlertTriangle, CreditCard, RefreshCw, BarChart3
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { api, formatNumber, formatXAF } from '../utils/api';

const PLAN_COLORS = { free: '#6b7280', basic: '#3b82f6', premium: '#006B4D', business: '#f59e0b' };

function PlanCard({ plan, users, mrr, conversion, churn, arpu, color }) {
  return (
    <div className="admin-card border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white capitalize">{plan}</h3>
        <span className="text-sm text-gray-400">{formatNumber(users)} users</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {mrr !== undefined && (
          <div><span className="text-gray-500">MRR</span><div className="text-white font-bold">{formatXAF(mrr)}</div></div>
        )}
        {conversion !== undefined && (
          <div><span className="text-gray-500">Conversion</span><div className="text-emerald-400 font-bold">{conversion}%</div></div>
        )}
        {churn !== undefined && (
          <div><span className="text-gray-500">Churn</span><div className="text-red-400 font-bold">{churn}%</div></div>
        )}
        {arpu !== undefined && (
          <div><span className="text-gray-500">ARPU</span><div className="text-white font-bold">{formatXAF(arpu)}/mois</div></div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/api/v1/trivida/admin/subscriptions/overview');
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
          <Crown className="w-6 h-6 text-amber-400" />
          Abonnements & Revenus
        </h1>
        <p className="text-gray-400 mt-1">Plans, trials, churn, paiements et revenus</p>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="admin-card text-center">
          <DollarSign className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{formatXAF(data?.totalMRR || 0)}</div>
          <div className="text-xs text-gray-400">MRR Total</div>
        </div>
        <div className="admin-card text-center">
          <Users className="w-6 h-6 text-trivida-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{formatNumber(data?.totalPaid || 0)}</div>
          <div className="text-xs text-gray-400">Abonnés payants</div>
        </div>
        <div className="admin-card text-center">
          <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-emerald-400">{data?.conversionRate || 0}%</div>
          <div className="text-xs text-gray-400">Taux conversion</div>
        </div>
        <div className="admin-card text-center">
          <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-red-400">{data?.churnRate || 0}%</div>
          <div className="text-xs text-gray-400">Taux churn</div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlanCard plan="Free" users={data?.freeUsers || 0} color={PLAN_COLORS.free} />
        <PlanCard plan="Basic" users={data?.basicUsers || 0} mrr={data?.basicMRR || 0} conversion={data?.basicConversion} arpu={2000} color={PLAN_COLORS.basic} />
        <PlanCard plan="Premium" users={data?.premiumUsers || 0} mrr={data?.premiumMRR || 0} conversion={data?.premiumConversion} arpu={3500} color={PLAN_COLORS.premium} />
        <PlanCard plan="Business" users={data?.businessUsers || 0} mrr={data?.businessMRR || 0} conversion={data?.businessConversion} arpu={8000} color={PLAN_COLORS.business} />
      </div>

      {/* Trials */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-trivida-400" />
          Essais Premium (7 jours)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-xl font-bold text-white">{formatNumber(data?.trials?.new || 0)}</div>
            <div className="text-xs text-gray-400">Nouveaux essais</div>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-xl font-bold text-trivida-400">{formatNumber(data?.trials?.active || 0)}</div>
            <div className="text-xs text-gray-400">Essais actifs</div>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-xl font-bold text-amber-400">{formatNumber(data?.trials?.expired || 0)}</div>
            <div className="text-xs text-gray-400">Essais expirés</div>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-xl font-bold text-emerald-400">{data?.trials?.conversionRate || 0}%</div>
            <div className="text-xs text-gray-400">Conversion essai → Premium</div>
          </div>
        </div>
      </div>

      {/* MRR trend */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4">
          <BarChart3 className="w-5 h-5 inline mr-2 text-trivida-400" />
          Évolution MRR (12 mois)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.mrrTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `${Math.round(v/1000)}K`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} formatter={(v) => [`${formatXAF(v)}`, 'MRR']} />
              <Line type="monotone" dataKey="mrr" stroke="#006B4D" strokeWidth={2} dot={{ fill: '#006B4D' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
