import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function SidebarAdmin() {
    const postulacionesActiva = route().current('admin.postulaciones.docentes') || route().current('admin.postulaciones.docentes.show') || route().current('admin.postulaciones.docentes.*');
    const bitacoraActiva = route().current('admin.bitacora');
    const [postulantesAbierto, setPostulantesAbierto] = useState(postulacionesActiva);
    const [seguridadAbierta, setSeguridadAbierta] = useState(bitacoraActiva);

    const menuItems = [
        {
            label: 'Dashboard',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            href: route('admin.dashboard'),
        },
        {
            label: 'Postulantes y Requisitos',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            children: [
                {
                    label: 'Postulaciones Docentes',
                    href: route('admin.postulaciones.docentes'),
                },
            ],
        },
        {
            label: 'Pagos y Habilitación',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            href: '#',
        },
        {
            label: 'Grupos, Horarios y Aulas',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            href: '#',
        },
        {
            label: 'Docentes y Carga Horaria',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            href: '#',
        },
        {
            label: 'Materias y Notas',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            href: '#',
        },
        {
            label: 'Cupos y Admisión',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            ),
            href: '#',
        },
        {
            label: 'Usuarios y Seguridad',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            children: [
                {
                    label: 'Auditoria y Bitacora',
                    href: route('admin.bitacora'),
                },
            ],
        },
        {
            label: 'Reportes',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            href: '#',
        },
    ];

    return (
        <aside className="group w-20 hover:w-72 bg-slate-900 border-r border-slate-800 text-slate-400 h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl z-50">
            {/* ─── Cabecera: Avatar + Bienvenida ─── */}
            <div>
                <div className="px-4 py-6 flex items-center gap-4 min-h-[88px]">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                        A
                    </div>

                    {/* Texto de bienvenida */}
                    <div className="transition-opacity duration-200 delay-100 whitespace-nowrap opacity-0 group-hover:opacity-100">
                        <p className="text-xs text-slate-400">Bienvenido,</p>
                        <p className="text-sm text-white font-bold">Administrador</p>
                    </div>
                </div>

                {/* ─── Separador ─── */}
                <div className="mx-3 mb-4 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

                {/* ─── Menú de módulos ─── */}
                <nav className="space-y-1">
                    {menuItems.map((item, idx) => {
                        if (item.children) {
                            const esPostulantes = item.label === 'Postulantes y Requisitos';
                            const abierto = esPostulantes ? postulantesAbierto : seguridadAbierta;
                            const activo = esPostulantes ? postulacionesActiva : bitacoraActiva;
                            const toggle = esPostulantes
                                ? () => setPostulantesAbierto((a) => !a)
                                : () => setSeguridadAbierta((a) => !a);

                            return (
                                <div key={idx}>
                                    <button
                                        type="button"
                                        onClick={toggle}
                                        className={`rounded-xl mx-3 p-3 text-sm font-medium flex items-center gap-4 transition-colors duration-200 group/item w-[calc(100%-1.5rem)] ${
                                            activo
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-blue-600 hover:text-white'
                                        }`}
                                        aria-expanded={abierto}
                                    >
                                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                            {item.icon}
                                        </span>
                                        <span className="flex min-w-0 flex-1 items-center justify-between whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                            {item.label}
                                            <svg
                                                className={`h-4 w-4 transition-transform duration-200 ${
                                                    abierto ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </span>
                                    </button>

                                    <div
                                        className={`grid overflow-hidden transition-all duration-200 ${
                                            abierto
                                                ? 'grid-rows-[1fr] opacity-100'
                                                : 'grid-rows-[0fr] opacity-0'
                                        }`}
                                    >
                                        <div className="min-h-0">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.label}
                                                    href={child.href}
                                                    className={`mx-3 ml-14 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition-colors ${
                                                        activo
                                                            ? 'bg-slate-800 text-white'
                                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                                >
                                                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
                                                    <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                        {child.label}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                className="rounded-xl mx-3 p-3 text-sm font-medium flex items-center gap-4 transition-colors duration-200 hover:bg-blue-600 hover:text-white group/item"
                            >
                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors duration-200 group-hover/item:text-white">
                                    {item.icon}
                                </span>
                                <span className="transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* ─── Pie: Cerrar sesión ─── */}
            <div className="px-4 py-4">
                <div className="mx-1 mb-4 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="rounded-xl mx-3 p-3 text-sm font-medium flex items-center gap-4 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400 w-full"
                >
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">
                        Cerrar sesión
                    </span>
                </Link>
            </div>
        </aside>
    );
}
