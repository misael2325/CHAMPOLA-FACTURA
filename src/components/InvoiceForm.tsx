import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileCheck, 
  Plus, 
  Trash2, 
  Sparkles, 
  Car, 
  User, 
  Building2, 
  Calendar, 
  DollarSign, 
  Percent, 
  Eye, 
  Save, 
  Download,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  Invoice, 
  DocumentType, 
  InvoiceItem, 
  WorkshopProfile, 
  ClientInfo, 
  VehicleInfo 
} from '../types/invoice';
import { 
  getTodayDateString, 
  getFutureDateString, 
  calculateTotals, 
  formatCurrency 
} from '../utils/formatters';
import { generateNextDocumentNumber, getStoredClients } from '../utils/storage';
import { QuickItemPresetsModal } from './QuickItemPresetsModal';

interface InvoiceFormProps {
  initialInvoice?: Invoice | null;
  workshopProfile: WorkshopProfile;
  onOpenWorkshopSettings: () => void;
  onSaveAndPreview: (invoice: Invoice, directPdf?: boolean) => void;
  onSaveOnly: (invoice: Invoice) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialInvoice,
  workshopProfile,
  onOpenWorkshopSettings,
  onSaveAndPreview,
  onSaveOnly,
}) => {
  // Document Type: Factura vs Cotización
  const [docType, setDocType] = useState<DocumentType>(initialInvoice?.documentType || 'factura');
  const [docNumber, setDocNumber] = useState<string>(
    initialInvoice?.number || generateNextDocumentNumber('factura')
  );
  const [docDate, setDocDate] = useState<string>(initialInvoice?.date || getTodayDateString());
  const [dueDate, setDueDate] = useState<string>(
    initialInvoice?.dueDate || getFutureDateString(15)
  );
  const [status, setStatus] = useState<Invoice['status']>(initialInvoice?.status || 'pendiente');

  // Client Info
  const [clientName, setClientName] = useState(initialInvoice?.client.name || '');
  const [clientRnc, setClientRnc] = useState(initialInvoice?.client.rncOrId || '');
  const [clientPhone, setClientPhone] = useState(initialInvoice?.client.phone || '');
  const [clientEmail, setClientEmail] = useState(initialInvoice?.client.email || '');
  const [clientAddress, setClientAddress] = useState(initialInvoice?.client.address || '');

  // Vehicle Info
  const [vehicleMake, setVehicleMake] = useState(initialInvoice?.vehicle.make || '');
  const [vehicleModel, setVehicleModel] = useState(initialInvoice?.vehicle.model || '');
  const [vehicleYear, setVehicleYear] = useState(initialInvoice?.vehicle.year || '');
  const [vehiclePlate, setVehiclePlate] = useState(initialInvoice?.vehicle.plate || '');
  const [vehicleMileage, setVehicleMileage] = useState(initialInvoice?.vehicle.mileage || '');
  const [vehicleColor, setVehicleColor] = useState(initialInvoice?.vehicle.color || '');

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>(
    initialInvoice?.items && initialInvoice.items.length > 0
      ? initialInvoice.items
      : [
          {
            id: 'item-init-1',
            description: 'Mano de Obra - Diagnóstico y Mantenimiento General',
            category: 'mano_obra',
            quantity: 1,
            unitPrice: 1500,
            total: 1500,
          },
        ]
  );

  // Financials & ITBIS
  const [applyItbis, setApplyItbis] = useState<boolean>(
    initialInvoice != null ? initialInvoice.applyItbis : workshopProfile.itbisEnabledDefault
  );
  const [itbisPercent, setItbisPercent] = useState<number>(
    initialInvoice?.itbisPercent ?? workshopProfile.defaultItbisPercent
  );
  const [discountPercent, setDiscountPercent] = useState<number>(
    initialInvoice?.discountPercent ?? 0
  );
  const [paymentMethod, setPaymentMethod] = useState<Invoice['paymentMethod']>(
    initialInvoice?.paymentMethod || 'efectivo'
  );
  const [notes, setNotes] = useState(initialInvoice?.notes || '');
  const [warranty, setWarranty] = useState(
    initialInvoice?.warranty || workshopProfile.warrantyTerms
  );

  // Quick Presets modal
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [savedClients, setSavedClients] = useState<ClientInfo[]>([]);

  // Load registered clients for autocomplete
  useEffect(() => {
    setSavedClients(getStoredClients());
  }, []);

  // When switching between Factura and Cotización, recalculate number if not editing existing
  const handleToggleDocType = (newType: DocumentType) => {
    setDocType(newType);
    if (!initialInvoice) {
      setDocNumber(generateNextDocumentNumber(newType));
    }
  };

  // Recalculate item total when quantity or price changes
  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) || 0 : Number(current.quantity) || 0;
      const p = field === 'unitPrice' ? Number(value) || 0 : Number(current.unitPrice) || 0;
      current.total = Math.round(q * p * 100) / 100;
    }

    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = (
    preset?: Omit<InvoiceItem, 'id' | 'total'>
  ) => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      description: preset?.description || '',
      category: preset?.category || 'mano_obra',
      quantity: preset?.quantity || 1,
      unitPrice: preset?.unitPrice || 0,
      total: preset ? preset.quantity * preset.unitPrice : 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      // Dejar al menos 1 fila en blanco
      setItems([
        {
          id: `item-${Date.now()}`,
          description: '',
          category: 'mano_obra',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ]);
      return;
    }
    const filtered = items.filter((_, i) => i !== index);
    setItems(filtered);
  };

  // Autocomplete client selection
  const handleSelectClient = (client: ClientInfo) => {
    setClientName(client.name);
    setClientRnc(client.rncOrId || '');
    setClientPhone(client.phone || '');
    setClientEmail(client.email || '');
    setClientAddress(client.address || '');

    if (client.vehicle) {
      setVehicleMake(client.vehicle.make || '');
      setVehicleModel(client.vehicle.model || '');
      setVehicleYear(client.vehicle.year || '');
      setVehiclePlate(client.vehicle.plate || '');
      setVehicleMileage(client.vehicle.mileage || '');
      setVehicleColor(client.vehicle.color || '');
    }
    setShowClientSuggestions(false);
  };

  // Totals
  const { subtotal, discountAmount, itbisAmount, total } = calculateTotals(
    items,
    applyItbis,
    itbisPercent,
    discountPercent
  );

  // Build the complete invoice object
  const buildCurrentInvoice = (): Invoice => {
    return {
      id: initialInvoice?.id || `inv-${Date.now()}`,
      documentType: docType,
      number: docNumber.trim() || generateNextDocumentNumber(docType),
      date: docDate,
      dueDate: dueDate || undefined,
      status: status,
      workshop: {
        name: workshopProfile.name,
        type: workshopProfile.type,
        ownerName: workshopProfile.ownerName,
        rnc: workshopProfile.rnc,
        phone: workshopProfile.phone,
        email: workshopProfile.email,
        address: workshopProfile.address,
        slogan: workshopProfile.slogan,
      },
      client: {
        name: clientName.trim(),
        rncOrId: clientRnc.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        address: clientAddress.trim(),
      },
      vehicle: {
        make: vehicleMake.trim(),
        model: vehicleModel.trim(),
        year: vehicleYear.trim(),
        plate: vehiclePlate.trim().toUpperCase(),
        mileage: vehicleMileage.trim(),
        color: vehicleColor.trim(),
      },
      items: items.map((it) => ({
        ...it,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
      subtotal,
      discountPercent: Number(discountPercent) || 0,
      discountAmount,
      applyItbis,
      itbisPercent: Number(itbisPercent) || 0,
      itbisAmount,
      total,
      paymentMethod,
      notes: notes.trim() || undefined,
      warranty: warranty.trim() || undefined,
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleFormSubmit = (e: React.FormEvent, directPdf = false) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Por favor ingrese el nombre del cliente para registrar la factura/cotización.');
      return;
    }
    const current = buildCurrentInvoice();
    onSaveAndPreview(current, directPdf);
  };

  const filteredClientSuggestions = savedClients.filter(
    (c) =>
      clientName.trim() &&
      c.name.toLowerCase().includes(clientName.toLowerCase()) &&
      c.name.toLowerCase() !== clientName.toLowerCase()
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Switch FACTURA / COTIZACIÓN and Workshop Profile summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Document Type Switcher */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Tipo de Documento a Generar
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleToggleDocType('factura')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all ${
                  docType === 'factura'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>FACTURA</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleDocType('cotizacion')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all ${
                  docType === 'cotizacion'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>COTIZACIÓN (PRESUPUESTO)</span>
              </button>
            </div>
          </div>

          {/* Emisor / Workshop Quick Overview with Edit Action */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <div className="p-2 bg-slate-900 text-white rounded-md">
              {workshopProfile.type === 'taller' ? (
                <Building2 className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 truncate max-w-[200px]">
                  {workshopProfile.name}
                </span>
                <span className="text-[10px] text-slate-500 bg-slate-200 px-1 py-0.2 rounded font-medium">
                  {workshopProfile.type === 'taller' ? 'Taller' : 'Persona Física'}
                </span>
              </div>
              <p className="text-slate-500 font-mono text-[11px]">
                RNC: {workshopProfile.rnc || 'No registrado'}
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenWorkshopSettings}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline ml-2 whitespace-nowrap"
            >
              Cambiar Emisor
            </button>
          </div>

        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={(e) => handleFormSubmit(e, false)} className="space-y-6">
        
        {/* Document Metadata (Number, Dates, Status) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Número de {docType === 'factura' ? 'Factura' : 'Cotización'} *
              </label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder={docType === 'factura' ? 'FAC-0001' : 'COT-0001'}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-900 bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Fecha de Emisión *</span>
              </label>
              <input
                type="date"
                required
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{docType === 'factura' ? 'Fecha de Vencimiento' : 'Válida Hasta'}</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estado del Documento
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Invoice['status'])}
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white text-slate-800"
              >
                <option value="pagada">Pagada</option>
                <option value="pendiente">Pendiente</option>
                <option value="borrador">Borrador</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

          </div>
        </div>

        {/* Client & Vehicle Blocks (2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CLIENT DATA */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Datos del Cliente</h3>
              </div>
              <span className="text-[11px] text-slate-400">Receptor de la factura</span>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Autocomplete Name Field */}
              <div className="relative">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Cliente o Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    setShowClientSuggestions(true);
                  }}
                  onFocus={() => setShowClientSuggestions(true)}
                  placeholder="Ej. Ing. Alejandro Ramos / Distribuidora Gómez"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium text-slate-900"
                />

                {/* Autocomplete Dropdown */}
                {showClientSuggestions && filteredClientSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                      Clientes Registrados en Historial:
                    </div>
                    {filteredClientSuggestions.map((client, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{client.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {client.vehicle ? `${client.vehicle.make} ${client.vehicle.model} (${client.vehicle.plate})` : client.phone}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-amber-700">Autocompletar</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    RNC / Cédula / DNI
                  </label>
                  <input
                    type="text"
                    value={clientRnc}
                    onChange={(e) => setClientRnc(e.target.value)}
                    placeholder="001-1829401-8"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(829) 712-4490"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Calle, Sector, Ciudad"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* VEHICLE DATA */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                  <Car className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Datos del Vehículo</h3>
              </div>
              <span className="text-[11px] text-slate-400">Identificación automotriz</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Marca del Vehículo
                  </label>
                  <input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="Ej. Toyota, Honda, Ford"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Ej. Corolla, CR-V, F-150"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Año
                  </label>
                  <input
                    type="text"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    placeholder="2019"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Placa / Matrícula
                  </label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="G-592184"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kilometraje
                  </label>
                  <input
                    type="text"
                    value={vehicleMileage}
                    onChange={(e) => setVehicleMileage(e.target.value)}
                    placeholder="68,200 km"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Color / Detalles del Vehículo
                </label>
                <input
                  type="text"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  placeholder="Ej. Gris Plata, 4 Puertas, Transmisión Automática"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          </div>

        </div>

        {/* ITEMS & SERVICES SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Líneas de Servicios Mecánicos & Repuestos
              </h3>
              <p className="text-[11px] text-slate-500">
                Especifique la cantidad, el concepto y el precio unitario. El total se calcula automáticamente.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPresetsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Catálogo Rápido</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddItem()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Fila</span>
              </button>
            </div>
          </div>

          {/* Items Table Form */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="pb-2 pl-1 w-10 text-center">#</th>
                  <th className="pb-2 px-2">Descripción del Producto o Servicio</th>
                  <th className="pb-2 px-2 w-32">Categoría</th>
                  <th className="pb-2 px-2 w-20 text-center">Cant.</th>
                  <th className="pb-2 px-2 w-32 text-right">Precio Unitario</th>
                  <th className="pb-2 px-2 w-32 text-right">Total</th>
                  <th className="pb-2 pr-1 w-12 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2 pl-1 text-center font-mono text-slate-400">
                      {index + 1}
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Ej. Cambio de Aceite Sintético / Pastillas de Freno"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-900"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <select
                        value={item.category}
                        onChange={(e) =>
                          handleItemChange(index, 'category', e.target.value as InvoiceItem['category'])
                        }
                        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-700"
                      >
                        <option value="mano_obra">Mano de Obra</option>
                        <option value="repuesto">Repuesto</option>
                        <option value="fluido">Fluido/Aceite</option>
                        <option value="diagnostico">Diagnóstico</option>
                        <option value="otro">Otro</option>
                      </select>
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-center font-mono border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-right font-mono border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 font-semibold"
                      />
                    </td>

                    <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.total, workshopProfile.currencySymbol)}
                    </td>

                    <td className="py-2 pr-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        title="Eliminar fila"
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={() => handleAddItem()}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir otra línea</span>
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION: ITBIS TOGGLE, DISCOUNT, PAYMENT & TOTALS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Notes, Payment & ITBIS Settings */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Payment Method & Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Condiciones de Pago & Notas
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as Invoice['paymentMethod'])
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="tarjeta">Tarjeta de Débito / Crédito</option>
                    <option value="cheque">Cheque</option>
                    <option value="credito">Crédito del Taller</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Descuento General (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observaciones Mecánicas / Notas para el Cliente
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Se recomienda cambio de amortiguadores traseros en 5,000 km. Prueba de ruta realizada con éxito."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Términos de Garantía
                </label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="Garantía de 30 días o 1,500 km en mano de obra..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-700"
                />
              </div>
            </div>

          </div>

          {/* Right Column: ITBIS Checkbox and Totals Summary */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
            
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Resumen de Liquidación
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
                </span>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Subtotal Bruto:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(subtotal, workshopProfile.currencySymbol)}
                </span>
              </div>

              {/* Descuento */}
              {discountPercent > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-700">
                  <span>Descuento ({discountPercent}%):</span>
                  <span className="font-mono font-bold">
                    -{formatCurrency(discountAmount, workshopProfile.currencySymbol)}
                  </span>
                </div>
              )}

              {/* ITBIS Toggle Box (Crucial user request!) */}
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={applyItbis}
                      onChange={(e) => setApplyItbis(e.target.checked)}
                      className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-900">
                      Habilitar ITBIS / Impuestos
                    </span>
                  </label>

                  {applyItbis && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={itbisPercent}
                        onChange={(e) => setItbisPercent(parseFloat(e.target.value) || 0)}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono font-bold text-center border border-slate-300 rounded bg-white"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-amber-200/40">
                  <span className="text-[11px] text-slate-600">
                    {applyItbis ? `ITBIS Liquidado (${itbisPercent}%):` : 'ITBIS no aplicado (Exento):'}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {applyItbis
                      ? formatCurrency(itbisAmount, workshopProfile.currencySymbol)
                      : formatCurrency(0, workshopProfile.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* TOTAL A PAGAR */}
              <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
                  Total a Pagar:
                </span>
                <span className="font-mono text-xl font-extrabold text-slate-900">
                  {formatCurrency(total, workshopProfile.currencySymbol)}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-all active:scale-[0.98]"
              >
                <Eye className="w-4 h-4 text-slate-950" />
                <span>Guardar y Ver Vista Previa / Imprimir</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={(e) => handleFormSubmit(e, true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>PDF Directo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!clientName.trim()) {
                      alert('Por favor ingrese el nombre del cliente antes de guardar.');
                      return;
                    }
                    const inv = buildCurrentInvoice();
                    onSaveOnly(inv);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-slate-600" />
                  <span>Solo Guardar</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </form>

      {/* Quick item presets modal */}
      <QuickItemPresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        currencySymbol={workshopProfile.currencySymbol}
        onSelectItem={(item) => handleAddItem(item)}
      />

    </div>
  );
};
