// Para columnas `date` de Postgres (ej. birth_date), que llegan como "YYYY-MM-DD"
// sin hora. `new Date("2003-05-22")` las interpreta como medianoche UTC, y
// `toLocaleDateString` las formatea en la hora local — en un huso horario
// detrás de UTC (Argentina, UTC-3) eso corre la fecha un día para atrás. Como
// acá no hay hora real que preservar, formateamos directo desde el string.
export function formatDateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}
