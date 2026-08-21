/**
 * FeatureFlagsPage — FEATURE FLAGS
 * 
 * Gestion des fonctionnalités activées/désactivées par plan.
 */
import React, { useState, useEffect } from 'react';
import { Flag, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';

const DEFAULT_FLAGS = [
  { key: 'lifeos', label: 'LifeOS', category: 'Intel', description: 'Tableau de bord de vie intelligent' },
  { key: 'decision_engine', label: 'Decision Engine', category: 'Intel', description: 'Analyse de décisions financières' },
  { key: 'predictive_advanced', label: 'Predictive Advanced', category: 'Intel', description: 'Prédictions avancées serveur' },
  { key: 'growth_leaderboard', label: 'Growth Leaderboard', category: 'Growth', description: 'Classement et défis' },
  { key: 'ocr', label: 'OCR', category: 'Business', description: 'Reconnaissance de documents' },
  { key: 'business_module', label: 'Business Module', category: 'Business', description: 'Module business complet' },
  { key: 'badges', label: 'Badges & Streaks', category: 'Growth', description: 'Gamification' },
  { key: 'daily_insights', label: 'Daily Insights', category: 'Intel', description: 'Insights quotidiens personnalisés' },
  { key: 'health_score', label: 'HealthScore', category: 'Intel', description: 'Score de santé financière' },
  { key: 'challenges', label: 'Challenges', category: 'Growth', description: 'Défis hebdomadaires' },
];

const PLANS = ['free', 'premium', 'business'];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/api/v1/trivida/admin/feature-flags');
        if (res.success && res.data) {
          setFlags(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function toggleFlag(flagKey, plan) {
    setFlags(prev => ({
      ...prev,
      [flagKey]: {
        ...prev[flagKey],
        [plan]: !prev[flagKey]?.[plan],
      },
    }));
  }

  function toggleGlobal(flagKey) {
    setFlags(prev => ({
      ...prev,
      [flagKey]: {
        ...prev[flagKey],
        global: !prev[flagKey]?.global,
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.patch('/api/v1/trivida/admin/feature-flags', { flags });
      if (res.success) {
        setMessage({ type: 'success', text: 'Feature flags sauvegardés !' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500" />
      </div>
    );
  }

  const categories = [...new Set(DEFAULT_FLAGS.map(f => f.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flag className="w-6 h-6 text-trivida-400" />
            Feature Flags
          </h1>
          <p className="text-gray-400 mt-1">Activer/désactiver les fonctionnalités par plan — sans republier l'app</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
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

      {categories.map(cat => (
        <div key={cat} className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">{cat}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Fonctionnalité</th>
                  {PLANS.map(plan => (
                    <th key={plan} className="text-center py-3 px-4 text-gray-400 font-medium capitalize">{plan}</th>
                  ))}
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Global</th>
                </tr>
              </thead>
              <tbody>
                {DEFAULT_FLAGS.filter(f => f.category === cat).map(flag => (
                  <tr key={flag.key} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{flag.label}</div>
                      <div className="text-xs text-gray-500">{flag.description}</div>
                    </td>
                    {PLANS.map(plan => (
                      <td key={plan} className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleFlag(flag.key, plan)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            flags[flag.key]?.[plan] ? 'bg-trivida-500' : 'bg-gray-700'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            flags[flag.key]?.[plan] ? 'left-6' : 'left-1'
                          }`} />
                        </button>
                      </td>
                    ))}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleGlobal(flag.key)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          flags[flag.key]?.global ? 'bg-trivida-500' : 'bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          flags[flag.key]?.global ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
