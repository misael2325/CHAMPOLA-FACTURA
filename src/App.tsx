import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { HistoryView } from './components/HistoryView';
import { ClientsView } from './components/ClientsView';
import { WorkshopSettingsModal } from './components/WorkshopSettingsModal';
import { 
  Invoice, 
  WorkshopProfile, 
  ClientInfo, 
  InvoiceStatus 
} from './types/invoice';
import { 
  getStoredWorkshopProfile, 
  saveWorkshopProfile, 
  getStoredInvoices, 
  addInvoice, 
  updateInvoice, 
  deleteInvoice as removeStoredInvoice, 
  getStoredClients, 
  generateNextDocumentNumber,
  saveClientFromInvoice
} from './utils/storage';
import { downloadInvoicePDF } from './utils/pdfGenerator';
import { getTodayDateString, getFutureDateString } from './utils/formatters';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'editor' | 'preview' | 'history' | 'clients'>('editor');
  const [workshopProfile, setWorkshopProfile] = useState<WorkshopProfile>(getStoredWorkshopProfile);
  const [invoices, setInvoices] = useState<Invoice[]>(getStoredInvoices);
  const [clients, setClients] = useState<ClientInfo[]>(getStoredClients);
  
  // Active invoice being edited or previewed
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  
  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync data on load
  useEffect(() => {
    setWorkshopProfile(getStoredWorkshopProfile());
    setInvoices(getStoredInvoices());
    setClients(getStoredClients());
  }, []);

  // Update profile
  const handleSaveWorkshopProfile = (updated: WorkshopProfile) => {
    setWorkshopProfile(updated);
    saveWorkshopProfile(updated);
  };

  // Start fresh document
  const handleNewDocument = (customClient?: ClientInfo) => {
    const nextNumber = generateNextDocumentNumber('factura');
    const newDraft: Invoice = {
      id: `inv-${Date.now()}`,
      documentType: 'factura',
      number: nextNumber,
      date: getTodayDateString(),
      dueDate: getFutureDateString(15),
      status: 'pendiente',
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
      client: customClient || {
        name: '',
        rncOrId: '',
        phone: '',
        email: '',
        address: '',
      },
      vehicle: customClient?.vehicle || {
        make: '',
        model: '',
        year: '',
        plate: '',
        mileage: '',
        color: '',
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: 'Mano de Obra - Diagnóstico y Mantenimiento General',
          category: 'mano_obra',
          quantity: 1,
          unitPrice: 1500,
          total: 1500,
        },
      ],
      subtotal: 1500,
      discountPercent: 0,
      discountAmount: 0,
      applyItbis: workshopProfile.itbisEnabledDefault,
      itbisPercent: workshopProfile.defaultItbisPercent,
      itbisAmount: workshopProfile.itbisEnabledDefault
        ? (1500 * workshopProfile.defaultItbisPercent) / 100
        : 0,
      total: workshopProfile.itbisEnabledDefault
        ? 1500 + (1500 * workshopProfile.defaultItbisPercent) / 100
        : 1500,
      paymentMethod: 'efectivo',
      notes: '',
      warranty: workshopProfile.warrantyTerms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveInvoice(newDraft);
    setCurrentTab('editor');
  };

  // Save and open preview
  const handleSaveAndPreview = (invoice: Invoice, directPdf = false) => {
    // Save to storage
    const existing = invoices.find((inv) => inv.id === invoice.id);
    if (existing) {
      updateInvoice(invoice);
    } else {
      addInvoice(invoice);
    }

    // Refresh state
    setInvoices(getStoredInvoices());
    setClients(getStoredClients());
    setActiveInvoice(invoice);

    if (directPdf) {
      setCurrentTab('preview');
      setTimeout(() => {
        downloadInvoicePDF('invoice-document-sheet', invoice);
      }, 350);
    } else {
      setCurrentTab('preview');
    }
  };

  // Save only without switching to preview
  const handleSaveOnly = (invoice: Invoice) => {
    const existing = invoices.find((inv) => inv.id === invoice.id);
    if (existing) {
      updateInvoice(invoice);
    } else {
      addInvoice(invoice);
    }
    setInvoices(getStoredInvoices());
    setClients(getStoredClients());
    setActiveInvoice(invoice);
    alert(`Documento ${invoice.number} guardado con éxito en el historial.`);
  };

  // Convert Quote to Invoice
  const handleConvertToInvoice = (quote: Invoice) => {
    const nextInvoiceNum = generateNextDocumentNumber('factura');
    const convertedInvoice: Invoice = {
      ...quote,
      id: `inv-${Date.now()}`,
      documentType: 'factura',
      number: nextInvoiceNum,
      date: getTodayDateString(),
      dueDate: getFutureDateString(15),
      status: 'pendiente',
      notes: quote.notes ? `${quote.notes} (Generada a partir de Cotización ${quote.number})` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addInvoice(convertedInvoice);
    setInvoices(getStoredInvoices());
    setClients(getStoredClients());
    setActiveInvoice(convertedInvoice);
    setCurrentTab('preview');
  };

  // Duplicate an existing invoice/quote
  const handleDuplicateInvoice = (source: Invoice) => {
    const nextNum = generateNextDocumentNumber(source.documentType);
    const duplicated: Invoice = {
      ...source,
      id: `inv-${Date.now()}`,
      number: nextNum,
      date: getTodayDateString(),
      dueDate: getFutureDateString(15),
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveInvoice(duplicated);
    setCurrentTab('editor');
  };

  // Delete invoice
  const handleDeleteInvoice = (id: string) => {
    removeStoredInvoice(id);
    setInvoices(getStoredInvoices());
    if (activeInvoice && activeInvoice.id === id) {
      setActiveInvoice(null);
      setCurrentTab('history');
    }
  };

  // Update status (e.g. pagada / pendiente)
  const handleStatusChange = (id: string, newStatus: InvoiceStatus) => {
    const found = invoices.find((inv) => inv.id === id);
    if (found) {
      const updated = { ...found, status: newStatus };
      updateInvoice(updated);
      setInvoices(getStoredInvoices());
      if (activeInvoice && activeInvoice.id === id) {
        setActiveInvoice(updated);
      }
    }
  };

  // Pre-fill invoice for specific client
  const handleNewInvoiceForClient = (client: ClientInfo) => {
    handleNewDocument(client);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Header
        currentTab={currentTab === 'preview' ? 'editor' : currentTab}
        onSelectTab={(tab) => {
          if (tab === 'editor' && !activeInvoice) {
            handleNewDocument();
          } else {
            setCurrentTab(tab);
          }
        }}
        onNewDocument={() => handleNewDocument()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        workshopProfile={workshopProfile}
        totalInvoicesCount={invoices.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: Editor Form */}
        {currentTab === 'editor' && (
          <InvoiceForm
            key={activeInvoice ? activeInvoice.id : 'fresh-invoice'}
            initialInvoice={activeInvoice}
            workshopProfile={workshopProfile}
            onOpenWorkshopSettings={() => setIsSettingsOpen(true)}
            onSaveAndPreview={handleSaveAndPreview}
            onSaveOnly={handleSaveOnly}
          />
        )}

        {/* TAB 2: Preview Document Sheet */}
        {currentTab === 'preview' && activeInvoice && (
          <InvoicePreview
            invoice={activeInvoice}
            onBackToEdit={() => setCurrentTab('editor')}
            onConvertToInvoice={handleConvertToInvoice}
            onStatusChange={(newStatus) => handleStatusChange(activeInvoice.id, newStatus)}
          />
        )}

        {/* TAB 3: History & Consultas */}
        {currentTab === 'history' && (
          <HistoryView
            invoices={invoices}
            onSelectInvoice={(inv) => {
              setActiveInvoice(inv);
              setCurrentTab('preview');
            }}
            onEditInvoice={(inv) => {
              setActiveInvoice(inv);
              setCurrentTab('editor');
            }}
            onDuplicateInvoice={handleDuplicateInvoice}
            onConvertToInvoice={handleConvertToInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onStatusChange={handleStatusChange}
            onNewDocument={() => handleNewDocument()}
          />
        )}

        {/* TAB 4: Clients Directory */}
        {currentTab === 'clients' && (
          <ClientsView
            clients={clients}
            invoices={invoices}
            onNewInvoiceForClient={handleNewInvoiceForClient}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">AUTODOC Taller</span>
            <span aria-hidden="true">·</span>
            <span>Facturación Automotriz & Presupuestos</span>
          </div>
          <div className="text-slate-400 text-center sm:text-right">
            Emisor activo: <strong className="text-slate-200">{workshopProfile.name}</strong> ({workshopProfile.rnc || 'Sin RNC'})
          </div>
        </div>
      </footer>

      {/* Workshop Profile Settings Modal */}
      <WorkshopSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={workshopProfile}
        onSaveProfile={handleSaveWorkshopProfile}
      />

    </div>
  );
}
