/**
 * SettingsPage — Trivida Admin Panel
 * 
 * Page Paramètres avec :
 *   - Prix des plans (Basic, Premium) modifiables
 *   - Quotas IA configurables
 *   - Configuration WhatsApp
 *   - Templates de messages
 */
import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Loader2, AlertTriangle, CheckCircle,
  Crown, Brain, MessageCircle, Bell, DollarSign
} from 'lucide-react';
import { api, formatCurrency } from '../utils/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  // Formulaire
  const [form, setForm] = useState({
    planPrices: { basic: 1500, premium: 3500 },
    aiQuotaPerDay: 5,
    alerts: { expiringDaysBefore: 7, lockThreshold: 5 },
    whatsapp: { enabled: false, apiKey: '', phone: '' },
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await api.get('/api/v1/trivida/admin/settings');
        if (data.success && data.data) {
          setSettings(data.data);
          setForm({
            planPrices: data.data.planPrices || { basic: 1500, premium: 3500 },
            aiQuotaPerDay: data.data.aiQuotaPerDay || 5,
            alerts: data.data.alerts || { expiringDaysBefore: 7, lockThreshold: 5 },
            whatsapp: data.data.whatsapp || { enabled: false, apiKey: '', phone: '' },
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError(null);
    
    try {
      const data = await api.patch('/api/v1/trivida/admin/settings', form);
      if (data.success) {
        setSettings(data.data);
        setSuccess('Paramètres sauvegardés avec succès');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path, value) => {
    setForm(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Paramètres</h1>
          <p className="text-gray-400 mt-1">Configuration des plans, quotas et messages</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Sauvegarder
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-900/30 border border-emerald-800 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />{success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />{error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prix des plans */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <DollarSign className="w-5 h-5 inline mr-2 text-emerald-400" />
            Prix des plans (XAF / mois)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Basic</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.planPrices.basic}
                  onChange={(e) => updateField('planPrices.basic', parseInt(e.target.value) || 0)}
                  className="admin-input pr-12"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">XAF</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Premium</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.planPrices.premium}
                  onChange={(e) => updateField('planPrices.premium', parseInt(e.target.value) || 0)}
                  className="admin-input pr-12"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">XAF</span>
              </div>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg text-sm text-gray-400">
              Revenu mensuel estimé : <span className="text-white font-medium">{formatCurrency(0)}</span>
            </div>
          </div>
        </div>

        {/* Quotas IA */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <Brain className="w-5 h-5 inline mr-2 text-purple-400" />
            Quotas IA
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Requêtes IA par jour / utilisateur</label>
              <input
                type="number"
                value={form.aiQuotaPerDay}
                onChange={(e) => updateField('aiQuotaPerDay', parseInt(e.target.value) || 5)}
                className="admin-input"
                min="1"
                max="100"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-4 mt-6">
            <Bell className="w-5 h-5 inline mr-2 text-amber-400" />
            Alertes
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Jours avant expiration pour relance</label>
              <input
                type="number"
                value={form.alerts.expiringDaysBefore}
                onChange={(e) => updateField('alerts.expiringDaysBefore', parseInt(e.target.value) || 7)}
                className="admin-input"
                min="1"
                max="90"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tentatives max avant verrouillage</label>
              <input
                type="number"
                value={form.alerts.lockThreshold}
                onChange={(e) => updateField('alerts.lockThreshold', parseInt(e.target.value) || 5)}
                className="admin-input"
                min="1"
                max="20"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">
            <MessageCircle className="w-5 h-5 inline mr-2 text-emerald-400" />
            Configuration WhatsApp
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <input
                type="checkbox"
                id="whatsappEnabled"
                checked={form.whatsapp.enabled}
                onChange={(e) => updateField('whatsapp.enabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-600"
              />
              <label htmlFor="whatsappEnabled" className="text-sm text-white cursor-pointer">
                Activer l'envoi WhatsApp
              </label>
            </div>
            {form.whatsapp.enabled && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Clé API CallMeBot</label>
                  <input
                    type="text"
                    value={form.whatsapp.apiKey}
                    onChange={(e) => updateField('whatsapp.apiKey', e.target.value)}
                    className="admin-input"
                    placeholder="Votre clé API CallMeBot"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Numéro de téléphone</label>
                  <input
                    type="text"
                    value={form.whatsapp.phone}
                    onChange={(e) => updateField('whatsapp.phone', e.target.value)}
                    className="admin-input"
                    placeholder="+242..."
                  />
                </div>
                <div className="p-3 bg-emerald-900/20 border border-emerald-800/30 rounded-lg text-sm text-emerald-300">
                  Utilise l'API gratuite CallMeBot. Inscrivez-vous sur callmebot.com pour obtenir votre clé.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
