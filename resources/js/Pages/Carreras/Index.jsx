import { useState, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function CarrerasIndex({ carreras }) {
    const { props } = usePage();
    const [showModal, setShowModal] = useState(false);
    const [editingCarrera, setEditingCarrera] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        sigla: '',
        nombre: '',
    });

    // Filtro rápido en cliente
    const filteredCarreras = useMemo(() => {
        if (!searchTerm.trim()) return carreras;
        const term = searchTerm.toLowerCase();
        return carreras.filter(
            (c) =>
                c.sigla.toLowerCase().includes(term) ||
                c.nombre.toLowerCase().includes(term)
        );
    }, [carreras, searchTerm]);

    function openCreateModal() {
        setEditingCarrera(null);
        reset();
        setShowModal(true);
    }

    function openEditModal(carrera) {
        setEditingCarrera(carrera);
        setData({
            sigla: carrera.sigla,
            nombre: carrera.nombre,
        });
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setEditingCarrera(null);
        reset();
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (editingCarrera) {
            put(route('carreras.update', editingCarrera.id_carrera), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        } else {
            post(route('carreras.store'), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        }
    }

    function handleDelete(carrera) {
        if (confirm(`¿Está seguro de eliminar la carrera "${carrera.sigla} - ${carrera.nombre}"?`)) {
            destroy(route('carreras.destroy', carrera.id_carrera));
        }
    }

    const flashMessage = props.flash?.success || props.flash?.error;

    return (
        <AdminLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* ─── Flash Message ─── */}
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

                    {/* ─── Hero Header ─── */}
                    <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-8 shadow-xl">
                        <div className="absolute inset-0 bg-white/5"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-violet-400/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex items-center gap-6">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    Gestión de Carreras
                                </h1>
                                <p className="mt-1 text-indigo-100 text-sm max-w-xl">
                                    Administre las carreras de la FICCT. Gestión de siglas, nombres y configuración base del sistema de cupos.
                                </p>
                            </div>
                        </div>
                        <div className="absolute bottom-3 right-8 opacity-20">
                            <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>

                    {/* ─── Barra de búsqueda + botón ─── */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full sm:w-72">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por sigla o nombre..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Carrera
                        </button>
                    </div>

                    {/* ─── Tabla ─── */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Sigla
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredCarreras.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <p className="text-sm font-medium">
                                                        {searchTerm ? 'No se encontraron carreras' : 'No hay carreras registradas'}
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        {searchTerm ? 'Intente con otro término de búsqueda.' : 'Cree una nueva carrera para comenzar.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCarreras.map((carrera) => (
                                            <tr key={carrera.id_carrera} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                        {carrera.sigla}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {carrera.nombre}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(carrera)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors mr-2"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(carrera)}
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
                </div>
            </div>

            {/* ─── Modal ─── */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" onClick={closeModal} />

                        <div className="relative inline-block w-full max-w-md p-6 my-8 text-left bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {editingCarrera ? 'Editar Carrera' : 'Nueva Carrera'}
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
                                {/* Sigla */}
                                <div>
                                    <label htmlFor="sigla" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Sigla <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="sigla"
                                        type="text"
                                        value={data.sigla}
                                        onChange={(e) => setData('sigla', e.target.value.toUpperCase())}
                                        maxLength={3}
                                        className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase ${
                                            errors.sigla ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Ej: INF"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Máximo 3 caracteres</p>
                                    {errors.sigla && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sigla}</p>
                                    )}
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
                                        className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                            errors.nombre ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Ej: Ingeniería Informática"
                                    />
                                    {errors.nombre && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
                                    )}
                                </div>

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
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Guardando...' : editingCarrera ? 'Actualizar Carrera' : 'Guardar Carrera'}
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