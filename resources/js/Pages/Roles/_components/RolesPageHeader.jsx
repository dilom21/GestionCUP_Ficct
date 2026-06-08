import { motion } from 'framer-motion';

/**
 * Header superior de la página de gestión de roles con búsqueda y botón crear.
 */
export default function RolesPageHeader({
    searchTerm,
    onSearchChange,
    onCreateRole,
    totalRoles,
}) {
    return (
        <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-8 shadow-xl">
            <div className="absolute inset-0 bg-white/5" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-indigo-200 font-bold text-[10px] tracking-widest uppercase mb-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            {totalRoles > 0 ? `${totalRoles} rol${totalRoles !== 1 ? 'es' : ''} registrado${totalRoles !== 1 ? 's' : ''}` : 'Seguridad del Sistema'}
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Gestión de Roles
                        </h1>
                        <p className="mt-1 text-indigo-100 text-sm max-w-xl">
                            Administre los niveles de acceso del sistema. Cree, edite y asigne permisos por módulo a cada rol de usuario.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Buscador */}
                    <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar rol..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full sm:w-56 pl-10 pr-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm text-white text-sm font-medium placeholder:text-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                        />
                    </div>

                    {/* Botón crear rol */}
                    <motion.button
                        type="button"
                        onClick={onCreateRole}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-indigo-700 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Rol
                    </motion.button>
                </div>
            </div>
        </div>
    );
}