/**
 * RevenuePage — Trivida Admin Panel
 * 
 * Page Revenus & Plans avec :
 *   - Nombre d'abonnements Basic / Premium
 *   - Revenus mensuels estimés
 *   - Expirations à venir (7 jours)
 *   - Répartition des plans
 */
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Crown, TrendingUp, AlertTriangle, 
  CreditCard, Calendar, Users, ArrowUpRight, BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { api, formatNumber, formatCurrency } from '../utils/api';

export default function RevenuePage() {
  const [revenue, setRevenue] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [revenueRes, overviewRes] = await Promise.all([
          api.get('/api/v1/trivida/admin/stats/revenue'),
          api.get('/api/v1/trivida/admin/stats/overview'),
        ]);
        
        if (revenueRes.success) setRevenue(revenueRes.data);
        if (overviewRes.success) setOverview(overviewRes.data);
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

  // Données pour le bar chart
  const planChartData = [
    { name: 'Free', count: overview?.freeUsers || 0, fill: '#6b7280' },
    { name: 'Basic', count: revenue?.basicSubscribers || 0, fill: '#f59e0b' },
    { name: 'Premium', count: revenue?.premiumSubscribers || 0, fill: '#10b981' },
  ];

  const totalSubscribers = (revenue?.basicSubscribers || 0) + (revenue?.premiumSubscribers || 0);
  const conversionRate = (overview?.activeUsers || 0) > 0 
    ? Math.round((totalSubscribers / overview.activeUsers) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Revenus & Plans</h1>
        <p className="text-gray-400 mt-1">Abonnements, revenus et conversions</p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Revenu mensuel estimé</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(revenue?.estimatedMonthlyRevenue || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">/mois estimé</div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Abonnés Basic</span>
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{formatNumber(revenue?.basicSubscribers || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">{formatCurrency(revenue?.planPrices?.basic || 1500)}/mois</div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Abonnés Premium</span>
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{formatNumber(revenue?.premiumSubscribers || 0)}</div>
          <div className="text-xs text-gray-500 mt-1">{formatCurrency(revenue?.planPrices?.premium || 3500)}/mois</div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Taux de conversion</span>
            <div className="w-10 h-10 rounded-lg bg-trivida-600/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-trivida-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{conversionRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Free → Payant</div>
        </div>
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart répartition */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <BarChart3 className="w-5 h-5 inline mr-2 text-trivida-400" />
            Répartition des plans
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {planChartData.map((entry, index) => (
                    <rect key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expirations à venir */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Calendar className="w-5 h-5 inline mr-2 text-amber-400" />
            Expirations à venir
          </h3>
          
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-white mb-2">
                {revenue?.expiringIn7Days || 0}
              </div>
              <div className="text-gray-400">abonnements expirent dans 7 jours</div>
            </div>
            
            {(revenue?.expiringIn7Days || 0) > 0 && (
              <div className="p-4 bg-amber-900/20 border border-amber-800/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-300">Attention</h4>
                    <p className="text-sm text-amber-200/70 mt-1">
                      {revenue.expiringIn7Days} utilisateur{revenue.expiringIn7Days !== 1 ? 's' : ''} 
                      {' '}perdra{revenue.expiringIn7Days !== 1 ? 'nt' : ''} leur abonnement dans les 7 prochains jours.
                      Considérez une relance ou une promotion.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Détail des revenus */}
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Basic ({revenue?.basicSubscribers || 0} × {formatCurrency(revenue?.planPrices?.basic || 1500)})</span>
                <span className="text-white font-medium">{formatCurrency((revenue?.basicSubscribers || 0) * (revenue?.planPrices?.basic || 1500))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Premium ({revenue?.premiumSubscribers || 0} × {formatCurrency(revenue?.planPrices?.premium || 3500)})</span>
                <span className="text-white font-medium">{formatCurrency((revenue?.premiumSubscribers || 0) * (revenue?.planPrices?.premium || 3500))}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                <span className="text-gray-300 font-medium">Total mensuel estimé</span>
                <span className="text-emerald-400 font-bold text-lg">{formatCurrency(revenue?.estimatedMonthlyRevenue || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


