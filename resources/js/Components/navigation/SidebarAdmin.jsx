import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { tienePermiso, sincronizarPermisos } from '@/Helpers/Permisos';
import sidebarModules from '@/Data/sidebarConfig';

/**
 * Mapa de iconos SVG por entidad para usar en la sidebar.
 */
const iconMap = {
  dashboard: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  postulantes: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  pagos: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  grupos_horarios: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  docentes: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  postulaciones_docentes: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  postulaciones_postulantes: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  materias_notas: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  cupos_admision: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  usuarios_seguridad: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  reportes: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  usuarios: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  roles: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  carreras: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  bitacora: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  materias: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  aulas: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  gestion_postulantes: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  asignacion_academica: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  docentes_materias: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  horarios: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  grupos: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  pagos_listado: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  asistencia: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  asistencia_docente: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  asistencia_estudiantes: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
};

function getIconForModule(entidad) {
  return iconMap[entidad] || null;
}

export default function SidebarAdmin() {
    const { url, props } = usePage();
    const [expandedMenu, setExpandedMenu] = useState(() => {
        try {
            return sessionStorage.getItem('sidebar_expanded_menu') || null;
        } catch { return null; }
    });
    const [sidebarLocked, setSidebarLocked] = useState(() => {
        try {
            return sessionStorage.getItem('sidebar_locked') === 'true';
        } catch { return false; }
    });

    const isActive = (href) => {
        if (!href || href === '#') return false;
        const hrefPath = href.split('?')[0].replace(/\/+$/, '');
        const currentPath = url.split('?')[0].replace(/\/+$/, '');
        return hrefPath === currentPath;
    };

    const usuarioPermisos = props?.auth?.usuario_permisos;
    const usuarioRol = props?.auth?.usuario_rol_nombre;
    const esAdmin = usuarioRol === 'Administrador';

    useEffect(() => {
        if (usuarioPermisos) {
            sincronizarPermisos(usuarioPermisos);
        }
    }, [usuarioPermisos]);

    const toggleMenu = (label) => {
        const next = expandedMenu === label ? null : label;
        setExpandedMenu(next);
        try { sessionStorage.setItem('sidebar_expanded_menu', next || ''); } catch {}
    };

    const toggleSidebarLock = () => {
        const next = !sidebarLocked;
        setSidebarLocked(next);
        try { sessionStorage.setItem('sidebar_locked', String(next)); } catch {}
    };

    const modulesConfig = useMemo(() => {
        return sidebarModules.map(mod => {
            if (mod.isDropdown) {
                return {
                    label: mod.label,
                    permisoLeer: mod.permisoLeer,
                    icon: getIconForModule(mod.entidad),
                    isDropdown: true,
                    children: mod.children.map(child => ({
                        label: child.label,
                        permiso: child.permiso,
                        icon: getIconForModule(child.entidad),
                        href: child.entidad === 'usuarios' ? route('usuarios.index') :
                              child.entidad === 'roles' ? route('roles.index') :
                              child.entidad === 'carreras' ? route('carreras.index') :
                              child.entidad === 'materias' ? route('materias.index') :
                              child.entidad === 'pagos_listado' ? route('pagos.index') :
                              child.entidad === 'postulaciones_docentes' ? route('admin.postulaciones.docentes') :
                              child.entidad === 'postulaciones_postulantes' ? route('admin.postulaciones.postulantes') :
                              child.entidad === 'bitacora' ? route('admin.bitacora') :
                              child.entidad === 'gestion_docentes' ? route('admin.docentes.index') :
                              child.entidad === 'gestion_postulantes' ? route('admin.postulantes.gestion') :
                              child.entidad === 'docentes_materias' ? route('docentes.materias.index') :
                              child.entidad === 'aulas' ? route('aulas.index') :
                              child.entidad === 'grupos' ? route('grupos.index') :
                              child.entidad === 'asignacion_academica' ? route('asignaciones.index') :
                              child.entidad === 'horarios' ? route('horarios.index') :
                              child.entidad === 'asistencia_docente' ? route('admin.asistencia.index', { tab: 'docente' }) :
                              child.entidad === 'asistencia_estudiantes' ? route('admin.asistencia.index', { tab: 'estudiante' }) :
                              '#',
                    })),
                };
            }
            return {
                label: mod.label,
                permisoLeer: mod.permisoLeer,
                icon: getIconForModule(mod.entidad),
                href: mod.entidad === 'dashboard' ? route('panel.dashboard') : '#',
            };
        });
    }, []);

    // Filtrar items del menú según permisos
    const visibleMenuItems = modulesConfig.filter((item) => {
        if (esAdmin) return true;
        if (item.isDropdown) {
            return item.children.some((child) => {
                if (child.permiso) return tienePermiso(child.permiso);
                return true;
            });
        }
        if (item.permisoLeer) return tienePermiso(item.permisoLeer);
        return true;
    });

    return (
        <aside className={`group bg-slate-900 border-r border-slate-800 text-slate-400 h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl z-50 overflow-y-auto overflow-x-hidden ${sidebarLocked ? 'w-72' : 'w-20 hover:w-72'}`}>
            <div>
                <div className="px-4 py-6 flex items-center gap-4 min-h-[88px]">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                        A
                    </div>
                    <div className={`whitespace-nowrap transition-opacity duration-200 delay-100 ${sidebarLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <p className="text-xs text-slate-400">Bienvenido,</p>
                        <p className="text-sm text-white font-bold capitalize">{usuarioRol || 'Usuario'}</p>
                    </div>
                </div>
                <div className="mx-3 mb-4 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                <nav className="space-y-1 px-2">
                    {visibleMenuItems.map((item, idx) =>
                        item.isDropdown ? (
                            <div key={idx}>
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={`w-full rounded-xl px-3 py-3 text-sm font-medium flex items-center gap-4 transition-all duration-200 hover:bg-blue-600 hover:text-white group/item ${
                                        expandedMenu === item.label ? 'bg-blue-600/20 text-blue-400' : ''
                                    }`}
                                >
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors duration-200 group-hover/item:text-white">
                                        {item.icon}
                                    </span>
                                    <span className={`flex-1 text-left transition-all duration-300 whitespace-nowrap ${sidebarLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {item.label}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 transition-all duration-300 ${expandedMenu === item.label ? 'rotate-180' : ''} ${sidebarLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMenu === item.label ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                    <div className="ml-11 space-y-1 border-l-2 border-blue-500/30 pl-3">
                                        {item.children
                                            .filter((child) => {
                                                if (esAdmin) return true;
                                                if (child.permiso) return tienePermiso(child.permiso);
                                                return true;
                                            })
                                            .map((child, childIdx) => (
                                                <Link
                                                    key={childIdx}
                                                    href={child.href}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                                        isActive(child.href) ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                                >
                                                    <span className="flex-shrink-0">{child.icon}</span>
                                                    <span className="whitespace-nowrap">{child.label}</span>
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                key={idx}
                                href={item.href}
                                className={`rounded-xl mx-1 p-3 text-sm font-medium flex items-center gap-4 transition-colors duration-200 hover:bg-blue-600 hover:text-white group/item ${isActive(item.href) ? 'bg-blue-600 text-white' : ''}`}
                            >
                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors duration-200 group-hover/item:text-white">
                                    {item.icon}
                                </span>
                                <span className={`transition-all duration-300 whitespace-nowrap ${sidebarLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        ),
                    )}
                </nav>
            </div>
            <div className="px-4 py-4">
                <div className="mx-1 mb-4 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                <button
                    onClick={toggleSidebarLock}
                    className={`rounded-xl mx-1 p-3 text-sm font-medium flex items-center gap-4 transition-colors duration-200 hover:bg-blue-500/10 hover:text-blue-400 w-full ${sidebarLocked ? 'text-blue-400' : ''}`}
                >
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sidebarLocked ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        )}
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className={`transition-all duration-300 whitespace-nowrap ${sidebarLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        Fijar sidebar
                    </span>
                </button>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="rounded-xl mx-1 p-3 text-sm font-medium flex items-center gap-4 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400 w-full"
                >
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className={`transition-all duration-300 whitespace-nowrap ${sidebarLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        Cerrar sesión
                    </span>
                </Link>
            </div>
        </aside>
    );
}