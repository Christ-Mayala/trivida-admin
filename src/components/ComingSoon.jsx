/**
 * ComingSoon — Badge "Bientôt disponible"
 * 
 * Composant réutilisable pour marquer les features pas encore branchées
 * au backend mobile.
 */
import React from 'react';
import { Clock, Construction } from 'lucide-react';

export default function ComingSoon({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/50 border border-amber-700/50 rounded-full">
          <Construction className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">Bientôt disponible</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline badge pour marquer un KPI comme pas encore branché
 */
export function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-900/30 text-amber-400 text-[10px] font-bold rounded border border-amber-800/50">
      <Clock className="w-2.5 h-2.5" />
      BIENTÔT
    </span>
  );
}
