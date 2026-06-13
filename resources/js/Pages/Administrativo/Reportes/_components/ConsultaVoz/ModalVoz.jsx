import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import HistorialVoz from './HistorialVoz';

export default function ModalVoz({ open, onClose, onResultado }) {
  const [escuchando, setEscuchando] = useState(false);
  const [texto, setTexto] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!open) {
      setEscuchando(false);
      setTexto('');
      setResultado(null);
      setError(null);
      detenerReconocimiento();
      return;
    }
    cargarHistorial();
  }, [open]);

  const cargarHistorial = async () => {
    try {
      const res = await axios.get(route('admin.consultavoz.historial'));
      setConsultas(res.data.consultas || []);
    } catch {}
  };

  const iniciarReconocimiento = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta reconocimiento de voz. Usá Chrome o Edge.');
      return;
    }

    detenerReconocimiento();
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-BO';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setTexto(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError('No se detectó voz. Intentá de nuevo.');
      } else if (event.error === 'network') {
        setError('Error de red: no se pudo conectar al servicio de reconocimiento de voz. Verificá tu conexión a Internet o escribí la consulta directamente en el cuadro de texto.');
      } else if (event.error !== 'aborted') {
        setError(`Error: ${event.error}`);
      }
      setEscuchando(false);
    };

    recognition.onend = () => {
      setEscuchando(false);
    };

    recognition.start();
    setEscuchando(true);
    setError(null);
  }, []);

  const detenerReconocimiento = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
  };

  const toggleEscucha = () => {
    if (escuchando) {
      detenerReconocimiento();
      setEscuchando(false);
    } else {
      iniciarReconocimiento();
    }
  };

  const procesarConsulta = async () => {
    if (!texto.trim()) return;
    setProcesando(true);
    setError(null);
    try {
      const res = await axios.post(route('admin.consultavoz.procesar'), { consulta_texto: texto });
      setResultado(res.data);
      cargarHistorial();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la consulta');
    } finally {
      setProcesando(false);
    }
  };

  const repetirConsulta = (consulta) => {
    setTexto(consulta.consulta_texto);
    setResultado({
      consulta,
      resultado: consulta.resultado_datos,
      resumen: consulta.resultado_resumen,
    });
  };

  const usarEnReportes = () => {
    if (resultado?.resultado && onResultado) {
      onResultado(resultado.resultado);
      onClose();
    }
  };

  const contenidoResultado = resultado?.resultado;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`bg-white ${isMobile ? 'rounded-t-2xl w-full h-[90vh]' : 'rounded-2xl w-full max-w-2xl'} shadow-2xl flex flex-col overflow-hidden`}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎤</span>
                <h3 className="text-lg font-bold text-slate-800">Consulta por Voz</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="text-center">
                <button
                  onClick={toggleEscucha}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 mx-auto flex items-center justify-center
                    ${escuchando
                      ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 hover:scale-105'
                    }`}
                >
                  <svg className={`w-8 h-8 sm:w-10 sm:h-10 text-white ${escuchando ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  {escuchando && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-red-400/30" />
                  )}
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  {escuchando ? 'Escuchando... tocá para detener' : 'Tocá el micrófono y hablá'}
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Tu consulta aparecerá aquí..."
                  rows={3}
                  className="w-full rounded-xl border-slate-200 text-sm bg-slate-50 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                />
                {escuchando && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-0.5 bg-red-400 rounded-full h-4 animate-wave" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {texto.trim() && (
                <button
                  onClick={procesarConsulta}
                  disabled={procesando}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {procesando ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Procesando...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Consultar</>
                  )}
                </button>
              )}

              {contenidoResultado && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm font-semibold text-emerald-800">Resultado</span>
                  </div>
                  <p className="text-sm text-emerald-700">{resultado.resumen}</p>
                  {Array.isArray(contenidoResultado.data) && contenidoResultado.data.length > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      {contenidoResultado.data.length} registros encontrados
                    </p>
                  )}
                  <button
                    onClick={usarEnReportes}
                    className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    Abrir en Reportes
                  </button>
                </div>
              )}

              <HistorialVoz consultas={consultas} onRepetir={repetirConsulta} cargando={procesando} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
