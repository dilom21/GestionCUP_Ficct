import { useForm } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { ENTIDAD_INFO } from '../_constants/roles';
import sidebarModules from '@/Data/sidebarConfig';

/**
 * Obtiene los items (botones) definidos en el sidebar para un módulo dado.
 */
function getSidebarItemsForModulo(moduloLabel) {
    const mod = sidebarModules.find((m) => m.label === moduloLabel);
    if (!mod) return [];

    const items = (mod.children || []).map((child) => ({
        entidad: child.entidad,
        label: child.label,
        icon: child.icon || '📌',
        color: child.color || 'slate',
        permisoLeer: child.permiso,
    }));

    if (items.length === 0 && mod.permisoLeer) {
        items.push({
            entidad: mod.entidad,
            label: mod.label,
            icon: mod.icon || '📌',
            color: mod.color || 'slate',
            permisoLeer: mod.permisoLeer,
        });
    }

    return items;
}

/**
 * Encuentra en una lista de funciones aquellas que coinciden con una entidad.
 */
function findFunctionsForEntidad(funciones, entidad) {
    const lectura = funciones.find((f) => f.permiso === `${entidad}.leer`);
    const escritura = funciones.find((f) => f.permiso === `${entidad}.escribir`);
    return {
        funciones: [lectura, escritura].filter(Boolean),
        lectura,
        escritura,
    };
}

/**
 * Hook personalizado para la gestión de roles con permisos por módulo.
 * Cada módulo muestra los botones definidos en SidebarConfig.
 */
