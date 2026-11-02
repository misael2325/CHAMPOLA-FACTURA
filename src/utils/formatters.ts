/**
 * Utilitarios de formato para montos, monedas, fechas y cálculos de facturación.
 */

export function formatCurrency(amount: number, symbol: string = 'RD$'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const formatted = safeAmount.toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getFutureDateString(daysAhead: number = 15): string {
  const now = new Date();
  now.setDate(now.getDate() + daysAhead);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  applyItbis: boolean,
  itbisPercent: number,
  discountPercent: number = 0
) {
  const subtotal = items.reduce((sum, item) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    return sum + q * p;
  }, 0);

  const discountAmount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  
  const itbisAmount = applyItbis ? (subtotalAfterDiscount * (Number(itbisPercent) || 0)) / 100 : 0;
  const total = subtotalAfterDiscount + itbisAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    itbisAmount: Math.round(itbisAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
