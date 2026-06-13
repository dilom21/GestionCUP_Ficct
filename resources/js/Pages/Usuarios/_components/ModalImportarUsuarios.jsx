import { useState, useRef, useCallback } from 'react';
import { useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNAS_ESPERADAS = [
  { label: 'Nombre', key: 'nombre', ejemplo: 'Juan' },
  { label: 'Apellido', key: 'apellido', ejemplo: 'Pérez' },
  { label: 'Correo', key: 'correo', ejemplo: 'juan@example.com' },
  { label: 'Rol', key: 'rol', ejemplo: 'Docente' },
];

export default function ModalImportarUsuarios({ open, onClose, importResultado, onDeshacer }) {
  const [dragOver, setDragOver] = useState(false);
  const [archivoNombre, setArchivoNombre] = useState('');
  const fileInputRef = useRef(null);
  const deshaciendo = useRef(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    archivo: null,
  });

  const handleFile = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) return;
    setData('archivo', file);
    setArchivoNombre(file.name);
  }, [setData]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleSubmit = () => {
    if (!data.archivo) return;
    deshaciendo.current = false;
    post(route('usuarios.importar'), {
      preserveScroll: true,
      onSuccess: () => {
        setArchivoNombre('');
        reset();
      },
    });
  };

  const handleDeshacer = () => {
    if (!importResultado?.import_batch) return;
    if (!confirm('¿Estás seguro? Se eliminarán todos los usuarios creados en esta importación. Esta acción no se puede deshacer.')) return;
    deshaciendo.current = true;
    router.delete(route('usuarios.importar.deshacer', importResultado.import_batch), {
      preserveScroll: true,
      onSuccess: () => onDeshacer?.(),
    });
  };

  const estadoInicial = !importResultado;
  const tieneResultado = importResultado && (importResultado.total_creados > 0 || importResultado.total_errores > 0);
  const hayErrores = importResultado?.total_errores > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !processing) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Importar Usuarios</h3>
                  <p className="text-xs text-slate-400">Cargar usuarios desde Excel o CSV</p>
                </div>
              </div>
              <button onClick={() => { if (!processing) onClose(); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {estadoInicial && (
                <>
                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      dragOver
                        ? 'border-blue-400 bg-blue-50 scale-[1.02]'
                        : archivoNombre
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={handleInputChange}
                    />
                    {archivoNombre ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-emerald-700">{archivoNombre}</p>
                          <p className="text-xs text-emerald-500">Archivo seleccionado — hacé clic para cambiar</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-600">
                          Arrastrá tu archivo aquí o <span className="text-blue-600">seleccioná uno</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">CSV, XLSX o XLS — Máx 5MB</p>
                      </>
                    )}
                  </div>

                  {/* Columnas esperadas */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Columnas esperadas en el archivo</p>
                    <div className="grid grid-cols-2 gap-2">
                      {COLUMNAS_ESPERADAS.map((col) => (
                        <div key={col.key} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{col.label}</p>
                            <p className="text-[10px] text-slate-400">Ej: {col.ejemplo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Errores de validación */}
                  {errors.archivo && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.archivo}
                    </div>
                  )}
                </>
              )}

              {/* Resultados */}
              {tieneResultado && (
                <div className="space-y-4">
                  {/* Resumen */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-700">{importResultado.total_creados}</p>
                      <p className="text-xs font-semibold text-emerald-600 mt-1">Usuarios creados</p>
                    </div>
                    <div className={`rounded-xl border p-4 text-center ${hayErrores ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`text-2xl font-bold ${hayErrores ? 'text-red-700' : 'text-slate-500'}`}>{importResultado.total_errores}</p>
                      <p className={`text-xs font-semibold mt-1 ${hayErrores ? 'text-red-600' : 'text-slate-400'}`}>Errores</p>
                    </div>
                  </div>

                  {/* Tabla de errores */}
                  {hayErrores && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Detalle de errores</p>
                      <div className="max-h-40 overflow-y-auto rounded-xl border border-red-100">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-red-50 text-red-700">
                              <th className="px-3 py-2 text-left font-semibold">Fila</th>
                              <th className="px-3 py-2 text-left font-semibold">Campo</th>
                              <th className="px-3 py-2 text-left font-semibold">Motivo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importResultado.errores?.map((err, i) => (
                              <tr key={i} className="border-t border-red-50 text-slate-600">
                                <td className="px-3 py-2 font-mono">{err.fila}</td>
                                <td className="px-3 py-2">{err.campo}</td>
                                <td className="px-3 py-2">{err.motivo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Tabla de creados */}
                  {importResultado.total_creados > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Usuarios creados</p>
                      <div className="max-h-40 overflow-y-auto rounded-xl border border-emerald-100">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-emerald-50 text-emerald-700">
                              <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                              <th className="px-3 py-2 text-left font-semibold">Correo</th>
                              <th className="px-3 py-2 text-left font-semibold">Rol</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importResultado.creados?.map((item, i) => (
                              <tr key={i} className="border-t border-emerald-50 text-slate-600">
                                <td className="px-3 py-2">{item.usuario.nombre} {item.usuario.apellidos}</td>
                                <td className="px-3 py-2">{item.usuario.correo}</td>
                                <td className="px-3 py-2">{item.usuario.id_rol}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 text-center">
                    Los correos con las credenciales se están enviando en segundo plano.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
              {estadoInicial ? (
                <>
                  <button onClick={() => { onClose(); reset(); setArchivoNombre(''); }} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!data.archivo || processing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-300 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:shadow-none"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Importando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Importar
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    {importResultado?.import_batch && (
                      <button
                        onClick={handleDeshacer}
                        disabled={deshaciendo.current}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Deshacer importación
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => { onClose(); reset(); setArchivoNombre(''); }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
