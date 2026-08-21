/**
 * SupportPage — CENTRE DE SUPPORT
 * 
 * Tickets, signalements, feedback, utilisateurs à risque.
 */
import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, AlertTriangle, MessageSquare, Users, Clock,
  CheckCircle, Search, Filter, Eye, ChevronDown, Construction
} from 'lucide-react';
import { api, formatNumber, timeAgo } from '../utils/api';

const REPORT_TYPES = [
  { key: 'bug', label: 'Bug', color: 'red', icon: '🐛' },
  { key: 'payment', label: 'Paiement', color: 'amber', icon: '💳' },
  { key: 'account', label: 'Compte', color: 'blue', icon: '👤' },
  { key: 'sync', label: 'Synchronisation', color: 'trivida', icon: '🔄' },
  { key: 'ai', label: 'IA', color: 'purple', icon: '🤖' },
  { key: 'subscription', label: 'Abonnement', color: 'amber', icon: '📋' },
  { key: 'security', label: 'Sécurité', color: 'red', icon: '🔒' },
  { key: 'other', label: 'Autre', color: 'gray', icon: '❓' },
];

const STATUS_COLORS = {
  open: 'bg-red-900/30 text-red-300 border-red-800',
  pending: 'bg-amber-900/30 text-amber-300 border-amber-800',
  resolved: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
};

export default function SupportPage() {
  const [data, setData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, ticketsRes] = await Promise.allSettled([
          api.get('/api/v1/trivida/admin/support/stats'),
          api.get(`/api/v1/trivida/admin/support/tickets?status=${filter === 'all' ? '' : filter}`),
        ]);
        if (statsRes.status === 'fulfilled' && statsRes.value.success) setData(statsRes.value.data);
        else setError('endpoint_not_ready');
        if (ticketsRes.status === 'fulfilled' && ticketsRes.value.success) setTickets(ticketsRes.value.data || []);
      } catch (err) {
        console.error(err);
        setError('endpoint_not_ready');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500" />
      </div>
    );
  }

  if (error === 'endpoint_not_ready' && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-trivida-400" />
            Centre de Support
          </h1>
          <p className="text-gray-400 mt-1">Tickets, signalements, feedback et utilisateurs à risque</p>
        </div>
        <div className="admin-card text-center py-16">
          <Construction className="w-16 h-16 text-amber-400/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Bientôt disponible</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Le centre de support sera connecté quand le backend exposera les endpoints
            <code className="mx-1 px-2 py-0.5 bg-gray-800 rounded text-trivida-400 text-sm">GET /admin/support/*</code>
          </p>
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg max-w-sm mx-auto text-left">
            <p className="text-xs text-gray-500 font-medium mb-2">Fonctionnalités prévues :</p>
            <div className="space-y-1 text-xs text-gray-400">
              <div>• Tickets utilisateurs (ouverts, en attente, résolus)</div>
              <div>• Signalements par type (bug, paiement, compte...)</div>
              <div>• Utilisateurs à risque de churn</div>
              <div>• Temps moyen de résolution</div>
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
          <LifeBuoy className="w-6 h-6 text-trivida-400" />
          Centre de Support
        </h1>
        <p className="text-gray-400 mt-1">Tickets, signalements, feedback et utilisateurs à risque</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="admin-card text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-red-400">{formatNumber(data?.openTickets || 0)}</div>
          <div className="text-xs text-gray-400">Tickets ouverts</div>
        </div>
        <div className="admin-card text-center">
          <Clock className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-amber-400">{formatNumber(data?.pendingTickets || 0)}</div>
          <div className="text-xs text-gray-400">En attente</div>
        </div>
        <div className="admin-card text-center">
          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-emerald-400">{formatNumber(data?.resolvedTickets || 0)}</div>
          <div className="text-xs text-gray-400">Résolus</div>
        </div>
        <div className="admin-card text-center">
          <Clock className="w-6 h-6 text-trivida-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{data?.avgResolutionTime || '—'}</div>
          <div className="text-xs text-gray-400">Temps moyen résolution</div>
        </div>
      </div>

      {/* Signalements par type */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4">Signalements par type</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {REPORT_TYPES.map(type => (
            <div key={type.key} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <span className="text-xl">{type.icon}</span>
              <div>
                <div className="text-lg font-bold text-white">{formatNumber(data?.byType?.[type.key] || 0)}</div>
                <div className="text-xs text-gray-400">{type.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Utilisateurs à risque */}
      <div className="admin-card border-amber-800/30">
        <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Utilisateurs à risque de churn
        </h3>
        <div className="space-y-2">
          {(data?.atRiskUsers || []).slice(0, 5).map((u, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-900/30 flex items-center justify-center text-amber-400 text-sm font-bold">
                  {u.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-white font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${u.riskScore >= 70 ? 'text-red-400' : u.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {u.riskScore}%
                </div>
                <div className="text-xs text-gray-500">risque</div>
              </div>
            </div>
          ))}
          {(!data?.atRiskUsers || data.atRiskUsers.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">Aucun utilisateur à risque détecté</p>
          )}
        </div>
      </div>

      {/* Filtres + Liste tickets */}
      <div className="flex gap-2 mb-4">
        {['all', 'open', 'pending', 'resolved'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-trivida-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {s === 'all' ? 'Tous' : s === 'open' ? 'Ouverts' : s === 'pending' ? 'En attente' : 'Résolus'}
          </button>
        ))}
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Utilisateur</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Sujet</th>
              <th className="text-center py-3 px-4 text-gray-400 font-medium">Statut</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
              <th className="text-center py-3 px-4 text-gray-400 font-medium">Détail</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-500">Aucun ticket</td></tr>
            ) : tickets.map((t, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                <td className="py-3 px-4 text-white">{t.userName || t.userEmail}</td>
                <td className="py-3 px-4">
                  <span className="text-sm">{REPORT_TYPES.find(r => r.key === t.type)?.icon} {t.type}</span>
                </td>
                <td className="py-3 px-4 text-gray-300 truncate max-w-[200px]">{t.subject}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[t.status] || STATUS_COLORS.open}`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm">{timeAgo(t.createdAt)}</td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => setSelected(t)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-trivida-400">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal détail ticket */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Ticket #{selected._id?.slice(-6)}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div><span className="text-gray-500">Utilisateur:</span> <span className="text-white">{selected.userName}</span></div>
              <div><span className="text-gray-500">Type:</span> <span className="text-white capitalize">{selected.type}</span></div>
              <div><span className="text-gray-500">Sujet:</span> <span className="text-white">{selected.subject}</span></div>
              <div><span className="text-gray-500">Message:</span><p className="text-gray-300 mt-1 whitespace-pre-wrap">{selected.message}</p></div>
              <div><span className="text-gray-500">Date:</span> <span className="text-white">{new Date(selected.createdAt).toLocaleString('fr-FR')}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
