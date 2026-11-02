import { WorkshopProfile, Invoice, ClientInfo, InvoiceItem, DocumentType } from '../types/invoice';
import { getTodayDateString, getFutureDateString } from './formatters';

const STORAGE_KEYS = {
  WORKSHOP_PROFILE: 'autodoc_workshop_profile_v1',
  INVOICES: 'autodoc_invoices_v1',
  CLIENTS: 'autodoc_clients_v1',
};

export const DEFAULT_WORKSHOP_PROFILE: WorkshopProfile = {
  id: 'default-profile',
  name: 'Taller Mecánico AutoServicio del Este',
  type: 'taller',
  ownerName: 'Ing. Carlos Mendoza / Misael De Los Santos',
  rnc: '1-32-45892-1',
  phone: '(809) 555-0192',
  email: 'contacto@tallermecanicoeste.com',
  address: 'Av. Las Américas No. 142, Ensanche Ozama',
  city: 'Santo Domingo, R.D.',
  slogan: 'Especialistas en Mecánica General, Inyección Electrónica y Frenos',
  defaultItbisPercent: 18,
  itbisEnabledDefault: true,
  currency: 'DOP',
  currencySymbol: 'RD$',
  warrantyTerms: 'Garantía de 30 días o 1,500 km en mano de obra. Todo repuesto sustituido debe ser inspeccionado por el cliente.',
  bankAccountDetails: 'Banco BHD: Cta. Corriente No. 248910-001 | Banreservas: Cta. Ahorros No. 960142-332',
  invoicePrefix: 'FAC-',
  quotePrefix: 'COT-',
  nextInvoiceNumber: 104,
  nextQuoteNumber: 52,
};

// Catálogo de ítems mecánicos frecuentes para autocompletar rápidamente
export const COMMON_MECHANIC_ITEMS: Omit<InvoiceItem, 'id' | 'total'>[] = [
  {
    description: 'Cambio de Aceite de Motor 100% Sintético 5W-30 + Filtro',
    category: 'fluido',
    quantity: 1,
    unitPrice: 2850,
  },
  {
    description: 'Mano de Obra - Diagnóstico Computarizado con Escáner OBD2',
    category: 'diagnostico',
    quantity: 1,
    unitPrice: 1200,
  },
  {
    description: 'Juego de Pastillas de Freno Delanteras Cerámicas',
    category: 'repuesto',
    quantity: 1,
    unitPrice: 2400,
  },
  {
    description: 'Mano de Obra - Cambio de Pastillas y Limpieza de Calipers',
    category: 'mano_obra',
    quantity: 1,
    unitPrice: 1500,
  },
  {
    description: 'Rectificación de Discos de Frenos Delanteros (Par)',
    category: 'mano_obra',
    quantity: 1,
    unitPrice: 1600,
  },
  {
    description: 'Alineación Computarizada y Balanceo de 4 Ruedas',
    category: 'mano_obra',
    quantity: 1,
    unitPrice: 1800,
  },
  {
    description: 'Limpieza y Calibración de Inyectores por Ultrasonido',
    category: 'mano_obra',
    quantity: 4,
    unitPrice: 600,
  },
  {
    description: 'Batería Automotriz 12V 75Ah Libre de Mantenimiento',
    category: 'repuesto',
    quantity: 1,
    unitPrice: 5600,
  },
  {
    description: 'Reemplazo de Amortiguadores Delanteros (Mano de Obra)',
    category: 'mano_obra',
    quantity: 2,
    unitPrice: 1400,
  },
  {
    description: 'Líquido de Frenos DOT 4 Sintético (Envase 500ml)',
    category: 'fluido',
    quantity: 2,
    unitPrice: 450,
  },
  {
    description: 'Filtro de Aire de Motor OEM',
    category: 'repuesto',
    quantity: 1,
    unitPrice: 750,
  },
  {
    description: 'Mantenimiento Mayor Preventivo (Bujías, Fluidos, Filtros)',
    category: 'mano_obra',
    quantity: 1,
    unitPrice: 4500,
  },
];

