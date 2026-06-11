import { useState, useMemo } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function GruposIndex({ grupos, gestiones, filtros }) {
    const { props } = usePage();
    const [showModal, setShowModal] = useState(false);
    const [editingGrupo, setEditingGrupo] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filtros?.busqueda || '');
    const [filterTurno, setFilterTurno] = useState(filtros?.turno || '');
    const [filterGestion, setFilterGestion] = useState(filtros?.id_gestion_cup || '');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        id_gestion_cup: gestiones?.[0]?.id || '',
        sigla: '',
        cupo_maximo: 80,
        turno: 'Mañana',
        modalidad: 'Presencial',
        estado: 'Activo',
    });

    const filteredGrupos = useMemo(() => {
        let items = grupos?.data || [];
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            items = items.filter(
                (g) =>
                    g.sigla.toLowerCase().includes(term) ||
                    g.turno.toLowerCase().includes(term)
            );
        }
        return items;
    }, [grupos, searchTerm]);

    function openCreateModal() {
        setEditingGrupo(null);
        reset();
        setData({
            id_gestion_cup: gestiones?.[0]?.id || '',
            sigla: '',
            cupo_maximo: 80,
            turno: 'Mañana',
            modalidad: 'Presencial',
            estado: 'Activo',
        });
        setShowModal(true);
    }

    function openEditModal(grupo) {
        setEditingGrupo(grupo);
        setData({
            id_gestion_cup: grupo.id_gestion_cup,
            sigla: grupo.sigla,
            cupo_maximo: grupo.cupo_maximo,
            turno: grupo.turno,
            modalidad: grupo.modalidad,
            estado: grupo.estado,
        });
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setEditingGrupo(null);
        reset();
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (editingGrupo) {
            put(route('grupos.update', editingGrupo.id), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        } else {
            post(route('grupos.store'), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        }
    }

    function handleDelete(grupo) {
        if (confirm(`Eliminar el grupo "${grupo.sigla}"?`)) {
            destroy(route('grupos.destroy', grupo.id));
        }
    }

    function handleGenerar() {
        if (!confirm('Se generarán grupos automáticamente según los postulantes habilitados. ¿Continuar?')) return;
        post(route('grupos.generar'), {
            id_gestion_cup: filterGestion || undefined,
        });
    }

    const flashMessage = props.flash?.success || props.flash?.error;

    return (
        <AdminLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Flash Message */}
                    {flashMessage && (
                        <div
                            className={`mb-6 px-5 py-3 rounded-xl text-sm font-medium shadow-sm border ${
                                props.flash.success
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300'
                                    : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {props.flash.success ? (
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <span>{flashMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Hero Header */}
                    <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 p-8 shadow-xl">
                        <div className="absolute inset-0 bg-white/5"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-fuchsia-400/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex items-center gap-6">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    Gestión de Grupos
                                </h1>
                                <p className="mt-1 text-purple-100 text-sm max-w-xl">
                                    Administre los grupos del CUP. Genere grupos automáticamente según postulantes habilitados por turno.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filtros + Acciones */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-56">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por sigla..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <select
                                value={filterTurno}
                                onChange={(e) => setFilterTurno(e.target.value)}
                                className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Todos los turnos</option>
                                <option value="Mañana">Mañana</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Noche">Noche</option>
                            </select>
                            <select
                                value={filterGestion}
                                onChange={(e) => setFilterGestion(e.target.value)}
                                className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Todas las gestiones</option>
                                {gestiones.map((g) => (
                                    <option key={g.id} value={g.id}>{g.nombre_gestion}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleGenerar}
                                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Generar Grupos
                            </button>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nuevo Grupo
                            </button>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sigla</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Turno</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cupo Máx.</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gestión</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredGrupos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <p className="text-sm font-medium">
                                                        {searchTerm ? 'No se encontraron grupos' : 'No hay grupos registrados'}
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        {searchTerm ? 'Intente con otro término.' : 'Genere grupos automáticamente o cree uno manualmente.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredGrupos.map((grupo) => (
                                            <tr key={grupo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                                                        {grupo.sigla}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{grupo.turno}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{grupo.cupo_maximo} estudiantes</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{grupo.gestion || '-'}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        grupo.estado === 'Activo'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                        {grupo.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(grupo)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors mr-2"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(grupo)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginación */}
                    {grupos?.last_page > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center gap-2">
                                {Array.from({ length: grupos.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={route('grupos.index', { page, turno: filterTurno, id_gestion_cup: filterGestion })}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            page === grupos.current_page
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" onClick={closeModal} />

                        <div className="relative inline-block w-full max-w-md p-6 my-8 text-left bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {editingGrupo ? 'Editar Grupo' : 'Nuevo Grupo'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {!editingGrupo && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Gestión <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.id_gestion_cup}
                                            onChange={(e) => setData('id_gestion_cup', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            {gestiones.map((g) => (
                                                <option key={g.id} value={g.id}>{g.nombre_gestion}</option>
                                            ))}
                                        </select>
                                        {errors.id_gestion_cup && <p className="mt-1 text-sm text-red-600">{errors.id_gestion_cup}</p>}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Sigla <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.sigla}
                                            onChange={(e) => setData('sigla', e.target.value.toUpperCase())}
                                            className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase ${
                                                errors.sigla ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Ej: MA"
                                        />
                                        {errors.sigla && <p className="mt-1 text-sm text-red-600">{errors.sigla}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Cupo Máximo <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.cupo_maximo}
                                            onChange={(e) => setData('cupo_maximo', e.target.value)}
                                            className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                errors.cupo_maximo ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.cupo_maximo && <p className="mt-1 text-sm text-red-600">{errors.cupo_maximo}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Turno <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.turno}
                                            onChange={(e) => setData('turno', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="Mañana">Mañana</option>
                                            <option value="Tarde">Tarde</option>
                                            <option value="Noche">Noche</option>
                                        </select>
                                        {errors.turno && <p className="mt-1 text-sm text-red-600">{errors.turno}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Modalidad
                                        </label>
                                        <select
                                            value={data.modalidad}
                                            onChange={(e) => setData('modalidad', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="Presencial">Presencial</option>
                                            <option value="Virtual">Virtual</option>
                                            <option value="Semipresencial">Semipresencial</option>
                                        </select>
                                    </div>
                                </div>

                                {editingGrupo && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Estado
                                        </label>
                                        <select
                                            value={data.estado}
                                            onChange={(e) => setData('estado', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Guardando...' : editingGrupo ? 'Actualizar Grupo' : 'Guardar Grupo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
