import { motion, AnimatePresence } from 'framer-motion';
import { ENTIDAD_INFO, COLORES_ENTIDAD } from '../_constants/roles';

/**
 * Modal para visualizar los permisos de un rol.
 */
export default function PermisosViewModal({
    showPermisosModal,
    selectedRolForPermisos,
    animatingPermisos,
    modulos,
    selectedFunciones,
    onClose,
    agruparPorEntidad,
    getOpcionEntidad,
    getOpcionLabel,
}) {
    return (
        <AnimatePresence>
            {showPermisosModal && selectedRolForPermisos && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 overflow-y-auto"
                >
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={onClose}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="relative inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform bg-white rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-5">
                                <div className="absolute inset-0 bg-white/5" />
                                <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-green-400/20 rounded-full blur-2xl" />

                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                Permisos: {selectedRolForPermisos.nombre}
                                            </h3>
                                            <p className="text-sm text-emerald-100 mt-0.5">
                                                Visualización de los permisos asignados a este rol en cada módulo
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5">
                                {animatingPermisos ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="relative">
                                            <div className="w-12 h-12 border-4 border-emerald-200 rounded-full" />
                                            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                        <span className="mt-3 text-sm font-bold text-slate-500">
                                            Cargando permisos...
                                        </span>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                                        {modulos.map((modulo) => {
                                            const entidades = agruparPorEntidad(modulo.funciones);
                                            const tienePermisos = entidades.some(ent => getOpcionEntidad(ent));

                                            if (!tienePermisos) return null;

                                            const permisosCount = entidades.filter(ent => getOpcionEntidad(ent)).length;

                                            return (
                                                <motion.div
                                                    key={modulo.id}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="border-2 border-slate-200 rounded-xl overflow-hidden"
                                                >
                                                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                                                                    {modulo.nombre.charAt(0)}
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-800">
                                                                    {modulo.nombre}
                                                                </span>
                                                            </div>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                                                {permisosCount} bot{permisosCount !== 1 ? 'ones' : 'ón'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="px-4 py-3 space-y-2">
                                                        {entidades.map((entidad) => {
                                                            const opcionActual = getOpcionEntidad(entidad);
                                                            if (!opcionActual) return null;

                                                            const info = ENTIDAD_INFO[entidad.entidad] || { nombre: entidad.nombreMostrable, icono: '📌', color: 'slate' };

                                                            const opcionStyles = {
                                                                lectura: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
                                                                escritura: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
                                                                lectura_escritura: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
                                                            };

                                                            const styles = opcionStyles[opcionActual] || opcionStyles.lectura_escritura;

                                                            return (
                                                                <div key={entidad.entidad} className={`flex items-center justify-between px-4 py-2.5 ${styles.bg} ${styles.border} border rounded-xl`}>
                                                                    <div className="flex items-center gap-2.5">
                                                                        <span className="text-lg">{info.icono}</span>
                                                                        <span className="text-sm font-bold text-slate-700">
                                                                            {info.nombre}
                                                                        </span>
                                                                    </div>
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${styles.bg} ${styles.text}`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                                                                        {getOpcionLabel(opcionActual)}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {modulos.every(mod => {
                                            const entidades = agruparPorEntidad(mod.funciones);
                                            return !entidades.some(ent => getOpcionEntidad(ent));
                                        }) && (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-bold text-slate-500">
                                                    Este rol no tiene permisos asignados
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}