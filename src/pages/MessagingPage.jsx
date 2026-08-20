/**
 * MessagingPage — Trivida Admin Panel
 * 
 * Page Messagerie avec :
 *   - Envoi d'emails, WhatsApp et SMS aux utilisateurs
 *   - Ciblage par plan, statut, ou personnalisé
 *   - Templates prédéfinis (relance, promo, info)
 *   - Historique des envois
 *   - SMS : admin configure le numéro d'envoi (SIM)
 */
import React, { useState, useEffect } from 'react';
import { 
  Send, Mail, MessageCircle, Users, AlertTriangle, 
  CheckCircle, Loader2, FileText, Smartphone, Phone,
  Copy, ExternalLink, Target, Megaphone
} from 'lucide-react';
import { api, formatNumber } from '../utils/api';

const TARGETS = [
  { value: 'all', label: 'Tous les actifs', description: 'Tous les utilisateurs actifs' },
  { value: 'free', label: 'Plan Free', description: 'Utilisateurs gratuits' },
  { value: 'basic', label: 'Plan Basic', description: 'Abonnés Basic' },
  { value: 'premium', label: 'Plan Premium', description: 'Abonnés Premium' },
  { value: 'expiring', label: 'Abonnements expirants', description: 'Expirent bientôt' },
  { value: 'inactive', label: 'Inactifs', description: 'Sans connexion depuis 30+ jours' },
  { value: 'no_activity', label: 'Sans activité', description: 'Aucune transaction ou action' },
];

