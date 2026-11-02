export type DocumentType = 'factura' | 'cotizacion';

export type InvoiceStatus = 'pagada' | 'pendiente' | 'cancelada' | 'borrador';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque' | 'credito';

export interface WorkshopProfile {
  id: string;
  name: string;
  type: 'taller' | 'persona_fisica';
  ownerName: string;
  rnc: string; // RNC o Cédula / DNI
  phone: string;
  email: string;
  address: string;
  city: string;
  slogan: string;
  defaultItbisPercent: number;
  itbisEnabledDefault: boolean;
  currency: string;
  currencySymbol: string;
  warrantyTerms: string;
  bankAccountDetails: string;
  invoicePrefix: string;
  quotePrefix: string;
  nextInvoiceNumber: number;
  nextQuoteNumber: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'mano_obra' | 'repuesto' | 'fluido' | 'diagnostico' | 'otro';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface VehicleInfo {
  make: string;      // ej. Toyota
  model: string;     // ej. Corolla
  year: string;      // ej. 2018
  plate: string;     // ej. A-948210
  mileage: string;   // ej. 85,400 km
  vinOrChassis?: string;
  color?: string;
}

export interface ClientInfo {
  id?: string;
  name: string;
  rncOrId: string;
  phone: string;
  email: string;
  address: string;
  vehicle?: VehicleInfo;
}

export interface Invoice {
  id: string;
  documentType: DocumentType; // factura | cotizacion
  number: string;             // ej. FAC-0001 o COT-0001
  date: string;               // YYYY-MM-DD
  dueDate?: string;           // YYYY-MM-DD (para cotizaciones o crédito)
  status: InvoiceStatus;
  
  // Emisor snapshot
  workshop: {
    name: string;
    type: 'taller' | 'persona_fisica';
    ownerName: string;
    rnc: string;
    phone: string;
    email: string;
    address: string;
    slogan?: string;
    bankAccountDetails?: string;
  };

  // Receptor
  client: ClientInfo;

  // Vehículo involucrado
  vehicle: VehicleInfo;

  // Items
  items: InvoiceItem[];

  // Totales
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  applyItbis: boolean;
  itbisPercent: number;
  itbisAmount: number;
  total: number;

  // Pago y notas
  paymentMethod: PaymentMethod;
  notes?: string;
  warranty?: string;

  createdAt: string;
  updatedAt: string;
}
