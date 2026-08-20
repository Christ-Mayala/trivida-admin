/**
 * LogsPage — Trivida Admin Panel
 * 
 * Page Journal d'audit avec :
 *   - Liste des actions admin (login, changements plan, statut, etc.)
 *   - Filtres par type d'action
 *   - Pagination
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScrollText, AlertTriangle, ChevronLeft, ChevronRight,
  Shield, User, Crown, Download, LogIn, Filter
} from 'lucide-react';
import { api, timeAgo } from '../utils/api';

/**
 * Icône et couleur selon le type d'action
 */
function ActionBadge({ action }) {
  const config = {
    admin_login: { icon: LogIn, color: 'text-blue-400', label: 'Connexion admin' },
    user_status_change: { icon: Shield, color: 'text-amber-400', label: 'Changement statut' },
    user_plan_change: { icon: Crown, color: 'text-purple-400', label: 'Changement plan' },
    user_delete: { icon: User, color: 'text-red-400', label: 'Suppression utilisateur' },
    user_restore: { icon: User, color: 'text-emerald-400', label: 'Restauration utilisateur' },
    app_update_manifest: { icon: Download, color: 'text-trivida-400', label: 'Mise à jour manifest' },
    stats_export: { icon: ScrollText, color: 'text-gray-400', label: 'Export statistiques' },
  };
  
  const { icon: Icon, color, label } = config[action] || { 
    icon: ScrollText, 
    color: 'text-gray-400', 
    label: action 
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${color}`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '50');
      if (actionFilter) params.set('action', actionFilter);
      
      const data = await api.get(`/api/v1/trivida/admin/logs?${params.toString()}`);
      
      if (data.success) {
        setLogs(data.data);
        setTotal(data.pagination?.total || 0);
        setPages(data.pagination?.pages || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Journal d'audit</h1>
        <p className="text-gray-400 mt-1">
          {total} action{total !== 1 ? 's' : ''} enregistrée{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres */}
      <div className="admin-card">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="admin-select w-full sm:w-60"
          >
            <option value="">Toutes les actions</option>
            <option value="admin_login">Connexion admin</option>
            <option value="user_status_change">Changement statut</option>
            <option value="user_plan_change">Changement plan</option>
            <option value="user_delete">Suppression utilisateur</option>
            <option value="app_update_manifest">Mise à jour manifest</option>
          </select>
        </div>
      </div>

      {/* Liste des logs */}
      <div className="admin-card overflow-hidden p-0">
        {error ? (
          <div className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-300">{error}</p>
          </div>
        ) : loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Chargement...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun log trouvé
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {logs.map((log) => (
              <div key={log._id} className="px-4 py-3 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-sm font-bold">
                      {log.adminEmail?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{log.adminEmail}</span>
                        <ActionBadge action={log.action} />
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {log.targetUserEmail && (
                          <span>→ {log.targetUserEmail}</span>
                        )}
                        {log.details && Object.keys(log.details).length > 0 && (
                          <span className="ml-2 text-gray-600">
                            ({Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {timeAgo(log.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-sm text-gray-400">
              Page {page} sur {pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn-secondary px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
