export type BalanceStatus = 'high' | 'medium' | 'low';

export function parseBalance(balance: string | null): number {
  if (!balance) return 0;
  
  // Remove currency symbols, dots as thousand separators, and convert comma to dot
  const cleaned = balance
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

export function getBalanceStatus(balance: string | null): BalanceStatus {
  const value = parseBalance(balance);
  
  if (value >= 200) return 'high';
  if (value >= 100) return 'medium';
  return 'low';
}

export function formatBalance(balance: string | null): string {
  if (!balance) return 'R$ 0,00';
  
  const value = parseBalance(balance);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
