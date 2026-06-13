import { motion, AnimatePresence } from 'framer-motion';
import { ENTIDAD_INFO, COLORES_ENTIDAD } from '../_constants/roles';

/**
 * Acordeón de un módulo que muestra todas sus entidades con selectores de permisos.
 */
export default function PermisosModuloAccordion({
    modulo,
    moduloIdx,
    isExpanded,
    onToggle,
    entidades,
    getOpcionEntidad,
    getOpcionLabel,
    getOpcionColor,
    handleOpcionEntidad,
    toggleEntidad,
    getModuloEstado,
    contarPermisos,
    toggleModuloCompleto,
}) {
    const moduloEstado = getModuloEstado(modulo);
    const permisosCount = contarPermisos(modulo);

    const estadoStyles = {
        all: {
            border: 'border-indigo-300 shadow-indigo-100',
            header: 'bg-gradient-to-r from-indigo-50 to-indigo-100/50',
            badge: 'bg-indigo-100 text-indigo-700',
            check: 'bg-indigo-600 border-indigo-600',
            icon: 'bg-indigo-100 text-indigo-600',
        },
        partial: {
            border: 'border-amber-300 shadow-amber-100',
            header: 'bg-gradient-to-r from-amber-50 to-amber-100/50',
            badge: 'bg-amber-100 text-amber-700',
            check: 'bg-amber-500 border-amber-500',
            icon: 'bg-amber-100 text-amber-600',
        },
        none: {
            border: isExpanded ? 'border-slate-200 shadow-sm' : 'border-slate-200 hover:border-slate-300',
            header: 'bg-slate-50 hover:bg-slate-100',
            badge: 'bg-slate-100 text-slate-600',
            check: 'border-slate-300 hover:border-indigo-400',
            icon: 'bg-slate-200 text-slate-500',
        },
    };

    const styles = estadoStyles[moduloEstado] || estadoStyles.none;

    return (
        <div className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 ${styles.border}`}>
            {/* ─── Cabecera del Módulo ─── */}
            <button
                type="button"
                onClick={() => onToggle(moduloIdx)}
                className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-200 ${styles.header}`}
            >
                <div className="flex items-center gap-4">
                    {/* Checkbox de selección total */}
                    <div onClick={(e) => { e.stopPropagation(); toggleModuloCompleto(modulo); }}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${styles.check}`}>
                            {moduloEstado === 'all' && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {moduloEstado === 'partial' && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Icono del módulo */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${styles.icon}`}>
                        {modulo.nombre.charAt(0).toUpperCase()}
                    </div>

                    <div className="text-left">
                        <span className="text-sm font-bold text-slate-800">
                            {modulo.nombre}
                        </span>
                        <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                            {entidades.length} bot{entidades.length !== 1 ? 'ones' : 'ón'}
                        </p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                        {moduloEstado === 'all' && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${styles.badge}`}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Completo
                            </span>
                        )}
                        {moduloEstado === 'partial' && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${styles.badge}`}>
                                {permisosCount}/{entidades.length}
                            </span>
                        )}
                        {permisosCount > 0 && moduloEstado === 'none' && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${styles.badge}`}>
                                {permisosCount} permiso{permisosCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>

                {/* Flecha de expandir/colapsar */}
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.div>
            </button>

            {/* ─── Entidades del Módulo (desplegable) ─── */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key={`modulo-${modulo.id}-content`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 py-4 space-y-3 bg-white border-t border-slate-100">
                            {entidades.length === 0 ? (
                                <p className="text-sm text-slate-400 italic font-medium text-center py-4">
                                    No hay botones disponibles en este módulo.
                                </p>
                            ) : (
                                entidades.map((entidad) => {
                                    const info = ENTIDAD_INFO[entidad.entidad] || { nombre: entidad.nombreMostrable, icono: entidad.icono, color: entidad.color };
                                    const colores = COLORES_ENTIDAD[info.color] || COLORES_ENTIDAD.slate;
                                    const opcionActual = getOpcionEntidad(entidad);

                                    return (
                                        <motion.div
                                            key={entidad.entidad}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={`rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                                                opcionActual
                                                    ? `${colores.border} ${colores.bg}`
                                                    : 'border-slate-200 bg-slate-50/50'
                                            }`}
                                        >
                                            {/* Entidad Header */}
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        role="checkbox"
                                                        aria-checked={Boolean(opcionActual)}
                                                        aria-label={`${opcionActual ? 'Desactivar' : 'Activar'} ${info.nombre}`}
                                                        onClick={() => toggleEntidad(entidad)}
                                                        className={`w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
                                                            opcionActual
                                                                ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-200'
                                                                : 'bg-white border-slate-300 hover:border-indigo-400'
                                                        }`}
                                                    >
                                                        {opcionActual && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <span className="text-xl">{info.icono}</span>
                                                    <div>
                                                        <span className={`text-sm font-bold ${colores.text || 'text-slate-700'}`}>
                                                            {info.nombre}
                                                        </span>
                                                        <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                                                            {entidad.funciones.length} permis{entidad.funciones.length !== 1 ? 'os' : 'o'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Badge de estado */}
                                                {opcionActual ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                        opcionActual === 'lectura'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : opcionActual === 'escritura'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-indigo-100 text-indigo-700'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            opcionActual === 'lectura' ? 'bg-blue-500' : opcionActual === 'escritura' ? 'bg-green-500' : 'bg-indigo-500'
                                                        }`}></span>
                                                        {getOpcionLabel(opcionActual)}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-semibold">
                                                        Sin permiso
                                                    </span>
                                                )}
                                            </div>

                                            {/* ─── Selector de Niveles de Permiso ─── */}
                                            <div className="px-4 pb-3 pt-0">
                                                <div className="flex gap-2">
                                                    {/* Botón Solo Lectura */}
                                                    {entidad.lectura && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpcionEntidad(entidad, 'lectura')}
                                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                                                opcionActual === 'lectura'
                                                                    ? 'bg-blue-500 text-white shadow-md shadow-blue-200 scale-105 ring-2 ring-blue-300 ring-offset-1'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 hover:ring-2 hover:ring-blue-200'
                                                            }`}
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Solo Lectura
                                                        </button>
                                                    )}

                                                    {/* Botón Solo Escritura */}
                                                    {entidad.escritura && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpcionEntidad(entidad, 'escritura')}
                                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                                                opcionActual === 'escritura'
                                                                    ? 'bg-green-500 text-white shadow-md shadow-green-200 scale-105 ring-2 ring-green-300 ring-offset-1'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-600 hover:ring-2 hover:ring-green-200'
                                                            }`}
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Solo Escritura
                                                        </button>
                                                    )}

                                                    {/* Botón Lectura y Escritura */}
                                                    {(entidad.lectura || entidad.escritura) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpcionEntidad(entidad, 'lectura_escritura')}
                                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                                                opcionActual === 'lectura_escritura'
                                                                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 scale-105 ring-2 ring-indigo-300 ring-offset-1'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 hover:ring-2 hover:ring-indigo-200'
                                                            }`}
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Lectura y Escritura
                                                        </button>
                                                    )}

                                                    {/* Botón Quitar permiso */}
                                                    {opcionActual && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpcionEntidad(entidad, null)}
                                                            className="px-3 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200 ring-2 ring-red-200 ring-offset-1"
                                                            title="Quitar permisos"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