// Semilla inicial de facturas y cotizaciones para demostración inmediata
const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv-seed-1',
    documentType: 'factura',
    number: 'FAC-0102',
    date: getTodayDateString(),
    dueDate: getFutureDateString(15),
    status: 'pagada',
    workshop: {
      name: DEFAULT_WORKSHOP_PROFILE.name,
      type: DEFAULT_WORKSHOP_PROFILE.type,
      ownerName: DEFAULT_WORKSHOP_PROFILE.ownerName,
      rnc: DEFAULT_WORKSHOP_PROFILE.rnc,
      phone: DEFAULT_WORKSHOP_PROFILE.phone,
      email: DEFAULT_WORKSHOP_PROFILE.email,
      address: DEFAULT_WORKSHOP_PROFILE.address,
      slogan: DEFAULT_WORKSHOP_PROFILE.slogan,
    },
    client: {
      name: 'Alejandro Ramos Bautista',
      rncOrId: '001-1829401-8',
      phone: '(829) 712-4490',
      email: 'aramos.transporte@gmail.com',
      address: 'Calle San Antón #44, Gazcue, D.N.',
    },
    vehicle: {
      make: 'Honda',
      model: 'CR-V EX-L',
      year: '2020',
      plate: 'G-592184',
      mileage: '68,200 km',
      color: 'Gris Plata',
    },
    items: [
      {
        id: 'item-1',
        description: 'Cambio de Aceite de Motor 100% Sintético 5W-30 + Filtro',
        category: 'fluido',
        quantity: 1,
        unitPrice: 2850,
        total: 2850,
      },
      {
        id: 'item-2',
        description: 'Juego de Pastillas de Freno Delanteras Cerámicas',
        category: 'repuesto',
        quantity: 1,
        unitPrice: 2400,
        total: 2400,
      },
      {
        id: 'item-3',
        description: 'Mano de Obra - Instalación de Pastillas y Purga de Frenos',
        category: 'mano_obra',
        quantity: 1,
        unitPrice: 1500,
        total: 1500,
      },
    ],
    subtotal: 6750,
    discountPercent: 0,
    discountAmount: 0,
    applyItbis: true,
    itbisPercent: 18,
    itbisAmount: 1215,
    total: 7965,
    paymentMethod: 'transferencia',
    notes: 'Vehículo entregado y probado en ruta. Frenos asentados correctamente.',
    warranty: DEFAULT_WORKSHOP_PROFILE.warrantyTerms,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-seed-2',
    documentType: 'cotizacion',
    number: 'COT-0051',
    date: getTodayDateString(),
    dueDate: getFutureDateString(15),
    status: 'pendiente',
    workshop: {
      name: DEFAULT_WORKSHOP_PROFILE.name,
      type: DEFAULT_WORKSHOP_PROFILE.type,
      ownerName: DEFAULT_WORKSHOP_PROFILE.ownerName,
      rnc: DEFAULT_WORKSHOP_PROFILE.rnc,
      phone: DEFAULT_WORKSHOP_PROFILE.phone,
      email: DEFAULT_WORKSHOP_PROFILE.email,
      address: DEFAULT_WORKSHOP_PROFILE.address,
      slogan: DEFAULT_WORKSHOP_PROFILE.slogan,
    },
    client: {
      name: 'Distribuidora Automotriz Gómez SRL',
      rncOrId: '1-31-90284-9',
      phone: '(809) 472-8812',
      email: 'compras@distribuidoragomez.com',
      address: 'Zona Industrial de Herrera, Santo Domingo Oeste',
    },
    vehicle: {
      make: 'Toyota',
      model: 'Hilux 4x4 Diesel',
      year: '2019',
      plate: 'L-310892',
      mileage: '112,450 km',
      color: 'Blanco',
    },
    items: [
      {
        id: 'item-c1',
        description: 'Diagnóstico Computarizado de Sistema de Inyección Common Rail',
        category: 'diagnostico',
        quantity: 1,
        unitPrice: 1500,
        total: 1500,
      },
      {
        id: 'item-c2',
        description: 'Limpieza y Calibración de 4 Inyectores Diesel',
        category: 'mano_obra',
        quantity: 4,
        unitPrice: 1200,
        total: 4800,
      },
      {
        id: 'item-c3',
        description: 'Filtro de Combustible Original Toyota Denso',
        category: 'repuesto',
        quantity: 1,
        unitPrice: 1950,
        total: 1950,
      },
    ],
    subtotal: 8250,
    discountPercent: 5,
    discountAmount: 412.5,
    applyItbis: true,
    itbisPercent: 18,
    itbisAmount: 1410.75,
    total: 9248.25,
    paymentMethod: 'efectivo',
    notes: 'Cotización válida por 15 días calendario. Sujeto a disponibilidad de repuestos originales.',
    warranty: DEFAULT_WORKSHOP_PROFILE.warrantyTerms,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Profile storage
export function getStoredWorkshopProfile(): WorkshopProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKSHOP_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WORKSHOP_PROFILE, JSON.stringify(DEFAULT_WORKSHOP_PROFILE));
      return DEFAULT_WORKSHOP_PROFILE;
    }
    return { ...DEFAULT_WORKSHOP_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WORKSHOP_PROFILE;
  }
}

