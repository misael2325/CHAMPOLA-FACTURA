import React from 'react';
import { 
  Wrench, 
  FileText, 
  History, 
  Users, 
  Settings, 
  PlusCircle,
  FileCheck
} from 'lucide-react';
import { WorkshopProfile } from '../types/invoice';

interface HeaderProps {
  currentTab: 'editor' | 'history' | 'clients';
  onSelectTab: (tab: 'editor' | 'history' | 'clients') => void;
  onNewDocument: () => void;
  onOpenSettings: () => void;
  workshopProfile: WorkshopProfile;
  totalInvoicesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onNewDocument,
  onOpenSettings,
  workshopProfile,
  totalInvoicesCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zona 1: Brand & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-inner">
              <Wrench className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  AUTODOC
                </span>
                <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                  Mecánica
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
                {workshopProfile.name}
              </p>
            </div>
          </div>

          {/* Zona 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onSelectTab('editor')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentTab === 'editor'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generador</span>
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Historial ({totalInvoicesCount})</span>
            </button>

            <button
              onClick={() => onSelectTab('clients')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentTab === 'clients'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clientes & Vehículos</span>
            </button>
          </nav>

          {/* Zona 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenSettings}
              title="Configuración de Datos del Taller o Emisor"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onNewDocument}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Documento</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-800 py-2 gap-2 overflow-x-auto">
          <button
            onClick={() => onSelectTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${
              currentTab === 'editor'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generador</span>
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${
              currentTab === 'history'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial ({totalInvoicesCount})</span>
          </button>
          <button
            onClick={() => onSelectTab('clients')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${
              currentTab === 'clients'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Clientes</span>
          </button>
        </div>

      </div>
    </header>
  );
};
