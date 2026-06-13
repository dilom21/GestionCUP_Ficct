import { useState, useCallback } from 'react';
import axios from 'axios';

export function useReportes() {
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [reporteActivo, setReporteActivo] = useState(null);

  const generar = useCallback(async (tipo, filtros = {}) => {
    setCargando(true);
    setError(null);
    setReporteActivo(tipo);
    try {
      const res = await axios.post(route('admin.reportes.generar'), { tipo, filtros });
      setResultado(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al generar el reporte';
      setError(msg);
      setResultado(null);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  const exportar = useCallback(async (formato, tipo, filtros = {}) => {
    try {
      const url = route(`admin.reportes.exportar.${formato}`);
      const res = await axios.post(url, { tipo, filtros }, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reporte.${formato === 'csv' ? 'csv' : formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError('Error al exportar el reporte');
    }
  }, []);

  return { cargando, resultado, error, reporteActivo, generar, exportar, setReporteActivo, setResultado };
}
