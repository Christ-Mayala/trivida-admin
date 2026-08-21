/**
 * AdminsPage — GESTION DES ADMINISTRATEURS
 * 
 * CRUD administrateurs avec rôles : SUPERADMIN, ADMIN, SUPPORT, ANALYST.
 * Permissions granulaires.
 */
import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Edit2, Trash2, Users, Save, X, AlertTriangle, CheckCircle
} from 'lucide-react';
import { api } from '../utils/api';

const ROLES = {
  superadmin: { label: 'Super Admin', color: 'bg-purple-900/50 text-purple-300 border-purple-700', permissions: ['Tout'] },
  admin: { label: 'Admin', color: 'bg-blue-900/50 text-blue-300 border-blue-700', permissions: ['Users', 'Messaging', 'Support', 'Analytics'] },
  support: { label: 'Support', color: 'bg-emerald-900/50 text-emerald-300 border-emerald-700', permissions: ['Users', 'Support', 'Messaging'] },
  analyst: { label: 'Analyst', color: 'bg-amber-900/50 text-amber-300 border-amber-700', permissions: ['Dashboard', 'Intel Analytics', 'Revenue', 'Performance'] },
};

const EMPTY_FORM = { name: '', email: '', password: '', role: 'admin' };

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchAdmins(); }, []);

  async function fetchAdmins() {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/trivida/admin/admins');
      if (res.success) setAdmins(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      if (editing) {
        const res = await api.patch(`/api/v1/trivida/admin/admins/${editing._id}`, { name: form.name, role: form.role });
        if (res.success) {
          setMessage({ type: 'success', text: 'Administrateur mis à jour !' });
          fetchAdmins();
        }
      } else {
        const res = await api.post('/api/v1/trivida/admin/admins', form);
        if (res.success) {
          setMessage({ type: 'success', text: 'Administrateur créé !' });
          fetchAdmins();
        }
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditing(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet administrateur ?')) return;
    try {
      await api.delete(`/api/v1/trivida/admin/admins/${id}`);
      fetchAdmins();
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(admin) {
    setEditing(admin);
    setForm({ name: admin.name, email: admin.email, role: admin.role });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-trivida-400" />
            Administrateurs
          </h1>
          <p className="text-gray-400 mt-1">Gestion des rôles et permissions admin</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
          message.type === 'success' ? 'bg-emerald-900/30 border border-emerald-800 text-emerald-300' : 'bg-red-900/30 border border-red-800 text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Rôles disponibles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ROLES).map(([key, role]) => (
          <div key={key} className="admin-card text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${role.color}`}>
              {role.label}
            </span>
            <div className="mt-3 text-xs text-gray-400 text-left space-y-1">
              {role.permissions.map(p => (
                <div key={p}>✓ {p}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Liste des admins */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Nom</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
              <th className="text-center py-3 px-4 text-gray-400 font-medium">Rôle</th>
              <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-gray-500">Chargement...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-gray-500">Aucun administrateur</td></tr>
            ) : admins.map((admin) => (
              <tr key={admin._id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-trivida-600/20 flex items-center justify-center text-trivida-400 text-sm font-bold">
                      {admin.name?.charAt(0) || 'A'}
                    </div>
                    <span className="text-white font-medium">{admin.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-400">{admin.email}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold border ${ROLES[admin.role]?.color || ''}`}>
                    {ROLES[admin.role]?.label || admin.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => startEdit(admin)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-trivida-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(admin._id)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {editing ? 'Modifier l\'administrateur' : 'Nouvel administrateur'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nom</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="admin-input w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="admin-input w-full" required disabled={!!editing} />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="admin-input w-full" required />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rôle</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="admin-input w-full">
                  {Object.entries(ROLES).map(([key, role]) => (
                    <option key={key} value={key}>{role.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {editing ? 'Mettre à jour' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
