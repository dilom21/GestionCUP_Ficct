import { createContext, useContext, useMemo } from 'react';

const PermisosContext = createContext(null);

export function PermisosProvider({ children, permisos }) {
    const value = useMemo(() => {
        const permisosNorm = (permisos || []).map(p => p.toLowerCase().trim());

        const tienePermiso = (modulo, accion = 'LEER') => {
            const permiso = `${modulo.toLowerCase()}.${accion.toLowerCase()}`;
            return permisosNorm.includes(permiso);
        };

        const puedeEditar = (modulo) => {
            return tienePermiso(modulo, 'ESCRIBIR');
        };

        const esSoloLectura = (modulo) => {
            return tienePermiso(modulo, 'LEER') && !puedeEditar(modulo);
        };

        return { permisos: permisosNorm, tienePermiso, puedeEditar, esSoloLectura };
    }, [permisos]);

    return (
        <PermisosContext.Provider value={value}>
            {children}
        </PermisosContext.Provider>
    );
}

export function usePermisos() {
    const ctx = useContext(PermisosContext);
    if (!ctx) {
        return {
            permisos: [],
            tienePermiso: () => false,
            puedeEditar: () => false,
            esSoloLectura: () => false,
        };
    }
    return ctx;
}