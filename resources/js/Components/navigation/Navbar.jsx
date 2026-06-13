import { Link } from '@inertiajs/react';
import PanelNotificaciones from './PanelNotificaciones';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
    return (
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Hamburguesa */}
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all duration-200 focus:outline-none"
                    aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                >
                    <div className="w-5 h-4 relative flex flex-col justify-between">
                        <span className={`block h-0.5 w-full bg-slate-600 rounded-full transition-all duration-300 origin-center ${sidebarOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                        <span className={`block h-0.5 w-full bg-slate-600 rounded-full transition-all duration-300 ${sidebarOpen ? 'opacity-0 scale-x-0' : ''}`} />
                        <span className={`block h-0.5 w-full bg-slate-600 rounded-full transition-all duration-300 origin-center ${sidebarOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                    </div>
                </button>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium text-slate-700">Panel de Administración</span>
                </div>
            </div>

            {/* Acciones derecha */}
            <div className="flex items-center gap-4">
                {/* Notificaciones */}
                <PanelNotificaciones />

                {/* Perfil */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800">Admin</p>
                        <p className="text-xs text-slate-400">admin@ficct.edu.bo</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">A</div>
                </div>
            </div>
        </nav>
    );
}
