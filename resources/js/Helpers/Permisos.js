/**
 * Obtiene los permisos del usuario desde sessionStorage.
 * Como fallback, intenta leer desde window.__INERTIA_DATA__
 */
function obtenerPermisos() {
    if (typeof window === 'undefined') return [];

    try {
        // Intentar desde sessionStorage
        const permisosStr = sessionStorage.getItem('usuario_permisos');
        if (permisosStr) {
            return JSON.parse(permisosStr);
        }
    } catch {
        // Ignorar error
    }

    // Fallback: obtener de los datos de la página (Inertia) que ya están cargados
    try {
        const pageData = window.__INERTIA_DATA__;
        if (pageData && pageData.props && pageData.props.auth) {
            const permisos = pageData.props.auth.usuario_permisos;
            if (Array.isArray(permisos) && permisos.length > 0) {
                // Sincronizar a sessionStorage para futuros usos
                sincronizarPermisos(permisos);
                return permisos;
            }
        }
    } catch {
        // Ignorar error
    }

    return [];
}

/**
 * Verifica si el usuario autenticado tiene un permiso específico.
 */
export function tienePermiso(permiso) {
    if (!permiso) return true; // Si no se especifica permiso, se permite
    const permisos = obtenerPermisos();
    return permisos.includes(permiso);
}

/**
 * Verifica si el usuario tiene al menos uno de los permisos listados.
 */
export function tieneAlgunPermiso(permisos) {
    if (!permisos || permisos.length === 0) return true;
    return permisos.some(p => tienePermiso(p));
}

/**
 * Verifica si el usuario tiene TODOS los permisos listados.
 */
export function tieneTodosPermisos(permisos) {
    if (!permisos || permisos.length === 0) return true;
    return permisos.every(p => tienePermiso(p));
}

/**
 * Sincroniza los permisos desde Inertia a sessionStorage.
 */
export function sincronizarPermisos(permisos) {
    if (typeof window !== 'undefined' && permisos) {
        try {
            sessionStorage.setItem('usuario_permisos', JSON.stringify(permisos));
        } catch {
            // Ignorar error si sessionStorage no está disponible
        }
    }
}

/**
 * Componente condicional: muestra children solo si se tiene el permiso.
 */
export function Permiso({ permiso, children, fallback = null }) {
    return tienePermiso(permiso) ? children : fallback;
}

export default tienePermiso;