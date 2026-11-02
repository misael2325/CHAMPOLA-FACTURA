import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Car, 
  Phone, 
  Mail, 
  MapPin, 
  PlusCircle, 
  FileText, 
  FileCheck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { ClientInfo, Invoice } from '../types/invoice';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ClientsViewProps {
  clients: ClientInfo[];
  invoices: Invoice[];
  onNewInvoiceForClient: (client: ClientInfo) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  invoices,
  onNewInvoiceForClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.rncOrId && c.rncOrId.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.vehicle?.make && c.vehicle.make.toLowerCase().includes(q)) ||
      (c.vehicle?.model && c.vehicle.model.toLowerCase().includes(q)) ||
      (c.vehicle?.plate && c.vehicle.plate.toLowerCase().includes(q))
    );
  });

  // Calculate client summary metrics
  const getClientStats = (clientName: string) => {
    const clientInvoices = invoices.filter(
      (inv) => inv.client.name.trim().toLowerCase() === clientName.trim().toLowerCase()
    );
    const totalSpent = clientInvoices.reduce((sum, inv) => sum + (inv.status === 'pagada' ? inv.total : 0), 0);
    const pendingAmount = clientInvoices.reduce((sum, inv) => sum + (inv.status === 'pendiente' ? inv.total : 0), 0);
    return {
      count: clientInvoices.length,
      totalSpent,
      pendingAmount,
      lastVisit: clientInvoices[0]?.date || 'Sin visitas',
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>Directorio de Clientes & Vehículos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro automático de clientes atendidos en el taller con historial de vehículos
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
      </div>

      {/* Grid of Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No se encontraron clientes registrados.</p>
          <p>Al guardar o emitir una nueva factura, el cliente y su vehículo se registrarán automáticamente aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client, idx) => {
            const stats = getClientStats(client.name);

            return (
              <div
                key={client.id || idx}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  {/* Name and ID */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {client.name}
                      </h3>
                      {client.rncOrId && (
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                          ID/RNC: {client.rncOrId}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                      {stats.count} {stats.count === 1 ? 'Doc' : 'Docs'}
                    </span>
                  </div>

                  {/* Vehicle block */}
                  {client.vehicle && (client.vehicle.make || client.vehicle.plate) && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Car className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {client.vehicle.make} {client.vehicle.model} {client.vehicle.year ? `(${client.vehicle.year})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Placa: {client.vehicle.plate || 'N/A'}</span>
                        <span>{client.vehicle.mileage || ''}</span>
                      </div>
                    </div>
                  )}

                  {/* Contact details */}
                  <div className="text-[11px] text-slate-600 space-y-1">
                    {client.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial stats and action button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px]">
                    <span className="text-slate-400 block">Facturado:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(stats.totalSpent, 'RD$')}
                    </span>
                  </div>

                  <button
                    onClick={() => onNewInvoiceForClient(client)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-xs transition-all active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Facturar</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
