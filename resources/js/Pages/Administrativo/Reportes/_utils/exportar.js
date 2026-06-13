export function exportarCsv(data, columns, filename = 'reporte.csv') {
  if (!data || data.length === 0) return;
  const separador = ';';
  const cabecera = columns.join(separador);
  const filas = data.map((row) => {
    if (Array.isArray(row)) return row.join(separador);
    return Object.values(row).join(separador);
  });
  const contenido = [cabecera, ...filas].join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + contenido], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
