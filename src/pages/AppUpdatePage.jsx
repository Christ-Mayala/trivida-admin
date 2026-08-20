/**
 * AppUpdatePage — Trivida Admin Panel
 * 
 * Page App Update avec :
 *   - Lecture du manifest actuel
 *   - Formulaire de modification
 *   - Historique des changements
 */
import React, { useState, useEffect } from 'react';
import { 
  Download, Save, AlertTriangle, CheckCircle, 
  Info, Loader2, RefreshCw
} from 'lucide-react';
import { api } from '../utils/api';

export default function AppUpdatePage() {
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  
  // État du formulaire
  const [form, setForm] = useState({
    latest: '',
    minimum: '',
    force: false,
    changelog: '',
  });

  // Charger le manifest
  useEffect(() => {
    async function fetchManifest() {
      try {
        const data = await api.get('/api/v1/trivida/admin/app/update');
        if (data.success) {
          setManifest(data.data);
          setForm({
            latest: data.data.latest || '',
            minimum: data.data.minimum || '',
            force: data.data.force || false,
            changelog: (data.data.changelog || []).join('\n'),
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchManifest();
  }, []);

  // Sauvegarder
  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setSaveError('');
    
    try {
      const payload = {
        latest: form.latest,
        minimum: form.minimum,
        force: form.force,
        changelog: form.changelog.split('\n').filter(line => line.trim()),
      };
      
      const data = await api.patch('/api/v1/trivida/admin/app/update', payload);
      
      if (data.success) {
        setManifest(data.data);
        setSuccess('Manifest de mise à jour sauvegardé avec succès');
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">App Update</h1>
        <p className="text-gray-400 mt-1">Gestion du manifeste de mise à jour mobile</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="p-3 bg-emerald-900/30 border border-emerald-800 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}
      {saveError && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de modification */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Download className="w-5 h-5 inline mr-2 text-trivida-400" />
            Modifier le manifest
          </h3>
          
          <div className="space-y-4">
            {/* Version actuelle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Version actuelle (latest)
              </label>
              <input
                type="text"
                value={form.latest}
                onChange={(e) => setForm(prev => ({ ...prev, latest: e.target.value }))}
                className="admin-input"
                placeholder="ex: 1.3.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dernière version publiée sur le Play Store
              </p>
            </div>
            
            {/* Version minimale */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Version minimale (minimum)
              </label>
              <input
                type="text"
                value={form.minimum}
                onChange={(e) => setForm(prev => ({ ...prev, minimum: e.target.value }))}
                className="admin-input"
                placeholder="ex: 1.1.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                En dessous → mise à jour forcée
              </p>
            </div>
            
            {/* Forcer la mise à jour */}
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <input
                type="checkbox"
                id="force"
                checked={form.force}
                onChange={(e) => setForm(prev => ({ ...prev, force: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-trivida-600 focus:ring-trivida-500"
              />
              <div>
                <label htmlFor="force" className="text-sm font-medium text-white cursor-pointer">
                  Forcer la mise à jour
                </label>
                <p className="text-xs text-gray-500">
                  Correctif critique — tous les utilisateurs seront obligés de mettre à jour
                </p>
              </div>
            </div>
            
            {/* Changelog */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Changelog (un élément par ligne)
              </label>
              <textarea
                value={form.changelog}
                onChange={(e) => setForm(prev => ({ ...prev, changelog: e.target.value }))}
                className="admin-input h-32 resize-none"
                placeholder="Synchronisation plus rapide&#10;Nouvelles fonctionnalités&#10;Corrections de bugs"
              />
            </div>
            
            {/* Bouton sauvegarder */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              ) : (
                <Save className="w-4 h-4 inline mr-2" />
              )}
              Sauvegarder le manifest
            </button>
          </div>
        </div>

        {/* Aperçu du manifest actuel */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Info className="w-5 h-5 inline mr-2 text-blue-400" />
            Manifest actuel
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Version actuelle</div>
              <div className="text-xl font-bold text-white">{manifest?.latest || '—'}</div>
            </div>
            
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Version minimale</div>
              <div className="text-xl font-bold text-white">{manifest?.minimum || '—'}</div>
            </div>
            
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Forcer la mise à jour</div>
              <div className="text-xl font-bold text-white">
                {manifest?.force ? (
                  <span className="text-red-400">OUI ⚠️</span>
                ) : (
                  <span className="text-emerald-400">Non</span>
                )}
              </div>
            </div>
            
            {manifest?.changelog && manifest.changelog.length > 0 && (
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-2">Changelog</div>
                <ul className="space-y-1">
                  {manifest.changelog.map((item, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-trivida-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Info endpoint public */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h4 className="text-blue-300 font-medium">Endpoint public</h4>
                <p className="text-blue-200/70 mt-1">
                  Le mobile consulte <code className="bg-blue-900/50 px-1 rounded">GET /api/v1/app/update</code> 
                  {' '}pour vérifier les mises à jour. Ce endpoint est public (pas d'auth requise).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