const CHANNELS = [
  { value: 'email', label: 'Email', icon: Mail, color: 'text-blue-400' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400' },
  { value: 'sms', label: 'SMS', icon: Smartphone, color: 'text-amber-400' },
  { value: 'both', label: 'Email + WhatsApp', icon: Send, color: 'text-purple-400' },
];

const TEMPLATES = {
  // ── RELANCE ──
  relance_inactive: {
    category: 'relance',
    subject: 'On vous manque chez Trivida 💚',
    body: 'Bonjour {name},\n\nIl y a un moment que nous ne vous avons pas vu sur Trivida ! Vos données sont toujours synchronisées et prêtes.\n\nReconnectez-vous pour ne rien manquer de vos finances.\n\nÀ bientôt !\nL\'équipe Trivida',
  },
  relance_no_sync: {
    category: 'relance',
    subject: 'Vos données ne sont pas à jour',
    body: 'Bonjour {name},\n\nNous avons remarqué que vos données n\'ont pas été synchronisées depuis un moment. Connectez-vous pour garder vos finances à jour.\n\n💪 Votre santé financière compte pour nous !',
  },
  relance_churn: {
    category: 'relance',
    subject: 'Votre abonnement expire bientôt',
    body: 'Bonjour {name},\n\nVotre plan {plan} arrive à échéance le {expiry}. Renouvelez pour continuer à profiter de toutes les fonctionnalités premium.\n\nNe perdez pas vos données et votre historique !',
  },
  // ── PROMOTION ──
  promo_upgrade: {
    category: 'promotion',
    subject: 'Passez au Premium 🚀',
    body: 'Bonjour {name},\n\nDébloquez tout le potentiel de Trivida avec le plan Premium :\n✅ Illimité transactions\n✅ IA financière personnalisée\n✅ Rapports avancés\n✅ Pas de publicité\n\nOffre spéciale : -30% cette semaine !',
  },
  promo_new_feature: {
    category: 'promotion',
    subject: 'Nouveau : Intel Finance est là !',
    body: 'Bonjour {name},\n\nDécouvrez notre dernière innovation : Trivida Intel Finance !\n\n🤖 Un assistant IA qui analyse vos habitudes financières et vous donne des conseils personnalisés pour atteindre vos objectifs.\n\nEssayez-le maintenant dans l\'app !',
  },
  promo_referral: {
    category: 'promotion',
    subject: 'Parrainez et gagnez 1 mois Premium !',
    body: 'Bonjour {name},\n\nInvitez vos amis à rejoindre Trivida et recevez 1 mois de Premium gratuitement pour chaque parrainage réussi !\n\nPartagez votre lien depuis l\'app.',
  },
  // ── INFO ──
  info_maintenance: {
    category: 'info',
    subject: 'Maintenance planifiée',
    body: 'Bonjour {name},\n\nUne maintenance est prévue le [DATE]. L\'app sera temporairement indisponible pendant environ [DURÉE].\n\nVos données sont sauvegardées. Merci de votre compréhension.',
  },
  info_update: {
    category: 'info',
    subject: 'Mise à jour disponible',
    body: 'Bonjour {name},\n\nUne nouvelle version de Trivida est disponible sur le Play Store !\n\n🆕 Nouvelles fonctionnalités et corrections de bugs.\n\nMettez à jour pour profiter des dernières améliorations.',
  },
};

const TEMPLATE_CATEGORIES = {
  relance: { label: 'Relance', color: 'text-amber-400 bg-amber-900/30 border-amber-700' },
  promotion: { label: 'Promotion', color: 'text-emerald-400 bg-emerald-900/30 border-emerald-700' },
  info: { label: 'Information', color: 'text-blue-400 bg-blue-900/30 border-blue-700' },
};

export default function MessagingPage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  // Formulaire
  const [form, setForm] = useState({
    target: 'all',
    channel: 'email',
    subject: '',
    message: '',
    templateKey: '',
    senderNumber: '',
    gatewayUrl: '',
  });

  // Templates depuis le backend
  const [serverTemplates, setServerTemplates] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        // Charger les templates depuis le backend
        const data = await api.get('/api/v1/trivida/admin/messaging/templates');
        if (data.success) setServerTemplates(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Combiner templates backend + templates frontend
  const allTemplates = { ...TEMPLATES, ...serverTemplates };

  // Appliquer un template
  const applyTemplate = (key) => {
    const tpl = allTemplates[key];
    if (tpl) {
      setForm(prev => ({
        ...prev,
        templateKey: key,
        subject: tpl.subject || '',
        message: tpl.body || '',
      }));
    }
  };

  const handleSend = async () => {
    if (!form.message.trim()) {
      setError('Le message ne peut pas être vide');
      return;
    }
    
    setSending(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await api.post('/api/v1/trivida/admin/messaging/send', form);
      if (data.success) {
        setResult(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleWhatsAppBulk = () => {
    // Générer les liens wa.me pour le ciblage sélectionné
    const params = new URLSearchParams({ target: form.target });
    window.open(`/api/v1/trivida/admin/messaging/whatsapp-links?${params}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trivida-500"></div>
      </div>
    );
  }

  const filteredTemplates = Object.entries(allTemplates).filter(([key, tpl]) => {
    if (form.target === 'all' || form.target === 'inactive' || form.target === 'no_activity') return true;
    if (form.target === 'expiring') return tpl.category === 'relance';
    if (form.target === 'free') return tpl.category === 'promotion';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Messagerie</h1>
        <p className="text-gray-400 mt-1">Envoyer des messages aux utilisateurs par email, WhatsApp ou SMS</p>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />{error}
        </div>
      )}
      {result && (
        <div className="p-4 bg-emerald-900/30 border border-emerald-800 rounded-lg text-emerald-300">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Envoi terminé !</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-400">Total :</span> <span className="text-white font-medium">{result.total}</span></div>
            <div><span className="text-gray-400">Emails :</span> <span className="text-white font-medium">{result.emailSent || 0}</span></div>
            <div><span className="text-gray-400">WhatsApp :</span> <span className="text-white font-medium">{result.whatsappSent || 0}</span></div>
            <div><span className="text-gray-400">SMS :</span> <span className="text-white font-medium">{result.smsSent || 0}</span></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ciblage */}
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-white mb-4">
              <Target className="w-5 h-5 inline mr-2 text-trivida-400" />
              Ciblage
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TARGETS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(prev => ({ ...prev, target: t.value, templateKey: '' }))}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    form.target === t.value
                      ? 'border-trivida-500 bg-trivida-600/10 text-trivida-300'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Canal */}
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-white mb-4">
              <Send className="w-5 h-5 inline mr-2 text-blue-400" />
              Canal d'envoi
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CHANNELS.map(c => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.value}
                    onClick={() => setForm(prev => ({ ...prev, channel: c.value }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                      form.channel === c.value
                        ? 'border-trivida-500 bg-trivida-600/10 text-white'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${form.channel === c.value ? c.color : ''}`} />
                    <span className="text-sm font-medium">{c.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SMS Gateway */}
            {form.channel === 'sms' && (
              <div className="mt-4 p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">SMS via SIM physique</span>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">URL du Gateway SMS</label>
                  <input
                    type="text"
                    value={form.gatewayUrl}
                    onChange={(e) => setForm(prev => ({ ...prev, gatewayUrl: e.target.value }))}
                    className="admin-input"
                    placeholder="http://192.168.1.100:8080"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL de l'app SMS Gateway sur votre téléphone Android.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Numéro de la SIM (optionnel)</label>
                  <input
                    type="tel"
                    value={form.senderNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, senderNumber: e.target.value }))}
                    className="admin-input"
                    placeholder="+2376XXXXXXXX"
                  />
                </div>
                
                <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg space-y-3">
                  <p className="text-xs text-gray-400 font-medium mb-1">📱 Comment ça marche :</p>
                  
                  {/* Mode LOCAL */}
                  <div className="p-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                    <p className="text-xs text-emerald-400 font-bold mb-1">Mode LOCAL (même réseau WiFi)</p>
                    <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                      <li>Installez <strong className="text-emerald-300">SMS Gateway</strong> sur Android</li>
                      <li>Notez l'URL (ex: http://192.168.1.100:8080)</li>
                      <li>Collez l'URL ci-dessus</li>
                    </ol>
                  </div>
                  
                  {/* Mode EN LIGNE */}
                  <div className="p-2 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <p className="text-xs text-blue-400 font-bold mb-1">Mode EN LIGNE (API en production)</p>
                    <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                      <li>Installez <strong className="text-blue-300">ngrok</strong> sur votre PC</li>
                      <li>Lancez : <code className="text-blue-300 bg-gray-900 px-1 rounded">ngrok http 8080</code></li>
                      <li>Copiez l'URL publique (ex: https://abc123.ngrok.io)</li>
                      <li>Collez cette URL ci-dessus</li>
                    </ol>
                    <p className="text-xs text-gray-600 mt-1">
                      ngrok crée un tunnel public vers votre téléphone.
                      Fonctionne même si le serveur est en ligne.
                    </p>
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    Apps : "SMS Gateway" (F-Droid) + ngrok.com (gratuit)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-white mb-4">
              <FileText className="w-5 h-5 inline mr-2 text-amber-400" />
              Message
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sujet (email)</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value, templateKey: '' }))}
                  className="admin-input"
                  placeholder="Sujet de l'email..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value, templateKey: '' }))}
                  className="admin-input h-40 resize-none"
                  placeholder="Votre message ici... Utilisez {name}, {plan}, {expiry} pour personnaliser."
                />
                <p className="text-xs text-gray-600 mt-1">
                  Variables : {'{name}'} {'{email}'} {'{plan}'} {'{expiry}'}
                </p>
              </div>
              
              {/* Preview */}
              {form.message && (
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Prévisualisation :</p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {form.message
                      .replace(/\{name\}/g, 'Jean Dupont')
                      .replace(/\{email\}/g, 'jean@example.com')
                      .replace(/\{plan\}/g, 'Premium')
                      .replace(/\{expiry\}/g, '31/12/2026')
                    }
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleSend}
                  disabled={sending || !form.message.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Envoi en cours...</>
                  ) : (
                    <><Send className="w-4 h-4" />Envoyer</>
                  )}
                </button>
                {form.channel === 'whatsapp' && (
                  <button
                    onClick={handleWhatsAppBulk}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Ouvrir WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar : templates */}
        <div className="space-y-6">
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-white mb-4">
              <Megaphone className="w-5 h-5 inline mr-2 text-purple-400" />
              Templates
            </h3>
            
            {/* Filtres par catégorie */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  className={`px-2 py-1 rounded text-xs font-medium border ${cat.color}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTemplates.map(([key, tpl]) => {
                const cat = TEMPLATE_CATEGORIES[tpl.category] || TEMPLATE_CATEGORIES.info;
                return (
                  <button
                    key={key}
                    onClick={() => applyTemplate(key)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      form.templateKey === key
                        ? 'border-trivida-500 bg-trivida-600/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cat.color}`}>
                        {cat.label}
                      </span>
                      <span className="text-sm font-medium text-white truncate">{tpl.subject}</span>
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2">{tpl.body?.substring(0, 100)}...</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Variables disponibles</h3>
            <div className="space-y-1 text-xs text-gray-500">
              <div><code className="text-trivida-400">{'{name}'}{'   '}</code> Nom de l'utilisateur</div>
              <div><code className="text-trivida-400">{'{email}'}{'   '}</code> Email</div>
              <div><code className="text-trivida-400">{'{plan}'}{'   '}</code> Plan actuel</div>
              <div><code className="text-trivida-400">{'{expiry}'}{'   '}</code> Date d'expiration</div>
            </div>
          </div>

          {/* Info WhatsApp gratuit */}
          <div className="admin-card border-emerald-800/50">
            <h3 className="text-sm font-semibold text-emerald-400 mb-2">💬 WhatsApp GRATUIT</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              L'envoi via WhatsApp est <strong className="text-emerald-300">100% gratuit</strong>. 
              Cliquez sur "Ouvrir WhatsApp" pour générer les liens wa.me personnalisés pour chaque utilisateur.
            </p>
          </div>

          {/* Info SMS */}
          <div className="admin-card border-amber-800/50">
            <h3 className="text-sm font-semibold text-amber-400 mb-2">📱 Envoi SMS</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Entrez votre numéro de SIM dans le champ ci-dessus. Les SMS seront préparés avec le message personnalisé pour chaque utilisateur ayant un numéro de téléphone configuré.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
