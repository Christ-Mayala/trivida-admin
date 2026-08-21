/**
 * API Utility — Trivida Admin Panel
 * 
 * Client HTTP centralisé pour toutes les requêtes API.
 * Ajoute automatiquement le JWT token dans les headers.
 * Gère les erreurs 401 (redirect vers login).
 */

// En prod : pointer vers le backend (Render)
// En dev : vide (proxy Vite)
const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Fonction utilitaire pour les requêtes API
 */
async function request(method, url, body = null) {
  const token = localStorage.getItem('trivida_admin_token');
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${url}`, config);
  
  // Si 401, déconnexion automatique
  if (response.status === 401) {
    localStorage.removeItem('trivida_admin_token');
    localStorage.removeItem('trivida_admin_user');
    window.location.href = '/admin/login';
    throw new Error('Session expirée');
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `Erreur ${response.status}`);
  }
  
  return data;
}

/**
 * Client API exporté
 */
export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  patch: (url, body) => request('PATCH', url, body),
  put: (url, body) => request('PUT', url, body),
  delete: (url) => request('DELETE', url),
};

/**
 * Télécharger un fichier depuis l'API (CSV/Excel)
 * Utilise fetch avec le token JWT puis déclenche le téléchargement
 */
export async function downloadFile(url, filename) {
  const token = localStorage.getItem('trivida_admin_token');
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}`);
  }
  
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}

/**
 * Formatage des nombres pour l'affichage
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Formatage des montants en XAF
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0 XAF';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' XAF';
}

/** Alias pour compatibilité */
export const formatXAF = formatCurrency;

/**
 * Formatage de date relatif (il y a X minutes, etc.)
 */
export function timeAgo(date) {
  if (!date) return 'Jamais';
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now - past) / 1000);
  
  if (seconds < 60) return 'À l\'instant';
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
  
  return past.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}
