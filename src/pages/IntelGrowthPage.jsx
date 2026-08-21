/**
 * IntelGrowthPage — GROWTH BRAIN
 * 
 * Challenges, badges, streaks, leaderboard.
 */
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Flame, Medal, Target, TrendingUp, Users, Award
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { api, formatNumber } from '../utils/api';
import ComingSoon from '../components/ComingSoon';

export default function IntelGrowthPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/api/v1/trivida/admin/intel/growth');
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
          <Trophy className="w-6 h-6 text-amber-400" />
          Growth Brain
          <span className="text-xs font-bold text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-800/50">Bientôt disponible</span>
        </h1>
        <p className="text-gray-400 mt-1">Challenges, badges, streaks et gamification — sera branché quand le mobile implémentera ces fonctionnalités</p>
      </div>

      <ComingSoon>
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Challenges créés', value: data?.challengesCreated || 0, icon: Target, color: 'trivida' },
          { label: 'Terminés', value: data?.challengesCompleted || 0, icon: Trophy, color: 'emerald' },
          { label: 'Taux réussite', value: `${data?.successRate || 0}%`, icon: TrendingUp, color: 'amber' },
          { label: 'Streak moyen', value: `${data?.avgStreak || 0}j`, icon: Flame, color: 'purple' },
        ].map((item, i) => (
          <div key={i} className="admin-card text-center">
            <item.icon className={`w-5 h-5 text-${item.color}-400 mx-auto mb-1`} />
            <div className="text-2xl font-bold text-white">{typeof item.value === 'string' ? item.value : formatNumber(item.value)}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Badges distribués */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Badges distribués
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(data?.badges || [
            { name: 'Objectif atteint', count: 0 },
            { name: '7 jours consécutifs', count: 0 },
            { name: '30 jours consécutifs', count: 0 },
            { name: 'Premier challenge', count: 0 },
          ]).map((badge, i) => (
            <div key={i} className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <Medal className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{formatNumber(badge.count)}</div>
              <div className="text-xs text-gray-400 mt-1">{badge.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges par semaine */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4">Challenges par semaine</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.weeklyChallenges || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
              <Bar dataKey="created" fill="#006B4D" name="Créés" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#3EC29A" name="Terminés" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="admin-card">          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-trivida-400" />
          Top Streaks
        </h3>
        <div className="space-y-2">
          {(data?.topStreaks || []).slice(0, 10).map((user, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-amber-900/50 text-amber-300' :
                  i === 1 ? 'bg-gray-700 text-gray-300' :
                  i === 2 ? 'bg-orange-900/50 text-orange-300' :
                  'bg-gray-800 text-gray-500'
                }`}>
                  {i + 1}
                </span>
                <span className="text-gray-300">{user.name}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Flame className="w-4 h-4" />
                {user.streak}j
              </div>
            </div>
          ))}
          {(!data?.topStreaks || data.topStreaks.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">Aucun streak enregistré</p>
          )}
        </div>
      </div>
      </ComingSoon>
    </div>
  );
}
