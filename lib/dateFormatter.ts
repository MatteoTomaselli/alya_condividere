/**
 * Formatta una data nel formato gg/mm/aaaa
 * Accetta sia stringhe che oggetti Date
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return '';

  let dateObj: Date;

  if (typeof date === 'string') {
    // Se è una stringa in formato YYYY-MM-DD (come da input type="date")
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    // Se è una stringa di data testuale italiana (come "11 Aprile 2026")
    if (date.includes('Gennaio') || date.includes('Febbraio') || date.includes('Marzo') || 
        date.includes('Aprile') || date.includes('Maggio') || date.includes('Giugno') ||
        date.includes('Luglio') || date.includes('Agosto') || date.includes('Settembre') ||
        date.includes('Ottobre') || date.includes('Novembre') || date.includes('Dicembre')) {
      dateObj = new Date(date);
    } else {
      // Prova a parsare come data ISO
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }

  // Verifica se la data è valida
  if (isNaN(dateObj.getTime())) {
    return date.toString();
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
}
