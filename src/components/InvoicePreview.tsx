import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  Share2, 
  CheckCircle, 
  Clock, 
  Car, 
  FileCheck, 
  FileText,
  Building2,
  Wrench,
  Loader2
} from 'lucide-react';
import { Invoice } from '../types/invoice';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadInvoicePDF, printInvoice } from '../utils/pdfGenerator';

interface InvoicePreviewProps {
  invoice: Invoice;
  onBackToEdit: () => void;
  onConvertToInvoice?: (invoice: Invoice) => void;
  onStatusChange?: (newStatus: Invoice['status']) => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  onBackToEdit,
  onConvertToInvoice,
  onStatusChange,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isQuote = invoice.documentType === 'cotizacion';
  const currencySymbol = 'RD$';

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    await downloadInvoicePDF('invoice-document-sheet', invoice, (loading) => {
      setIsGeneratingPDF(loading);
    });
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hola ${invoice.client.name}, le compartimos su ${
        isQuote ? 'Cotización' : 'Factura'
      } No. ${invoice.number} de ${invoice.workshop.name}.\nTotal: ${formatCurrency(
        invoice.total,
        currencySymbol
      )}\nVehículo: ${invoice.vehicle.make} ${invoice.vehicle.model} (Placa: ${
        invoice.vehicle.plate || 'N/A'
      }).\n¡Gracias por confiar en nuestros servicios mecánicos!`
    );
    const cleanPhone = invoice.client.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Action Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Editar</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Quick status selector */}
          {onStatusChange && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Estado:</span>
              <select
                value={invoice.status}
                onChange={(e) => onStatusChange(e.target.value as Invoice['status'])}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="pagada">Pagada</option>
                <option value="pendiente">Pendiente</option>
                <option value="borrador">Borrador</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Convert quote to invoice if applicable */}
          {isQuote && onConvertToInvoice && (
            <button
              onClick={() => onConvertToInvoice(invoice)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
            >
              <FileCheck className="w-4 h-4" />
              <span>Convertir a Factura</span>
            </button>
          )}

          <button
            onClick={handleShareWhatsApp}
            title="Compartir por WhatsApp al cliente"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={printInvoice}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-60"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Exportar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DOCUMENT SHEET (Captured for PDF and Printed) */}
      <div className="flex justify-center p-2 sm:p-4 bg-slate-200/60 rounded-xl overflow-x-auto">
        <div
          id="invoice-document-sheet"
          className="bg-white text-slate-900 w-full max-w-[800px] p-8 sm:p-12 shadow-xl border border-slate-300 rounded-lg font-sans text-xs space-y-6"
          style={{ minHeight: '1050px' }}
        >
          {/* Header Zone: Workshop Info & Document Identification */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-800">
            
            {/* Workshop / Technician Details */}
            <div className="space-y-1.5 max-w-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4 text-slate-950" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight uppercase leading-tight">
                    {invoice.workshop.name}
                  </h1>
                  <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                    {invoice.workshop.type === 'taller' ? 'Taller de Mecánica Automotriz' : 'Servicios Mecánicos Profesionales'}
                  </span>
                </div>
              </div>

              {invoice.workshop.slogan && (
                <p className="text-[11px] text-amber-700 font-medium italic pt-0.5">
                  "{invoice.workshop.slogan}"
                </p>
              )}

              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                <p>
                  <strong className="text-slate-800 font-semibold">RNC / Cédula:</strong>{' '}
                  <span className="font-mono">{invoice.workshop.rnc}</span>
                </p>
                {invoice.workshop.ownerName && (
                  <p>
                    <strong className="text-slate-800 font-semibold">Responsable:</strong>{' '}
                    {invoice.workshop.ownerName}
                  </p>
                )}
                {invoice.workshop.address && (
                  <p>
                    <strong className="text-slate-800 font-semibold">Dirección:</strong>{' '}
                    {invoice.workshop.address}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-3 text-slate-600">
                  {invoice.workshop.phone && <span>Tel: {invoice.workshop.phone}</span>}
                  {invoice.workshop.email && <span>Email: {invoice.workshop.email}</span>}
                </div>
              </div>
            </div>

            {/* Document Box */}
            <div className="sm:text-right shrink-0 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="inline-block px-3 py-1 rounded font-extrabold text-xs uppercase tracking-wider mb-2 text-white bg-slate-900">
                {isQuote ? 'Cotización / Presupuesto' : 'Factura de Servicios'}
              </div>

              <div className="font-mono text-xl font-extrabold text-slate-900 tracking-tight">
                {invoice.number}
              </div>

              <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                <div className="flex sm:justify-end gap-2">
                  <span className="text-slate-500">Fecha de Emisión:</span>
                  <span className="font-semibold text-slate-800">{formatDate(invoice.date)}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex sm:justify-end gap-2">
                    <span className="text-slate-500">
                      {isQuote ? 'Válida Hasta:' : 'Fecha de Vencimiento:'}
                    </span>
                    <span className="font-semibold text-slate-800">{formatDate(invoice.dueDate)}</span>
                  </div>
                )}
                <div className="flex sm:justify-end gap-2 items-center pt-1">
                  <span className="text-slate-500">Estado:</span>
                  <span
                    className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                      invoice.status === 'pagada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : invoice.status === 'pendiente'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Client & Vehicle Information Blocks (2-Columns Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Box 1: Client Details */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Cliente / Facturado A</span>
              </div>
              <div className="pt-1 space-y-1">
                <p className="font-bold text-sm text-slate-900">
                  {invoice.client.name || 'Cliente Ocasional'}
                </p>
                {invoice.client.rncOrId && (
                  <p className="text-[11px] text-slate-600">
                    <strong className="text-slate-700">RNC / Cédula / DNI:</strong>{' '}
                    <span className="font-mono">{invoice.client.rncOrId}</span>
                  </p>
                )}
                {invoice.client.phone && (
                  <p className="text-[11px] text-slate-600">
                    <strong className="text-slate-700">Teléfono / WhatsApp:</strong> {invoice.client.phone}
                  </p>
                )}
                {invoice.client.address && (
                  <p className="text-[11px] text-slate-600">
                    <strong className="text-slate-700">Dirección:</strong> {invoice.client.address}
                  </p>
                )}
                {invoice.client.email && (
                  <p className="text-[11px] text-slate-600">
                    <strong className="text-slate-700">Email:</strong> {invoice.client.email}
                  </p>
                )}
              </div>
            </div>

            {/* Box 2: Vehicle Details */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-600" />
                <span>Datos del Vehículo</span>
              </div>
              <div className="pt-1 space-y-1">
                <p className="font-bold text-sm text-slate-900">
                  {invoice.vehicle.make || 'Vehículo'} {invoice.vehicle.model || ''} {invoice.vehicle.year ? `(${invoice.vehicle.year})` : ''}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-0.5">
                  <div>
                    <strong className="text-slate-700">Placa:</strong>{' '}
                    <span className="font-mono font-bold text-slate-800 bg-slate-200/80 px-1.5 py-0.5 rounded">
                      {invoice.vehicle.plate || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-slate-700">Kilometraje:</strong>{' '}
                    <span className="font-mono">{invoice.vehicle.mileage || 'N/A'}</span>
                  </div>
                  {invoice.vehicle.color && (
                    <div>
                      <strong className="text-slate-700">Color:</strong> {invoice.vehicle.color}
                    </div>
                  )}
                  {invoice.vehicle.vinOrChassis && (
                    <div className="col-span-2">
                      <strong className="text-slate-700">Chasis/VIN:</strong>{' '}
                      <span className="font-mono text-[10px]">{invoice.vehicle.vinOrChassis}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Items / Line Items Table */}
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">Descripción del Servicio / Repuesto</th>
                  <th className="py-2.5 px-3 text-center w-24">Categoría</th>
                  <th className="py-2.5 px-3 text-center w-16">Cant.</th>
                  <th className="py-2.5 px-3 text-right w-28">Precio Unit.</th>
                  <th className="py-2.5 px-3 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500 capitalize">
                      {item.category === 'mano_obra'
                        ? 'Mano de Obra'
                        : item.category === 'repuesto'
                        ? 'Repuesto'
                        : item.category === 'fluido'
                        ? 'Fluido'
                        : item.category === 'diagnostico'
                        ? 'Diagnóstico'
                        : 'General'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {formatCurrency(item.unitPrice, currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.total, currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Section: Notes & Totals Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
            
            {/* Left Column: Notes, Payment & Warranty */}
            <div className="sm:col-span-7 space-y-3">
              {/* Payment Method */}
              <div className="text-[11px] text-slate-700">
                <strong className="text-slate-900">Forma de Pago:</strong>{' '}
                <span className="capitalize font-medium">{invoice.paymentMethod}</span>
              </div>

              {invoice.workshop.bankAccountDetails && (
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600">
                  <span className="font-bold text-slate-800 block">Datos Bancarios para Pago:</span>
                  <span>{invoice.workshop.bankAccountDetails}</span>
                </div>
              )}

              {invoice.notes && (
                <div className="p-2.5 bg-amber-50/40 rounded border border-amber-200/60 text-[10px] text-slate-700">
                  <span className="font-bold text-amber-900 block">Observaciones Mecánicas:</span>
                  <span>{invoice.notes}</span>
                </div>
              )}

              {invoice.warranty && (
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600">
                  <span className="font-bold text-slate-800 block">Garantía del Taller:</span>
                  <span>{invoice.warranty}</span>
                </div>
              )}
            </div>

            {/* Right Column: Calculations & Grand Total */}
            <div className="sm:col-span-5 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatCurrency(invoice.subtotal, currencySymbol)}
                </span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Descuento ({invoice.discountPercent}%):</span>
                  <span className="font-mono font-semibold">
                    -{formatCurrency(invoice.discountAmount, currencySymbol)}
                  </span>
                </div>
              )}

              {/* ITBIS Row */}
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/80 pt-2">
                <div>
                  <span>ITBIS / Impuesto ({invoice.applyItbis ? `${invoice.itbisPercent}%` : 'Exento'}):</span>
                  {!invoice.applyItbis && (
                    <span className="block text-[10px] text-slate-400">No aplica ITBIS</span>
                  )}
                </div>
                <span className="font-mono font-semibold text-slate-900">
                  {invoice.applyItbis
                    ? formatCurrency(invoice.itbisAmount, currencySymbol)
                    : formatCurrency(0, currencySymbol)}
                </span>
              </div>

              {/* TOTAL FINAL */}
              <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
                  Total {isQuote ? 'Estimado' : 'Final'}:
                </span>
                <span className="font-mono text-base font-extrabold text-slate-900">
                  {formatCurrency(invoice.total, currencySymbol)}
                </span>
              </div>
            </div>

          </div>

          {/* Signatures & Formal Stamp Area */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500 page-break-inside-avoid">
            <div className="border-t border-slate-300 pt-2">
              <p className="font-bold text-slate-800 text-[11px]">Entregado / Mecánico Responsable</p>
              <p className="text-slate-500">{invoice.workshop.name}</p>
              <p className="text-slate-400 mt-0.5">Firma y Sello</p>
            </div>

            <div className="border-t border-slate-300 pt-2">
              <p className="font-bold text-slate-800 text-[11px]">Recibido Conforme / Cliente</p>
              <p className="text-slate-500">{invoice.client.name || 'Firma Cliente'}</p>
              <p className="text-slate-400 mt-0.5">Aceptación de trabajo y repuestos</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
