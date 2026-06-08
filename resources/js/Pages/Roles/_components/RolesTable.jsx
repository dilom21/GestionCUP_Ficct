import { motion } from 'framer-motion';

/**
 * Tabla de roles con diseño responsive (cards en móvil, tabla en desktop).
 */
export default function RolesTable({
    roles,
    searchTerm,
    onEditRole,
    onDeleteRole,
    onViewPermisos,
}) {
    if (roles.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="text-base font-bold text-slate-700">
                        {searchTerm ? 'No se encontraron roles' : 'No hay roles registrados'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        {searchTerm ? 'Intente con otro término de búsqueda.' : 'Cree un nuevo rol para comenzar.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Vista Desktop: tabla */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider">ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Nombre</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Descripción</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Permisos</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {roles.map((rol, index) => (
                            <motion.tr
                                key={rol.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                className="hover:bg-slate-50/80 transition-all group"
                            >
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                        #{rol.id}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                            {rol.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            {rol.nombre}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-500 font-medium">
                                        {rol.descripcion || (
                                            <span className="italic text-slate-300">Sin descripción</span>
                                        )}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onViewPermisos(rol)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Ver permisos
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEditRole(rol)}
                                            className="p-2.5 rounded-xl text-sm font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-all active:scale-95"
                                            title="Editar rol"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteRole(rol)}
                                            className="p-2.5 rounded-xl text-sm font-bold bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all active:scale-95"
                                            title="Eliminar rol"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Vista Móvil: tarjetas */}
            <div className="md:hidden divide-y divide-slate-100">
                {roles.map((rol, index) => (
                    <motion.div
                        key={rol.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="p-4 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                        #{rol.id}
                                    </span>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                                        {rol.nombre.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-slate-800 truncate">
                                    {rol.nombre}
                                </div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">
                                    {rol.descripcion || (
                                        <span className="italic text-slate-300">Sin descripción</span>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <button
                                        type="button"
                                        onClick={() => onViewPermisos(rol)}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    >
                                        Ver permisos
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onEditRole(rol)}
                                    className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all active:scale-95"
                                    title="Editar rol"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteRole(rol)}
                                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95"
                                    title="Eliminar rol"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}