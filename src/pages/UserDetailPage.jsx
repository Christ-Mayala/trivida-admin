/**
 * UserDetailPage — Trivida Admin Panel
 * 
 * Page de détail d'un utilisateur avec :
 *   - Profil complet (nom, email, téléphone, statut, plan)
 *   - Stats d'activité (transactions, dettes, etc.)
 *   - Actions : changer le plan, activer/suspendre
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Shield, Crown, 
  Calendar, Activity, CreditCard, FileText, 
  TrendingUp, AlertTriangle, CheckCircle, Ban,
  Save, Loader2
} from 'lucide-react';
import { api, formatNumber, timeAgo, formatCurrency } from '../utils/api';

/**
 * Carte de stat
 */
function StatCard({ label, value, icon: Icon, color = 'trivida' }) {
  const colors = {
    trivida: 'bg-trivida-600/20 text-trivida-400',
    emerald: 'bg-emerald-600/20 text-emerald-400',
    amber: 'bg-amber-600/20 text-amber-400',
    red: 'bg-red-600/20 text-red-400',
    purple: 'bg-purple-600/20 text-purple-400',
    blue: 'bg-blue-600/20 text-blue-400',
  };
  
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-lg font-bold text-white">{formatNumber(value)}</div>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État des actions
  const [planAction, setPlanAction] = useState({ plan: '', duration: 30 });
  const [statusAction, setStatusAction] = useState({ status: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Fetch user detail
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await api.get(`/api/v1/trivida/admin/users/${id}`);
        if (data.success) {
          setUser(data.data);
          setStatusAction({ status: data.data.status });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  // Changer le plan
  const handlePlanChange = async () => {
    if (!planAction.plan) return;
    setActionLoading(true);
    setActionSuccess('');
    setActionError('');
    
    try {
      const data = await api.patch(`/api/v1/trivida/admin/users/${id}/plan`, {
        plan: planAction.plan,
        duration: parseInt(planAction.duration) || 30,
      });
      
      if (data.success) {
        setUser(prev => ({ ...prev, ...data.data.user }));
        setActionSuccess(`Plan mis à jour : ${planAction.plan}`);
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Changer le statut
  const handleStatusChange = async () => {
    if (!statusAction.status) return;
    setActionLoading(true);
    setActionSuccess('');
    setActionError('');
    
    try {
      const data = await api.patch(`/api/v1/trivida/admin/users/${id}/status`, {
        status: statusAction.status,
      });
      
      if (data.success) {
        setUser(prev => ({ ...prev, ...data.data.user }));
        setActionSuccess(`Statut mis à jour : ${statusAction.status}`);
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="admin-card text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Utilisateur introuvable</h3>
        <p className="text-gray-400 mb-4">{error || 'Cet utilisateur n\'existe pas'}</p>
        <button onClick={() => navigate('/users')} className="btn-primary">
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      {/* Messages d'action */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-900/30 border border-emerald-800 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profil */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <User className="w-5 h-5 inline mr-2 text-trivida-400" />
            Profil
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-trivida-600/20 flex items-center justify-center text-trivida-400 text-2xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="text-lg font-semibold text-white">{user.name}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">Téléphone :</span>
                <span className="text-white">{user.telephone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">Rôle :</span>
                <span className="text-white capitalize">{user.role || 'user'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">Inscrit le :</span>
                <span className="text-white">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">Dernière synchro :</span>
                <span className="text-white">{timeAgo(user.lastSyncAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats d'activité */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <TrendingUp className="w-5 h-5 inline mr-2 text-emerald-400" />
            Activité
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              label="Transactions" 
              value={user.activityStats?.transactions || 0} 
              icon={CreditCard}
              color="trivida"
            />
            <StatCard 
              label="Clients" 
              value={user.activityStats?.customers || 0} 
              icon={User}
              color="blue"
            />
            <StatCard 
              label="Dettes" 
              value={user.activityStats?.debts || 0} 
              icon={FileText}
              color="amber"
            />
            <StatCard 
              label="Épargne" 
              value={user.activityStats?.savingsGoals || 0} 
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard 
              label="Factures" 
              value={user.activityStats?.invoices || 0} 
              icon={FileText}
              color="purple"
            />
            <StatCard 
              label="Activités" 
              value={user.activityStats?.activities || 0} 
              icon={Activity}
              color="red"
            />
          </div>
          
          {/* Quota IA */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Requêtes IA aujourd'hui</span>
              <span className="text-white font-medium">
                {user.aiRequestsToday || 0} / 5
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-trivida-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((user.aiRequestsToday || 0) / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions admin */}
        <div className="space-y-6">
          {/* Changer le plan */}
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-white mb-4">
              <Crown className="w-5 h-5 inline mr-2 text-amber-400" />
              Plan premium
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Plan actuel</label>
                <span className="badge badge-info text-sm">{user.premiumPlan || 'free'}</span>
                {user.premiumUntil && (
                  <span className="text-xs text-gray-500 ml-2">
                    expire le {new Date(user.premiumUntil).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nouveau plan</label>
                <select
                  value={planAction.plan}
                  onChange={(e) => setPlanAction(prev => ({ ...prev, plan: e.target.value }))}
                  className="admin-select"
                >
                  <option value="">Sélectionner un plan</option>
                  <option value="free">Free (gratuit)</option>
                  <option value="basic">Basic (1 500 XAF/mois)</option>
                  <option value="premium">Premium (3 500 XAF/mois)</option>
                </select>
              </div>
              
              {planAction.plan && planAction.plan !== 'free' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Durée (jours)</label>
                  <input
                    type="number"
                    value={planAction.duration}
                    onChange={(e) => setPlanAction(prev => ({ ...prev, duration: e.target.value }))}
                    className="admin-input"
                    min="1"
                    max="365"
                  />
                </div>
              )}
              
              <button
                onClick={handlePlanChange}
                disabled={!planAction.plan || actionLoading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                ) : (
                  <Save className="w-4 h-4 inline mr-2" />
                )}
                Appliquer le plan
              </button>
            </div>
          </div>

          {/* Changer le statut */}
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-white mb-4">
              <Shield className="w-5 h-5 inline mr-2 text-blue-400" />
              Statut du compte
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Statut actuel</label>
                <span className={`badge ${
                  user.status === 'active' ? 'badge-success' : 
                  user.status === 'inactive' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {user.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nouveau statut</label>
                <select
                  value={statusAction.status}
                  onChange={(e) => setStatusAction({ status: e.target.value })}
                  className="admin-select"
                >
                  <option value="active">Activer</option>
                  <option value="inactive">Suspendre</option>
                  <option value="deleted">Supprimer (soft delete)</option>
                </select>
              </div>
              
              <button
                onClick={handleStatusChange}
                disabled={statusAction.status === user.status || actionLoading}
                className={`w-full py-2.5 px-4 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  statusAction.status === 'deleted' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'btn-primary'
                }`}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                ) : statusAction.status === 'deleted' ? (
                  <Ban className="w-4 h-4 inline mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                )}
                {statusAction.status === 'deleted' ? 'Supprimer le compte' : 'Appliquer le statut'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
