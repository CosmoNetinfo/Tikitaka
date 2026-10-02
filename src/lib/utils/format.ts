/**
 * Formats cents into Italian currency format: e.g. "15,00 €"
 */
export function formatCurrency(cents: number): string {
  const euros = (cents / 100).toFixed(2).replace('.', ',');
  return `${euros} €`;
}

/**
 * Formats a date into Italian format with capitalized weekday and lowercase month.
 * e.g., "Martedì 6 ottobre"
 */
export function formatDateItalian(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const weekday = d.toLocaleDateString('it-IT', { weekday: 'long' });
  const day = d.getDate();
  const month = d.toLocaleDateString('it-IT', { month: 'long' }).toLowerCase();
  
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday} ${day} ${month}`;
}
