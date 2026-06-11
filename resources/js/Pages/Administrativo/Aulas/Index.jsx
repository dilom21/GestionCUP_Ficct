import { useState, useMemo } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AulasIndex({ aulas, filtros }) {
    const { props } = usePage();
    const [showModal, setShowModal] = useState(false);
    const [editingAula, setEditingAula] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filtros?.busqueda || '');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        codigo: '',
        nombre: '',
        capacidad_maxima: '',
        ubicacion: '',
        estado: 'Activo',
    });

    // Filtro rápido en cliente
    const filteredAulas = useMemo(() => {
        if (!searchTerm.trim()) return aulas?.data || [];
        const term = searchTerm.toLowerCase();
        return (aulas?.data || []).filter(
            (a) =>
                a.codigo.toLowerCase().includes(term) ||
                a.nombre.toLowerCase().includes(term) ||
                (a.ubicacion && a.ubicacion.toLowerCase().includes(term))
        );
    }, [aulas, searchTerm]);

    function openCreateModal() {
        setEditingAula(null);
        reset();
        setShowModal(true);
    }

    function openEditModal(aula) {
        setEditingAula(aula);
        setData({
            codigo: aula.codigo,
            nombre: aula.nombre,
            capacidad_maxima: aula.capacidad_maxima,
            ubicacion: aula.ubicacion || '',
            estado: aula.estado,
        });
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setEditingAula(null);
        reset();
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (editingAula) {
            put(route('aulas.update', editingAula.id), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        } else {
            post(route('aulas.store'), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        }
    }

    function handleDelete(aula) {
        if (confirm(`Eliminar el aula "${aula.codigo} - ${aula.nombre}"?`)) {
            destroy(route('aulas.destroy', aula.id));
        }
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
                    <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-700 p-8 shadow-xl">
                        <div className="absolute inset-0 bg-white/5"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex items-center gap-6">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    Gestión de Aulas
                                </h1>
                                <p className="mt-1 text-emerald-100 text-sm max-w-xl">
                                    Administre la infraestructura física de la FICCT. Registre aulas, su capacidad y ubicación.
                                </p>
                            </div>
                        </div>
                        <div className="absolute bottom-3 right-8 opacity-20">
                            <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>

                    {/* Barra de búsqueda + botón */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full sm:w-72">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por código, nombre o ubicación..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Aula
                        </button>
                    </div>

                    {/* Tabla */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Capacidad</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ubicación</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredAulas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <p className="text-sm font-medium">
                                                        {searchTerm ? 'No se encontraron aulas' : 'No hay aulas registradas'}
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        {searchTerm ? 'Intente con otro término de búsqueda.' : 'Cree una nueva aula para comenzar.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAulas.map((aula) => (
                                            <tr key={aula.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                                                        {aula.codigo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{aula.nombre}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{aula.capacidad_maxima} personas</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{aula.ubicacion || '-'}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        aula.estado === 'Activo'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                        {aula.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(aula)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors mr-2"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(aula)}
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
                    {aulas?.last_page > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center gap-2">
                                {Array.from({ length: aulas.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={route('aulas.index', { page })}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            page === aulas.current_page
                                                ? 'bg-teal-600 text-white'
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
                                    {editingAula ? 'Editar Aula' : 'Nueva Aula'}
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
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Código */}
                                    <div>
                                        <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Código <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="codigo"
                                            type="text"
                                            value={data.codigo}
                                            onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                            className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase ${
                                                errors.codigo ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Ej: 101"
                                        />
                                        {errors.codigo && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.codigo}</p>}
                                    </div>

                                    {/* Capacidad Máxima */}
                                    <div>
                                        <label htmlFor="capacidad_maxima" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Capacidad <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="capacidad_maxima"
                                            type="number"
                                            min="1"
                                            value={data.capacidad_maxima}
                                            onChange={(e) => setData('capacidad_maxima', e.target.value)}
                                            className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                errors.capacidad_maxima ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Ej: 80"
                                        />
                                        {errors.capacidad_maxima && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.capacidad_maxima}</p>}
                                    </div>
                                </div>

                                {/* Nombre */}
                                <div>
                                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="nombre"
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                            errors.nombre ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Ej: Aula 101 - Edificio A"
                                    />
                                    {errors.nombre && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>}
                                </div>

                                {/* Ubicación */}
                                <div>
                                    <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Ubicación / Pabellón
                                    </label>
                                    <input
                                        id="ubicacion"
                                        type="text"
                                        value={data.ubicacion}
                                        onChange={(e) => setData('ubicacion', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Ej: Pabellón A, 1er piso"
                                    />
                                </div>

                                {editingAula && (
                                    <div>
                                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Estado
                                        </label>
                                        <select
                                            id="estado"
                                            value={data.estado}
                                            onChange={(e) => setData('estado', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
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
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Guardando...' : editingAula ? 'Actualizar Aula' : 'Guardar Aula'}
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
