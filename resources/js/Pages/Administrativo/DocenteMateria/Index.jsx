import { useState, useMemo } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function DocenteMateriaIndex({ docentes, materias, filtros }) {
    const { props } = usePage();
    const [showModal, setShowModal] = useState(false);
    const [selectedDocente, setSelectedDocente] = useState(null);

    const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        id_docente: '',
        id_materia: '',
    });

    const flashMessage = props.flash?.success || props.flash?.error;

    function openAssignModal(docente) {
        setSelectedDocente(docente);
        setData({
            id_docente: docente.id,
            id_materia: materias?.[0]?.id_materia || '',
        });
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setSelectedDocente(null);
        reset();
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(route('docentes.materias.store'), {
            onSuccess: () => closeModal(),
            onError: () => {},
        });
    }

    function handleRemove(docenteId, materiaId, materiaNombre) {
        if (confirm(`Desasignar la materia "${materiaNombre}" del docente?`)) {
            destroy(route('docentes.materias.destroy', [docenteId, materiaId]));
        }
    }

    return (
        <AdminLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {flashMessage && (
                        <div className={`mb-6 px-5 py-3 rounded-xl text-sm font-medium shadow-sm border ${
                            props.flash.success
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            <span>{flashMessage}</span>
                        </div>
                    )}

                    <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 p-8 shadow-xl">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold text-white tracking-tight">Materias por Docente</h1>
                            <p className="mt-1 text-orange-100 text-sm">Gestione qué materias puede impartir cada docente. Solo docentes con materias asignadas pueden recibir asignaciones académicas.</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600">
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">🧑‍🏫 Docente</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">🆔 CI</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">📚 Materias Asignadas</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-white/90">⚙️ Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {(docentes?.data || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No hay docentes registrados.</td>
                                        </tr>
                                    ) : (
                                        (docentes?.data || []).map((d) => (
                                            <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{d.nombre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{d.ci}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {d.materias.length === 0 ? (
                                                            <span className="text-xs text-gray-400">Sin materias asignadas</span>
                                                        ) : (
                                                            d.materias.map((m) => (
                                                                <span key={m.id_materia} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                                                    {m.nombre}
                                                                    <button onClick={() => handleRemove(d.id, m.id_materia, m.nombre)}
                                                                        className="ml-1 text-orange-400 hover:text-red-600">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </span>
                                                            ))
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button onClick={() => openAssignModal(d)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors text-sm font-medium">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        Asignar Materia
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {docentes?.last_page > 1 && (
                        <div className="mt-6 flex justify-center">
                            {Array.from({ length: docentes.last_page }, (_, i) => i + 1).map((page) => (
                                <Link key={page} href={route('docentes.materias.index', { page })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium mx-1 ${
                                        page === docentes.current_page
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}>{page}</Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
                        <div className="relative inline-block w-full max-w-md p-6 my-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Asignar Materia a {selectedDocente?.nombre}
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Materia <span className="text-red-500">*</span></label>
                                    <select value={data.id_materia} onChange={(e) => setData('id_materia', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white">
                                        <option value="">Seleccione materia</option>
                                        {materias.map((m) => (
                                            <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.id_materia && <p className="mt-1 text-sm text-red-600">{errors.id_materia}</p>}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button type="button" onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                                    <button type="submit" disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg disabled:opacity-50">
                                        {processing ? 'Asignando...' : 'Asignar Materia'}
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
