import { useState, useCallback, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import HeroReportes from './_components/HeroReportes';
import TarjetasKpi from './_components/TarjetasKpi';
import BotonesReportes from './_components/BotonesReportes';
import PanelFiltros from './_components/PanelFiltros';
import SelectorVista from './_components/SelectorVista';
import BotonExportar from './_components/BotonExportar';
import TablaReporte from './_components/TablaReporte';
import GraficoBarras from './_components/GraficoBarras';
import GraficoCircular from './_components/GraficoCircular';
import GraficoLineas from './_components/GraficoLineas';
import FloatingMic from './_components/ConsultaVoz/FloatingMic';
import ModalVoz from './_components/ConsultaVoz/ModalVoz';
import { useReportes } from './_hooks/useReportes';
import { useMediaQuery } from './_hooks/useMediaQuery';
import { exportarCsv } from './_utils/exportar';

export default function ReportesIndex({ kpi, gestiones, carreras, materias, grupos, docentes, aulas }) {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const [filtros, setFiltros] = useState({});
  const [vista, setVista] = useState('ambos');
  const [modalVoz, setModalVoz] = useState(false);
  const [vozActiva, setVozActiva] = useState(false);
  const { cargando, resultado, error, reporteActivo, generar, exportar, setReporteActivo, setResultado } = useReportes();

  const actualizarFiltro = useCallback((key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value || undefined }));
  }, []);

  const generarReporte = useCallback(() => {
    if (reporteActivo) {
      generar(reporteActivo, filtros);
    }
  }, [reporteActivo, filtros, generar]);

  const seleccionarReporte = useCallback((tipo) => {
    setReporteActivo(tipo);
    if (tipo !== reporteActivo) {
      setResultado(null);
    }
  }, [setReporteActivo, setResultado, reporteActivo]);

  useEffect(() => {
    if (reporteActivo && resultado === null && !cargando) {
      generar(reporteActivo, filtros);
    }
  }, [reporteActivo, filtros]);

  const handleExportar = useCallback(async (formato) => {
    if (formato === 'csv' && resultado?.data) {
      exportarCsv(resultado.data, resultado.columns);
    } else {
      await exportar(formato, reporteActivo, filtros);
    }
  }, [exportar, reporteActivo, filtros, resultado]);

  const handleResultadoVoz = useCallback((data) => {
    if (data?.data) {
      setResultado(data);
    }
  }, [setResultado]);

  const tipoChart = resultado?.chart?.tipo || 'bar';
  const datosChart = resultado?.chart?.datos || [];
  const labelChart = resultado?.chart?.label || '';
  const valorChart = resultado?.chart?.valor || '';
  const columns = resultado?.columns || [];
  const dataResultado = resultado?.data || [];

  return (
    <AdminLayout>
      <Head title="Reportes" />

      <div className="max-w-7xl mx-auto">
        <HeroReportes kpi={kpi} />
        <TarjetasKpi kpi={kpi} cargando={false} />

        <BotonesReportes
          reporteActivo={reporteActivo}
          onSeleccionar={seleccionarReporte}
          cargando={cargando}
        />

        <PanelFiltros
          filtros={filtros}
          onChange={actualizarFiltro}
          onGenerar={generarReporte}
          gestiones={gestiones}
          carreras={carreras}
          materias={materias}
          grupos={grupos}
          docentes={docentes}
          aulas={aulas}
          cargando={cargando}
          reporteActivo={reporteActivo}
        />

        <AnimatePresence mode="wait">
          {resultado && (
            <motion.div
              key={reporteActivo + vista}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  {Array.isArray(dataResultado)
                    ? `${dataResultado.length} registros`
                    : 'Resultados'}
                </p>
                <div className="flex items-center gap-2">
                  <SelectorVista vista={vista} onChange={setVista} />
                  <BotonExportar
                    onExportar={handleExportar}
                    cargando={cargando}
                    resultado={resultado}
                  />
                </div>
              </div>

              {(vista === 'tabla' || vista === 'ambos') && (
                <div className="mb-4">
                  <TablaReporte
                    columns={columns}
                    data={dataResultado}
                    tipo={reporteActivo}
                  />
                </div>
              )}

              {(vista === 'grafico' || vista === 'ambos') && datosChart.length > 0 && (
                <div className="mb-4">
                  {tipoChart === 'pie' ? (
                    <GraficoCircular datos={datosChart} label={labelChart} valor={valorChart} />
                  ) : tipoChart === 'line' ? (
                    <GraficoLineas datos={datosChart} label={labelChart} valor={valorChart} />
                  ) : (
                    <GraficoBarras datos={datosChart} label={labelChart} valor={valorChart} />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!resultado && !cargando && reporteActivo && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-slate-400 font-medium">Hacé clic en "Generar Reporte" para ver los resultados</p>
          </div>
        )}

        {!reporteActivo && !resultado && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Seleccioná un reporte</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Elegí uno de los 8 reportes obligatorios de arriba, ajustá los filtros si querés, y generá el reporte para visualizar los datos con tablas y gráficos.
            </p>
            <p className="text-xs text-slate-300 mt-4">
              También podés usar la consulta por voz 🎤 (botón flotante abajo a la derecha)
            </p>
          </div>
        )}
      </div>

      <FloatingMic
        onClick={() => setModalVoz(true)}
        isListening={vozActiva}
      />

      <ModalVoz
        open={modalVoz}
        onClose={() => setModalVoz(false)}
        onResultado={handleResultadoVoz}
      />
    </AdminLayout>
  );
}
