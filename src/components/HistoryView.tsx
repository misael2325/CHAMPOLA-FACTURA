import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  FileCheck, 
  Download, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Car, 
  DollarSign, 
  TrendingUp, 
  FileSpreadsheet,
  PlusCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Invoice, DocumentType, InvoiceStatus } from '../types/invoice';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadInvoicePDF } from '../utils/pdfGenerator';

interface HistoryViewProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onConvertToInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onStatusChange: (id: string, newStatus: InvoiceStatus) => void;
  onNewDocument: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  invoices,
  onSelectInvoice,
  onEditInvoice,
  onDuplicateInvoice,
  onConvertToInvoice,
  onDeleteInvoice,
  onStatusChange,
  onNewDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'todos' | DocumentType>('todos');
  const [selectedStatus, setSelectedStatus] = useState<'todos' | InvoiceStatus>('todos');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoy' | 'mes' | 'rango'>('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Compute Metrics
  const metrics = useMemo(() => {
    let totalBilled = 0;
    let totalPending = 0;
    let quotesCount = 0;
    let invoicesCount = 0;

    invoices.forEach((inv) => {
      if (inv.documentType === 'factura') {
        invoicesCount += 1;
        if (inv.status === 'pagada') {
          totalBilled += inv.total;
        } else if (inv.status === 'pendiente') {
          totalPending += inv.total;
        }
      } else {
        quotesCount += 1;
      }
    });

    return {
      totalBilled,
      totalPending,
      quotesCount,
      invoicesCount,
      totalRecords: invoices.length,
    };
  }, [invoices]);

  // Filtering Logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search text (client, number, plate, make, model)
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        inv.client.name.toLowerCase().includes(q) ||
        inv.number.toLowerCase().includes(q) ||
        inv.client.phone.includes(q) ||
        (inv.vehicle.plate && inv.vehicle.plate.toLowerCase().includes(q)) ||
        (inv.vehicle.make && inv.vehicle.make.toLowerCase().includes(q)) ||
        (inv.vehicle.model && inv.vehicle.model.toLowerCase().includes(q));

      // Type filter
      const matchType = selectedType === 'todos' || inv.documentType === selectedType;

      // Status filter
      const matchStatus = selectedStatus === 'todos' || inv.status === selectedStatus;

      // Date filter
      let matchDate = true;
      if (dateFilter === 'hoy') {
        const todayStr = new Date().toISOString().split('T')[0];
        matchDate = inv.date === todayStr;
      } else if (dateFilter === 'mes') {
        const now = new Date();
        const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        matchDate = inv.date.startsWith(currentYearMonth);
      } else if (dateFilter === 'rango') {
        if (startDate && inv.date < startDate) matchDate = false;
        if (endDate && inv.date > endDate) matchDate = false;
      }

      return matchSearch && matchType && matchStatus && matchDate;
    });
  }, [invoices, searchTerm, selectedType, selectedStatus, dateFilter, startDate, endDate]);

  // Export filtered list to CSV
  const exportToCSV = () => {
    if (filteredInvoices.length === 0) {
      alert('No hay registros para exportar con los filtros seleccionados.');
      return;
    }

    const headers = [
      'Tipo',
      'Numero',
      'Fecha',
      'Cliente',
      'RNC_Cedula',
      'Telefono',
      'Vehiculo_Marca',
      'Vehiculo_Modelo',
      'Placa',
      'Subtotal',
      'ITBIS',
      'Total',
      'Estado',
      'Metodo_Pago',
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.documentType === 'factura' ? 'Factura' : 'Cotizacion',
      `"${inv.number}"`,
      inv.date,
      `"${inv.client.name.replace(/"/g, '""')}"`,
      `"${inv.client.rncOrId || ''}"`,
      `"${inv.client.phone || ''}"`,
      `"${inv.vehicle.make || ''}"`,
      `"${inv.vehicle.model || ''}"`,
      `"${inv.vehicle.plate || ''}"`,
      inv.subtotal,
      inv.itbisAmount,
      inv.total,
      inv.status,
      inv.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Historial_Facturas_Taller_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* SaaS Metric Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Facturado (Cobrado)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-mono font-extrabold text-slate-900 tabular-nums">
              {formatCurrency(metrics.totalBilled, 'RD$')}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Facturas completadas y pagadas
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Por Cobrar (Pendiente)
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-mono font-extrabold text-amber-600 tabular-nums">
              {formatCurrency(metrics.totalPending, 'RD$')}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Trabajos entregados pendientes de pago
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cotizaciones Activas
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-mono font-extrabold text-slate-900 tabular-nums">
              {metrics.quotesCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Presupuestos emitidos para aprobación
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total de Registros
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-mono font-extrabold text-slate-900 tabular-nums">
              {metrics.totalRecords}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Facturas y cotizaciones en el sistema
            </p>
          </div>
        </div>

      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por cliente, No. de factura, placa o modelo de vehículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportToCSV}
              title="Descargar listado en Excel / CSV"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onNewDocument}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nueva Factura / Cotización</span>
            </button>
          </div>

        </div>

        {/* Filter Pills / Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          
          {/* Tipo de Documento */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setSelectedType('todos')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                selectedType === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Todos ({invoices.length})
            </button>
            <button
              onClick={() => setSelectedType('factura')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                selectedType === 'factura' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Facturas
            </button>
            <button
              onClick={() => setSelectedType('cotizacion')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                selectedType === 'cotizacion' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Cotizaciones
            </button>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setSelectedStatus('todos')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                selectedStatus === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Estados: Todos
            </button>
            <button
              onClick={() => setSelectedStatus('pagada')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                selectedStatus === 'pagada' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Pagadas
            </button>
            <button
              onClick={() => setSelectedStatus('pendiente')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                selectedStatus === 'pendiente' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pendientes
            </button>
          </div>

          {/* Fecha Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setDateFilter('todos')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                dateFilter === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Histórico Completo
            </button>
            <button
              onClick={() => setDateFilter('hoy')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                dateFilter === 'hoy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setDateFilter('mes')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                dateFilter === 'mes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Este Mes
            </button>
            <button
              onClick={() => setDateFilter('rango')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                dateFilter === 'rango' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Rango de Fechas
            </button>
          </div>

          {/* Rango Date Pickers */}
          {dateFilter === 'rango' && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-500">Desde:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-0.5 text-xs border border-slate-300 rounded bg-white"
              />
              <span className="text-[11px] text-slate-500">Hasta:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-0.5 text-xs border border-slate-300 rounded bg-white"
              />
            </div>
          )}

        </div>

      </div>

      {/* Main Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Registros Encontrados:</span>
            <span className="font-mono text-slate-600 font-semibold">{filteredInvoices.length}</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Haga clic en 'Ver' para previsualizar, imprimir o exportar a PDF
          </span>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              No se encontraron facturas o cotizaciones
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intente ajustar los términos de búsqueda o crear un nuevo registro para este cliente.
            </p>
            <button
              onClick={onNewDocument}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear Nuevo Documento</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Vehículo / Placa</th>
                  <th className="py-3 px-3 text-right">Monto Total</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInvoices.map((inv) => {
                  const isQuote = inv.documentType === 'cotizacion';

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Documento y Tipo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-md ${
                              isQuote
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {isQuote ? (
                              <FileCheck className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900 block">
                              {inv.number}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-medium">
                              {isQuote ? 'Cotización' : 'Factura'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                        {formatDate(inv.date)}
                      </td>

                      {/* Cliente */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 truncate max-w-[200px]">
                          {inv.client.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {inv.client.rncOrId || inv.client.phone || 'Sin RNC'}
                        </div>
                      </td>

                      {/* Vehículo */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">
                            {inv.vehicle.make} {inv.vehicle.model}
                          </span>
                        </div>
                        {inv.vehicle.plate && (
                          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                            {inv.vehicle.plate}
                          </span>
                        )}
                      </td>

                      {/* Monto Total */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(inv.total, 'RD$')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {inv.applyItbis ? 'Con ITBIS' : 'Exento'}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            const nextStatus: InvoiceStatus =
                              inv.status === 'pagada' ? 'pendiente' : 'pagada';
                            onStatusChange(inv.id, nextStatus);
                          }}
                          title="Haga clic para cambiar entre Pagada y Pendiente"
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded transition-transform active:scale-95 ${
                            inv.status === 'pagada'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : inv.status === 'pendiente'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {inv.status === 'pagada' && <CheckCircle className="w-3 h-3" />}
                          {inv.status === 'pendiente' && <Clock className="w-3 h-3" />}
                          <span>{inv.status}</span>
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Previsualizar */}
                          <button
                            onClick={() => onSelectInvoice(inv)}
                            title="Ver vista previa / imprimir"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Convertir cotización a factura */}
                          {isQuote && (
                            <button
                              onClick={() => onConvertToInvoice(inv)}
                              title="Convertir esta cotización en Factura"
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Editar */}
                          <button
                            onClick={() => onEditInvoice(inv)}
                            title="Modificar o corregir documento"
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Duplicar */}
                          <button
                            onClick={() => onDuplicateInvoice(inv)}
                            title="Duplicar para este cliente / vehículo"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Eliminar con confirmación */}
                          {deleteConfirmId === inv.id ? (
                            <div className="inline-flex items-center gap-1 bg-red-50 p-1 rounded border border-red-200">
                              <span className="text-[10px] text-red-700 font-bold">¿Borrar?</span>
                              <button
                                onClick={() => {
                                  onDeleteInvoice(inv.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-1.5 py-0.5 text-[10px] bg-red-600 text-white rounded font-bold"
                              >
                                Sí
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 text-[10px] bg-slate-200 text-slate-700 rounded"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(inv.id)}
                              title="Eliminar registro"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
