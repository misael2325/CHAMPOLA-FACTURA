import React, { useState } from 'react';
import { X, Plus, Wrench, Search, Check } from 'lucide-react';
import { COMMON_MECHANIC_ITEMS } from '../utils/storage';
import { InvoiceItem } from '../types/invoice';
import { formatCurrency } from '../utils/formatters';

interface QuickItemPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onSelectItem: (item: Omit<InvoiceItem, 'id' | 'total'>) => void;
}

export const QuickItemPresetsModal: React.FC<QuickItemPresetsModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  onSelectItem,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const filteredItems = COMMON_MECHANIC_ITEMS.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'todos' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAdd = (item: Omit<InvoiceItem, 'id' | 'total'>, idx: number) => {
    onSelectItem(item);
    setRecentlyAddedId(idx);
    setTimeout(() => setRecentlyAddedId(null), 700);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'mano_obra':
        return 'Mano de Obra';
      case 'repuesto':
        return 'Repuesto / Pieza';
      case 'fluido':
        return 'Aceite / Fluido';
      case 'diagnostico':
        return 'Diagnóstico';
      default:
        return 'Servicio';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Catálogo Rápido de Mecánica</h3>
              <p className="text-[11px] text-slate-400">Haga clic en cualquier servicio o repuesto para añadirlo a la factura</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar servicio (ej. aceite, frenos, escáner, inyectores)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {['todos', 'mano_obra', 'repuesto', 'fluido', 'diagnostico'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat === 'todos' ? 'Todos los Servicios' : getCategoryBadge(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* List of items */}
        <div className="p-4 overflow-y-auto divide-y divide-slate-100 max-h-[50vh]">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No se encontraron repuestos o servicios con ese término de búsqueda.
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-700">
                      {item.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{getCategoryBadge(item.category)}</span>
                    <span aria-hidden="true">·</span>
                    <span>Cant: {item.quantity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {formatCurrency(item.unitPrice, currencySymbol)}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => handleAdd(item, idx)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      recentlyAddedId === idx
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-amber-500 text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    {recentlyAddedId === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Añadido</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {filteredItems.length} servicios automotrices listados
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