export function saveWorkshopProfile(profile: WorkshopProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKSHOP_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving workshop profile:', e);
  }
}

// Invoices storage
export function getStoredInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(SEED_INVOICES));
      return SEED_INVOICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_INVOICES;
  } catch {
    return SEED_INVOICES;
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.error('Error saving invoices:', e);
  }
}

export function addInvoice(invoice: Invoice): void {
  const current = getStoredInvoices();
  // Colocar la más nueva arriba
  const updated = [invoice, ...current];
  saveInvoices(updated);

  // Incrementar el correlativo en el perfil si correspondía
  const profile = getStoredWorkshopProfile();
  if (invoice.documentType === 'factura') {
    profile.nextInvoiceNumber = Math.max(profile.nextInvoiceNumber + 1, current.length + 1);
  } else {
    profile.nextQuoteNumber = Math.max(profile.nextQuoteNumber + 1, current.length + 1);
  }
  saveWorkshopProfile(profile);

  // Actualizar la lista de clientes automáticamente
  if (invoice.client && invoice.client.name) {
    saveClientFromInvoice(invoice.client, invoice.vehicle);
  }
}

export function updateInvoice(updatedInvoice: Invoice): void {
  const current = getStoredInvoices();
  const index = current.findIndex((inv) => inv.id === updatedInvoice.id);
  if (index !== -1) {
    current[index] = { ...updatedInvoice, updatedAt: new Date().toISOString() };
    saveInvoices([...current]);
  } else {
    addInvoice(updatedInvoice);
  }
}

export function deleteInvoice(id: string): void {
  const current = getStoredInvoices();
  const filtered = current.filter((inv) => inv.id !== id);
  saveInvoices(filtered);
}

// Next number helper
export function generateNextDocumentNumber(type: DocumentType): string {
  const profile = getStoredWorkshopProfile();
  const invoices = getStoredInvoices().filter((inv) => inv.documentType === type);
  
  if (type === 'factura') {
    const nextNum = Math.max(profile.nextInvoiceNumber || 1, invoices.length + 101);
    const prefix = profile.invoicePrefix || 'FAC-';
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  } else {
    const nextNum = Math.max(profile.nextQuoteNumber || 1, invoices.length + 51);
    const prefix = profile.quotePrefix || 'COT-';
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  }
}

// Clients storage & directory
export function getStoredClients(): ClientInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) {
      const initialClients: ClientInfo[] = [
        {
          id: 'c-1',
          name: 'Alejandro Ramos Bautista',
          rncOrId: '001-1829401-8',
          phone: '(829) 712-4490',
          email: 'aramos.transporte@gmail.com',
          address: 'Calle San Antón #44, Gazcue, D.N.',
          vehicle: {
            make: 'Honda',
            model: 'CR-V EX-L',
            year: '2020',
            plate: 'G-592184',
            mileage: '68,200 km',
            color: 'Gris Plata',
          },
        },
        {
          id: 'c-2',
          name: 'Distribuidora Automotriz Gómez SRL',
          rncOrId: '1-31-90284-9',
          phone: '(809) 472-8812',
          email: 'compras@distribuidoragomez.com',
          address: 'Zona Industrial de Herrera, Santo Domingo Oeste',
          vehicle: {
            make: 'Toyota',
            model: 'Hilux 4x4 Diesel',
            year: '2019',
            plate: 'L-310892',
            mileage: '112,450 km',
            color: 'Blanco',
          },
        },
        {
          id: 'c-3',
          name: 'Lic. Patricia De León',
          rncOrId: '402-2391024-5',
          phone: '(809) 330-1928',
          email: 'pdeleons@hotmail.com',
          address: 'Av. Winston Churchill, Bella Vista',
          vehicle: {
            make: 'Hyundai',
            model: 'Tucson 2.0',
            year: '2021',
            plate: 'G-614092',
            mileage: '42,150 km',
            color: 'Negro',
          },
        },
      ];
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(initialClients));
      return initialClients;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveClientFromInvoice(client: ClientInfo, vehicle?: any): void {
  try {
    const clients = getStoredClients();
    const existingIndex = clients.findIndex(
      (c) => c.name.trim().toLowerCase() === client.name.trim().toLowerCase()
    );

    const clientWithVehicle: ClientInfo = {
      ...client,
      vehicle: vehicle || client.vehicle,
      id: client.id || `c-${Date.now()}`,
    };

    if (existingIndex >= 0) {
      clients[existingIndex] = { ...clients[existingIndex], ...clientWithVehicle };
    } else {
      clients.push(clientWithVehicle);
    }
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error('Error saving client:', e);
  }
}
