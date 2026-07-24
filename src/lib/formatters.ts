/**
 * Format currency in Egyptian Pounds (EGP) in Arabic locale
 * Example: 1,250.00 ج.م
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0.00 ج.م';
  }
  
  const formattedNumber = new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formattedNumber} ج.م`;
}

/**
 * Alternative format with standard western digits if preferred
 */
export function formatCurrencyEnDigits(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0.00 ج.م';
  }
  
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formattedNumber} ج.م`;
}

/**
 * Format date into clean Arabic string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format short date (YYYY-MM-DD)
 */
export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Auto generate codes with prefix and random/counter suffix
 */
export function generateCode(prefix: 'PRD' | 'CST' | 'INV', count: number): string {
  const nextNum = (count + 1).toString().padStart(3, '0');
  if (prefix === 'INV') {
    const year = new Date().getFullYear();
    return `INV-${year}-${nextNum}`;
  }
  return `${prefix}-${nextNum}`;
}