export default function useGestionRoles({ roles: initialRoles, modulos: initialModulos }) {
    const [roles, setRoles] = useState(initialRoles || []);
    const [modulos, setModulos] = useState(initialModulos || []);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        transform,
    } = useForm({
        nombre: '',
        descripcion: '',
        funciones: [],
    });

    // ─── Estados del modal ───
    const [showModal, setShowModal] = useState(false);
    const [editingRol, setEditingRol] = useState(null);
    const [selectedFunciones, setSelectedFunciones] = useState([]);
    const [loadingFunciones, setLoadingFunciones] = useState(false);
    const [moduloExpandido, setModuloExpandido] = useState({});
    const [animatingFunciones, setAnimatingFunciones] = useState(false);

    // ─── Estados del modal de visualización ───
    const [showPermisosModal, setShowPermisosModal] = useState(false);
    const [selectedRolForPermisos, setSelectedRolForPermisos] = useState(null);
    const [animatingPermisos, setAnimatingPermisos] = useState(false);

    // ─── Búsqueda ───
    const [searchTerm, setSearchTerm] = useState('');

    // Actualizar roles y módulos cuando cambien las props
    useEffect(() => {
        setRoles(initialRoles || []);
        setModulos(initialModulos || []);
    }, [initialRoles, initialModulos]);

    const rolesFiltrados = useMemo(() => {
        if (!searchTerm.trim()) return roles;
        const term = searchTerm.toLowerCase().trim();
        return roles.filter(rol =>
            rol.nombre.toLowerCase().includes(term) ||
            (rol.descripcion && rol.descripcion.toLowerCase().includes(term))
        );
    }, [roles, searchTerm]);

    // ─── Utilidades de permisos ───

    /**
     * Agrupa funciones de un módulo por los botones definidos en SidebarConfig.
     * Solo aparecen entidades que están definidas como hijos del módulo en la sidebar.
     */
    const agruparPorEntidad = useMemo(() => {
        return (funciones) => {
            if (!funciones || funciones.length === 0) return [];

            const idModulo = funciones[0]?.id_modulo;
            const moduloAsociado = modulos.find((m) => m.id === idModulo);
            const moduloLabel = moduloAsociado?.nombre || '';

            const sidebarItems = getSidebarItemsForModulo(moduloLabel);

            return sidebarItems
                .map((item) => {
                    const { funciones: fns, lectura, escritura } = findFunctionsForEntidad(
                        funciones,
                        item.entidad
                    );

                    const info = ENTIDAD_INFO[item.entidad] || {};

                    return {
                        entidad: item.entidad,
                        nombreMostrable: info.nombre || item.label,
                        icono: info.icono || item.icon,
                        color: info.color || item.color,
                        funciones: fns,
                        lectura,
                        escritura,
                    };
                })
                .filter((ent) => ent.funciones.length > 0);
        };
    }, [modulos]);

    /** Determina qué opción de permiso está seleccionada para una entidad */
    const getOpcionEntidad = useMemo(() => {
        return (entidad) => {
            const tieneLectura = entidad.lectura && selectedFunciones.includes(entidad.lectura.id);
            const tieneEscritura = entidad.escritura && selectedFunciones.includes(entidad.escritura.id);

            if (tieneLectura && tieneEscritura) return 'lectura_escritura';
            if (tieneLectura) return 'lectura';
            if (tieneEscritura) return 'escritura';
            return null;
        };
    }, [selectedFunciones]);

    /** Obtiene etiqueta de la opción de permiso */
    const getOpcionLabel = useMemo(() => (opcion) => {
        switch (opcion) {
            case 'lectura': return 'Solo Lectura';
            case 'escritura': return 'Solo Escritura';
            case 'lectura_escritura': return 'Lectura y Escritura';
            default: return 'Sin permiso';
        }
    }, []);

    /** Obtiene color según opción */
    const getOpcionColor = useMemo(() => (opcion) => {
        switch (opcion) {
            case 'lectura': return 'blue';
            case 'escritura': return 'green';
            case 'lectura_escritura': return 'indigo';
            default: return 'gray';
        }
    }, []);

    /** Maneja cambio de opción de permiso para una entidad completa */
    const handleOpcionEntidad = useMemo(() => {
        return (entidad, opcion) => {
            let updated = [...selectedFunciones];
            const lecturaId = entidad.lectura?.id;
            const escrituraId = entidad.escritura?.id;

            if (lecturaId) updated = updated.filter(f => f !== lecturaId);
            if (escrituraId) updated = updated.filter(f => f !== escrituraId);

            if (opcion === 'lectura' && lecturaId) {
                updated.push(lecturaId);
            } else if (opcion === 'escritura' && escrituraId) {
                updated.push(escrituraId);
            } else if (opcion === 'lectura_escritura') {
                if (lecturaId) updated.push(lecturaId);
                if (escrituraId) updated.push(escrituraId);
            }

            setSelectedFunciones(updated);
            setData('funciones', updated);
        };
    }, [selectedFunciones, setData]);

    /** Activa o desactiva una funcionalidad completa desde su checkbox. */
    const toggleEntidad = useMemo(() => {
        return (entidad) => {
            const estaSeleccionada = Boolean(getOpcionEntidad(entidad));
            handleOpcionEntidad(entidad, estaSeleccionada ? null : 'lectura_escritura');
        };
    }, [getOpcionEntidad, handleOpcionEntidad]);

    /** Determina el estado del check del módulo */
    const getModuloEstado = useMemo(() => {
        return (modulo) => {
            const entidades = agruparPorEntidad(modulo.funciones);
            let totalSeleccionadas = 0;
            let totalFunciones = 0;

            entidades.forEach(ent => {
                ent.funciones.forEach(f => {
                    totalFunciones++;
                    if (selectedFunciones.includes(f.id)) totalSeleccionadas++;
                });
            });

            if (totalSeleccionadas === 0) return 'none';
            if (totalSeleccionadas === totalFunciones) return 'all';
            return 'partial';
        };
    }, [agruparPorEntidad, selectedFunciones]);

    /** Cuenta entidades con permiso en un módulo */
    const contarPermisos = useMemo(() => {
        return (modulo) => {
            const entidades = agruparPorEntidad(modulo.funciones);
            return entidades.filter(ent => getOpcionEntidad(ent)).length;
        };
    }, [agruparPorEntidad, getOpcionEntidad]);

    /** Alterna la selección completa de un módulo */
    const toggleModuloCompleto = useMemo(() => {
        return (modulo) => {
            const estado = getModuloEstado(modulo);
            let updated = [...selectedFunciones];

            if (estado === 'all') {
                modulo.funciones.forEach(f => {
                    updated = updated.filter(id => id !== f.id);
                });
            } else {
                modulo.funciones.forEach(f => {
                    if (!updated.includes(f.id)) updated.push(f.id);
                });
            }

            setSelectedFunciones(updated);
            setData('funciones', updated);
        };
    }, [getModuloEstado, selectedFunciones, setData]);

    /** Alterna el acordeón de un módulo */
    const toggleModulo = useMemo(() => {
        return (moduloIdx) => {
            setModuloExpandido(prev => ({
                ...prev,
                [moduloIdx]: !prev[moduloIdx],
            }));
        };
    }, []);

    // ─── Acciones del modal de creación/edición ───

    const openCreateModal = () => {
        setEditingRol(null);
        setSelectedFunciones([]);
        reset();
        setData('funciones', []);
        setModuloExpandido({});
        setAnimatingFunciones(false);
        setShowModal(true);
    };

    const openEditModal = async (rol) => {
        setEditingRol(rol);
        setSelectedFunciones([]);
        setLoadingFunciones(true);
        setModuloExpandido({});
        setAnimatingFunciones(false);
        setData({
            nombre: rol.nombre,
            descripcion: rol.descripcion || '',
            funciones: [],
        });

        try {
            const response = await fetch(route('roles.funciones', rol.id));
            const result = await response.json();
            const funcionesSeleccionables = new Set(
                modulos.flatMap((modulo) =>
                    agruparPorEntidad(modulo.funciones)
                        .flatMap((entidad) => entidad.funciones.map((funcion) => funcion.id))
                )
            );
            const funcionesIds = (result.funciones || [])
                .filter((id) => funcionesSeleccionables.has(id));
            setSelectedFunciones(funcionesIds);
            setData('funciones', funcionesIds);
        } catch (error) {
            console.error('Error al cargar funciones del rol:', error);
        } finally {
            setLoadingFunciones(false);
            setTimeout(() => {
                const expandidos = {};
                modulos.forEach((mod, idx) => {
                    const entidades = agruparPorEntidad(mod.funciones);
                    const tienePermiso = entidades.some(ent => getOpcionEntidad(ent));
                    if (tienePermiso) expandidos[idx] = true;
                });
                setModuloExpandido(expandidos);
            }, 300);
        }

        setShowModal(true);
    };

    const clearAllPermisos = () => {
        setSelectedFunciones([]);
        setData('funciones', []);
        setModuloExpandido({});
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRol(null);
        setSelectedFunciones([]);
        setModuloExpandido({});
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setAnimatingFunciones(true);

        transform((formData) => ({
            ...formData,
            funciones: [...selectedFunciones],
        }));

        const options = {
            onSuccess: () => {
                setAnimatingFunciones(false);
                closeModal();
            },
            onError: (err) => {
                setAnimatingFunciones(false);
                console.error(err);
            },
            onFinish: () => setAnimatingFunciones(false),
        };

        if (editingRol) {
            put(route('roles.update', editingRol.id), options);
        } else {
            post(route('roles.store'), options);
        }
    };

    const handleDelete = (rol) => {
        if (confirm(`¿Está seguro de eliminar el rol "${rol.nombre}"?`)) {
            destroy(route('roles.destroy', rol.id));
        }
    };

    // ─── Acciones del modal de visualización de permisos ───

    const openPermisosModal = (rol) => {
        setSelectedRolForPermisos(rol);
        setAnimatingPermisos(true);

        fetch(route('roles.funciones', rol.id))
            .then(res => res.json())
            .then(result => {
                const funcionesIds = result.funciones || [];
                setSelectedFunciones(funcionesIds);
                setAnimatingPermisos(false);
            })
            .catch(error => {
                console.error('Error al cargar funciones:', error);
                setAnimatingPermisos(false);
            });

        setShowPermisosModal(true);
    };

    const closePermisosModal = () => {
        setShowPermisosModal(false);
        setSelectedRolForPermisos(null);
        setSelectedFunciones([]);
    };

    return {
        // Estados
        roles,
        modulos,
        searchTerm,
        setSearchTerm,
        rolesFiltrados,
        errors,
        processing,
        animatingFunciones,
        animatingPermisos,

        // Datos del modal
        showModal,
        editingRol,
        selectedFunciones,
        loadingFunciones,
        moduloExpandido,
        data,
        setData,

        // Datos del modal de visualización
        showPermisosModal,
        selectedRolForPermisos,

        // Acciones del modal
        openCreateModal,
        openEditModal,
        closeModal,
        handleSubmit,
        handleDelete,
        clearAllPermisos,

        // Acciones del modal de visualización
        openPermisosModal,
        closePermisosModal,

        // Utilidades de permisos
        agruparPorEntidad,
        getOpcionEntidad,
        getOpcionLabel,
        getOpcionColor,
        handleOpcionEntidad,
        toggleEntidad,
        getModuloEstado,
        contarPermisos,
        toggleModuloCompleto,
        toggleModulo,
    };
}
