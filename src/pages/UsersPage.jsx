/**
 * UsersPage — Trivida Admin Panel
 * 
 * Page de gestion des utilisateurs avec :
 *   - Table paginée avec filtres (nom, email, plan, statut)
 *   - Actions : voir profil, changer plan, suspendre
 *   - Recherche en temps réel
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ChevronLeft, ChevronRight, 
  Eye, Shield, Ban, CheckCircle, Crown,
  AlertTriangle, Download, FileSpreadsheet
} from 'lucide-react';
import { api, formatNumber, timeAgo, downloadFile } from '../utils/api';

/**
 * Badge de statut utilisateur
 */
function StatusBadge({ status }) {
  const config = {
    active: { class: 'badge-success', label: 'Actif' },
    inactive: { class: 'badge-warning', label: 'Inactif' },
    deleted: { class: 'badge-danger', label: 'Supprimé' },
  };
  const { class: cls, label } = config[status] || config.active;
  return <span className={`badge ${cls}`}>{label}</span>;
}

/**
 * Badge de plan
 */
function PlanBadge({ plan }) {
  const config = {
    free: { class: 'badge-info', label: 'Free' },
    basic: { class: 'badge-warning', label: 'Basic' },
    premium: { class: 'badge-success', label: 'Premium' },
  };
  const { class: cls, label } = config[plan] || config.free;
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function UsersPage() {
  const navigate = useNavigate();
  
  // État des filtres
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  // État des données
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', limit);
      if (search) params.set('search', search);
      if (planFilter) params.set('plan', planFilter);
      if (statusFilter) params.set('status', statusFilter);
      
      const data = await api.get(`/api/v1/trivida/admin/users?${params.toString()}`);
      
      if (data.success) {
        setUsers(data.data);
        setTotal(data.pagination?.total || 0);
        setPages(data.pagination?.pages || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, planFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, planFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-gray-400 mt-1">
            {formatNumber(total)} utilisateur{total !== 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadFile(`/api/v1/trivida/admin/export/users?format=csv${search ? `&search=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`, 'trivida_users.csv')}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => downloadFile(`/api/v1/trivida/admin/export/users?format=excel${search ? `&search=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`, 'trivida_users.xlsx')}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="admin-input pl-10"
            />
          </div>
          
          {/* Filtre plan */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="admin-select w-full sm:w-40"
          >
            <option value="">Tous les plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
          
          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select w-full sm:w-40"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="deleted">Supprimé</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Statut</th>
                  <th>Inscription</th>
                  <th>Dernière synchro</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-trivida-600/20 flex items-center justify-center text-trivida-400 text-sm font-bold flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-white truncate">{user.name}</span>
                      </div>
                    </td>
                    <td className="text-gray-400 truncate max-w-[200px]">{user.email}</td>
                    <td><PlanBadge plan={user.premiumPlan} /></td>
                    <td><StatusBadge status={user.status} /></td>
                    <td className="text-gray-400 text-sm">{timeAgo(user.createdAt)}</td>
                    <td className="text-gray-400 text-sm">{timeAgo(user.lastSyncAt)}</td>
                    <td className="text-right">
                      <button
                        onClick={() => navigate(`/users/${user._id}`)}
                        className="text-gray-400 hover:text-trivida-400 transition-colors p-1"
                        title="Voir le détail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
