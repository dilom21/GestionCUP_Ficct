import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import PermisosModuloAccordion from './PermisosModuloAccordion';

/**
 * Modal para crear o editar un rol con asignación granular de permisos por función.
 */
export default function RolModal({
    showModal,
    editingRol,
    loadingFunciones,
    animatingFunciones,
    processing,
    errors,
    data,
    setData,
    modulos,
    selectedFunciones,
    moduloExpandido,
    searchTerm,
    onClose,
    handleSubmit,
    toggleModulo,
    agruparPorEntidad,
    getOpcionEntidad,
    getOpcionLabel,
    getOpcionColor,
    handleOpcionEntidad,
    toggleEntidad,
    getModuloEstado,
    contarPermisos,
    toggleModuloCompleto,
    clearAllPermisos,
}) {
    // Estado para el contador animado de permisos
    const totalPermisos = selectedFunciones.length;

    // Búsqueda de módulos
    const [moduloSearch, setModuloSearch] = useState('');
    const modulosFiltrados = moduloSearch.trim()
        ? modulos.filter(mod =>
            mod.nombre.toLowerCase().includes(moduloSearch.toLowerCase())
          )
        : modulos;

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 overflow-y-auto"
                >
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={onClose}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="relative inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* ─── Header ─── */}
                            <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 px-6 py-5">
                                <div className="absolute inset-0 bg-white/5" />
                                <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl" />

                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                            {editingRol ? (
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                {editingRol ? `Editar: ${editingRol.nombre}` : 'Crear Nuevo Rol'}
                                            </h3>
                                            <p className="text-sm text-indigo-100 mt-0.5">
                                                {editingRol
                                                    ? 'Modifique la información y permisos del rol'
                                                    : 'Configure un nuevo rol con sus permisos de acceso'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Contador de permisos */}
                                    {totalPermisos > 0 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-white text-xs font-bold">
                                                {totalPermisos} permiso{totalPermisos !== 1 ? 's' : ''}
                                            </span>
                                        </motion.div>
                                    )}

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

                            {/* ─── Body ─── */}
                            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
                                {/* Datos básicos del rol */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="rol-nombre" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                            Nombre del Rol <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <input
                                                id="rol-nombre"
                                                type="text"
                                                value={data.nombre}
                                                onChange={(e) => setData('nombre', e.target.value)}
                                                className={`w-full pl-10 pr-3 py-2.5 border-2 rounded-xl text-sm font-semibold shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                                                    errors.nombre ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
                                                }`}
                                                placeholder="Ej: Administrador"
                                            />
                                        </div>
                                        {errors.nombre && (
                                            <p className="mt-1 text-xs font-bold text-red-500 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.nombre}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="rol-descripcion" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                            Descripción
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none">
                                                <svg className="w-4 h-4 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                                </svg>
                                            </div>
                                            <input
                                                id="rol-descripcion"
                                                type="text"
                                                value={data.descripcion}
                                                onChange={(e) => setData('descripcion', e.target.value)}
                                                className={`w-full pl-10 pr-3 py-2.5 border-2 rounded-xl text-sm font-semibold shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                                                    errors.descripcion ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
                                                }`}
                                                placeholder="Descripción del rol..."
                                            />
                                        </div>
                                        {errors.descripcion && (
                                            <p className="mt-1 text-xs font-bold text-red-500">{errors.descripcion}</p>
                                        )}
                                    </div>
                                </div>

                                {/* ─── Sección de Permisos por Módulo ─── */}
                                <div className="border-t-2 border-slate-100 pt-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div>
                                            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Permisos por Módulo
                                            </h4>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                Seleccione los niveles de acceso para cada entidad dentro de cada módulo
                                            </p>
                                        </div>

                                        {/* Contador móvil y buscador de módulos */}
                                        <div className="flex items-center gap-2">
                                            {totalPermisos > 0 && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 sm:hidden">
                                                    {totalPermisos} permiso{totalPermisos !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                            <div className="relative">
                                                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <input
                                                    type="text"
                                                    placeholder="Buscar módulo..."
                                                    value={moduloSearch}
                                                    onChange={(e) => setModuloSearch(e.target.value)}
                                                    className="w-40 pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {loadingFunciones ? (
                                        <div className="flex flex-col items-center justify-center py-16">
                                            <div className="relative">
                                                <div className="w-12 h-12 border-4 border-indigo-200 rounded-full" />
                                                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                            <span className="mt-3 text-sm font-bold text-slate-500">
                                                Cargando matriz de permisos...
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1 custom-scrollbar">
                                            {modulosFiltrados.length === 0 ? (
                                                <div className="text-center py-8 text-slate-400 text-sm font-medium">
                                                    {moduloSearch ? 'No se encontraron módulos.' : 'No hay módulos disponibles.'}
                                                </div>
                                            ) : (
                                                modulosFiltrados.map((modulo, moduloIdx) => {
                                                    const originalIdx = modulos.indexOf(modulo);
                                                    const entidades = agruparPorEntidad(modulo.funciones);
                                                    const isExpanded = moduloExpandido[originalIdx];

                                                    return (
                                                        <PermisosModuloAccordion
                                                            key={modulo.id}
                                                            modulo={modulo}
                                                            moduloIdx={originalIdx}
                                                            isExpanded={isExpanded}
                                                            onToggle={toggleModulo}
                                                            entidades={entidades}
                                                            getOpcionEntidad={getOpcionEntidad}
                                                            getOpcionLabel={getOpcionLabel}
                                            getOpcionColor={getOpcionColor}
                                            handleOpcionEntidad={handleOpcionEntidad}
                                            toggleEntidad={toggleEntidad}
                                            getModuloEstado={getModuloEstado}
                                                            contarPermisos={contarPermisos}
                                                            toggleModuloCompleto={toggleModuloCompleto}
                                                        />
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Errores de funciones */}
                                {errors.funciones && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-xs font-bold text-red-600">{errors.funciones}</p>
                                    </div>
                                )}

                                {/* Resumen de permisos seleccionados (solo si hay) */}
                                {totalPermisos > 0 && !loadingFunciones && (
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-xs font-bold text-indigo-700">
                                                {totalPermisos} permiso{totalPermisos !== 1 ? 's' : ''} seleccionado{totalPermisos !== 1 ? 's' : ''} en total
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearAllPermisos}
                                            className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                                        >
                                            Limpiar todo
                                        </button>
                                    </div>
                                )}

                                {/* ─── Botones de acción ─── */}
                                <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`relative px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg ${
                                            animatingFunciones ? 'animate-pulse' : ''
                                        }`}
                                    >
                                        {processing ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Guardando...
                                            </span>
                                        ) : editingRol ? 'Actualizar Rol' : 'Guardar Rol'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
