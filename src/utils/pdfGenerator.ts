import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '../types/invoice';

/**
 * Genera y descarga directamente un documento PDF nítido de la factura o cotización
 * a partir del elemento HTML renderizado.
 */
export async function downloadInvoicePDF(
  elementId: string,
  invoice: Invoice,
  onProgress?: (status: boolean) => void
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return false;
  }

  try {
    if (onProgress) onProgress(true);

    // Ajustes temporales para captura nítida
    const originalShadow = element.style.boxShadow;
    element.style.boxShadow = 'none';

    const canvas = await html2canvas(element, {
      scale: 2, // 2x para resolución retina ultra nítida
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    element.style.boxShadow = originalShadow;

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Proporciones
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    const printWidth = pdfWidth;
    const printHeight = pdfWidth / ratio;

    if (printHeight <= pdfHeight) {
      // Entra en 1 página
      pdf.addImage(imgData, 'PNG', 0, 0, printWidth, printHeight);
    } else {
      // Manejar páginas múltiples si la factura tiene muchos ítems
      let heightLeft = printHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, printWidth, printHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - printHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, printWidth, printHeight);
        heightLeft -= pdfHeight;
      }
    }

    // Nombre de archivo descriptivo y limpio
    const cleanClientName = (invoice.client.name || 'Cliente')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 25);
    const docTypeLabel = invoice.documentType === 'factura' ? 'Factura' : 'Cotizacion';
    const fileName = `${docTypeLabel}_${invoice.number}_${cleanClientName}.pdf`;

    pdf.save(fileName);
    if (onProgress) onProgress(false);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (onProgress) onProgress(false);

    // Fallback: Si html2canvas fallara, abrir la ventana de impresión nativa
    window.print();
    return false;
  }
}

/**
 * Abre el diálogo de impresión nativo del navegador optimizado con CSS
 */
export function printInvoice(): void {
  window.print();
}
