/**
 * IntelProfilesPage — TRIVIDA INTEL PROFILES
 * 
 * Liste des profils Intel utilisateurs avec objectifs, blocages, HealthScore.
 */
import React, { useState, useEffect } from 'react';
import { 
  Target, Heart, Flame, Search, Eye, Construction
} from 'lucide-react';
import { api, formatNumber, timeAgo } from '../utils/api';

export default function IntelProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, [page, search]);

  async function fetchProfiles() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const res = await api.get(`/api/v1/trivida/admin/intel/profiles?${params}`);
      if (res.success) {
        setProfiles(res.data || []);
        setPagination(res.pagination || {});
      }
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

  // État : endpoint pas encore prêt
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
            <Target className="w-6 h-6 text-trivida-400" />
            Intel Profiles
          </h1>
          <p className="text-gray-400 mt-1">Profils intelligence des utilisateurs</p>
        </div>
        <div className="admin-card text-center py-16">
          <Construction className="w-16 h-16 text-amber-400/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Bientôt disponible</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Cette page sera connectée quand le backend exposera l'endpoint 
            <code className="mx-1 px-2 py-0.5 bg-gray-800 rounded text-trivida-400 text-sm">GET /admin/intel/profiles</code>
          </p>
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg max-w-sm mx-auto text-left">
            <p className="text-xs text-gray-500 font-medium mb-2">Données attendues :</p>
            <div className="space-y-1 text-xs text-gray-400">
              <div>• Profils utilisateur (goal, blockers, habits)</div>
              <div>• HealthScore par user</div>
              <div>• Streak par user</div>
              <div>• Dernier insight</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-trivida-400" />
          Intel Profiles
        </h1>
        <p className="text-gray-400 mt-1">Profils intelligence des utilisateurs — objectifs, blocages, HealthScore</p>
      </div>

      {/* Recherche */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="admin-input pl-10 w-full"
            placeholder="Rechercher un utilisateur..."
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Utilisateur</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Objectif</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Blocages</th>
              <th className="text-center py-3 px-4 text-gray-400 font-medium">HealthScore</th>
              <th className="text-center py-3 px-4 text-gray-400 font-medium">Streak</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Dernier insight</th>
              <th className="text-center py-3 px-4 text-gray-400 font-medium">Détail</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-500">Aucun profil trouvé</td></tr>
            ) : profiles.map((p) => (
              <tr key={p._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-trivida-600/20 flex items-center justify-center text-trivida-400 text-sm font-bold">
                      {p.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-white font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300 capitalize">{p.intelProfile?.mainGoal || p.intelProfile?.goal || '—'}</td>
                <td className="py-3 px-4">
                  {p.intelProfile?.blockers?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.intelProfile.blockers.map((b, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-900/30 text-red-300 text-xs rounded-full border border-red-800/50">{b}</span>
                      ))}
                    </div>
                  ) : <span className="text-gray-500">—</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${
                    (Number(p.intelProfile?.healthScore) || 0) >= 70 ? 'bg-emerald-900/30 text-emerald-400' :
                    (Number(p.intelProfile?.healthScore) || 0) >= 40 ? 'bg-amber-900/30 text-amber-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    <Heart className="w-3 h-3" />
                    {Number(p.intelProfile?.healthScore) || 0}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1 text-amber-400">
                    <Flame className="w-3 h-3" />
                    {Number(p.intelProfile?.streak) || 0}j
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-400">
                  {p.intelProfile?.lastInsightAt ? timeAgo(p.intelProfile.lastInsightAt) : '—'}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => setSelected(p)}
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-trivida-400 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary text-sm disabled:opacity-40">← Précédent</button>
          <span className="px-4 py-2 text-sm text-gray-400">Page {page} / {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="btn-secondary text-sm disabled:opacity-40">Suivant →</button>
        </div>
      )}

      {/* Modal détail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-500">Objectif</div>
                <div className="text-white font-medium capitalize">{selected.intelProfile?.mainGoal || selected.intelProfile?.goal || '—'}</div>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-500">Objectif mensuel</div>
                <div className="text-white font-medium">{formatNumber(Number(selected.intelProfile?.monthlyTargetAmount) || 0)} XAF</div>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-500">HealthScore</div>
                <div className="text-2xl font-bold text-trivida-400">{Number(selected.intelProfile?.healthScore) || 0}</div>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-500">Streak</div>
                <div className="text-2xl font-bold text-amber-400">{Number(selected.intelProfile?.streak) || 0} jours</div>
              </div>
            </div>

            {selected.intelProfile?.blockers?.length > 0 && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Blocages</div>
                <div className="flex flex-wrap gap-2">
                  {selected.intelProfile.blockers.map((b, i) => (
                    <span key={i} className="px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-lg border border-red-800/50">{b}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.intelProfile?.habits?.length > 0 && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Habitudes</div>
                <div className="flex flex-wrap gap-2">
                  {selected.intelProfile.habits.map((h, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-900/30 text-blue-300 text-sm rounded-lg border border-blue-800/50">{h}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Dernière synchro:</span> <span className="text-gray-300">{selected.lastSyncAt ? timeAgo(selected.lastSyncAt) : '—'}</span></div>
              <div><span className="text-gray-500">Dernier insight:</span> <span className="text-gray-300">{selected.intelProfile?.lastInsightAt ? timeAgo(selected.intelProfile.lastInsightAt) : '—'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
