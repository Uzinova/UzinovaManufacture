export function calculateDiscountedPrice(price: number, discountRate?: number): number {
  if (!discountRate) return price;
  return price * (1 - discountRate / 100);
}

export function isDiscountActive(start?: string, end?: string): boolean {
  if (!start || !end) return false;
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  return now >= startDate && now <= endDate;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(price);
}

export function formatDate(date: string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function parseDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function generateSKU(category: string, id: string): string {
  const prefix = category.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).substring(0, 4).toUpperCase();
  const suffix = id.substring(0, 4).toUpperCase();
  return `${prefix}-${timestamp}-${suffix}`;
}
