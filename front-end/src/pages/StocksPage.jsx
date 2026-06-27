import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { superAdminNav } from '../config/navigation';
import { paysApi, toBackendCode, formatDate } from '../services/api';
import { Package, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const COUNTRIES = [
  { id: 'all', label: 'Tous' },
  { id: 'brazil', label: 'Brésil' },
  { id: 'ecuador', label: 'Équateur' },
  { id: 'colombia', label: 'Colombie' },
];

const PAYS_LABEL = { BRESIL: 'Brésil', EQUATEUR: 'Équateur', COLOMBIE: 'Colombie' };

const STATUT_CONFIG = {
  CONFORME: { label: 'Conforme', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  EN_ALERTE: { label: 'En alerte', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  PERIME: { label: 'Périmé', className: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

const STATUT_FILTERS = ['Tous', 'CONFORME', 'EN_ALERTE', 'PERIME'];

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] || { label: statut, className: 'bg-slate-100 text-slate-600 border border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
    </div>
  );
}

export default function StocksPage() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [statutFilter, setStatutFilter] = useState('Tous');
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendCode = selectedCountry === 'all' ? null : toBackendCode(selectedCountry);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    paysApi.lots(backendCode)
      .then((data) => { if (!cancelled) setLots(data || []); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [selectedCountry]);

  const filteredLots = useMemo(() => {
    if (statutFilter === 'Tous') return lots;
    return lots.filter((l) => l.statut === statutFilter);
  }, [lots, statutFilter]);

  const stats = useMemo(() => ({
    total: lots.length,
    conformes: lots.filter((l) => l.statut === 'CONFORME').length,
    enAlerte: lots.filter((l) => l.statut === 'EN_ALERTE').length,
    perimes: lots.filter((l) => l.statut === 'PERIME').length,
  }), [lots]);

  return (
    <DashboardLayout
      title="Stocks & lots"
      navItems={superAdminNav}
      topTabs={COUNTRIES}
      activeTab={selectedCountry}
      onTabChange={(id) => { setSelectedCountry(id); setStatutFilter('Tous'); }}
    >
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          {selectedCountry === 'all'
            ? 'Stocks & lots — tous les pays'
            : `Stocks & lots — ${PAYS_LABEL[backendCode] || ''}`}
        </h1>
        <p className="text-slate-500 text-base">
          Suivi des lots de café en stock et de leur état qualité.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-rose-700">
          Erreur de chargement : {error}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-slate-500" />
                <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Total lots</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-white border-l-4 border-emerald-500 border-t border-r border-b border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Conformes</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">{stats.conformes}</p>
            </div>
            <div className="bg-white border-l-4 border-amber-500 border-t border-r border-b border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <p className="text-sm font-medium uppercase tracking-wider text-slate-500">En alerte</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">{stats.enAlerte}</p>
            </div>
            <div className="bg-white border-l-4 border-rose-500 border-t border-r border-b border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="w-5 h-5 text-rose-500" />
                <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Périmés</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">{stats.perimes}</p>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                Liste des lots{filteredLots.length !== lots.length ? ` (${filteredLots.length} / ${lots.length})` : ` (${lots.length})`}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {STATUT_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatutFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      statutFilter === s
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s === 'Tous' ? 'Tous' : (STATUT_CONFIG[s]?.label || s)}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Référence</th>
                    {selectedCountry === 'all' && (
                      <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Pays</th>
                    )}
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Entrepôt</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Date de stockage</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Jours en stock</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLots.length === 0 ? (
                    <tr>
                      <td colSpan={selectedCountry === 'all' ? 6 : 5} className="px-6 py-12 text-center text-slate-400 text-sm">
                        Aucun lot trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredLots.map((lot) => (
                      <tr key={`${lot.pays}-${lot.id}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">{lot.reference}</td>
                        {selectedCountry === 'all' && (
                          <td className="px-6 py-4 text-slate-600">{PAYS_LABEL[lot.pays] || lot.pays || '—'}</td>
                        )}
                        <td className="px-6 py-4 text-slate-600">{lot.entrepotNom || `Entrepôt #${lot.entrepotId}`}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {lot.dateStockage ? formatDate(lot.dateStockage) : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          <span className={`font-medium ${lot.joursEnStock > 365 ? 'text-rose-600' : 'text-slate-700'}`}>
                            {lot.joursEnStock ?? '—'} j
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatutBadge statut={lot.statut} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
