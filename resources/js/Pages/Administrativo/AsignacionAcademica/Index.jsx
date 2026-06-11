import { useState, useMemo } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AsignacionAcademicaIndex({ asignaciones, materias, grupos, docentes, gestiones, filtros }) {
    const { props } = usePage();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        id_materia: '',
        id_grupo: '',
        id_docente: '',
        id_gestion_cup: gestiones?.[0]?.id || '',
        carga_horaria: 80,
        estado: 'Activo',
    });

    const flashMessage = props.flash?.success || props.flash?.error;

    function openCreateModal() {
        setEditing(null);
        reset();
        setData({
            id_materia: materias?.[0]?.id_materia || '',
            id_grupo: grupos?.[0]?.id || '',
            id_docente: docentes?.[0]?.id || '',
            id_gestion_cup: gestiones?.[0]?.id || '',
            carga_horaria: 80,
            estado: 'Activo',
        });
        setShowModal(true);
    }

    function openEditModal(asig) {
        setEditing(asig);
        setData({
            id_materia: asig.id_materia,
            id_grupo: asig.id_grupo,
            id_docente: asig.id_docente,
            id_gestion_cup: gestiones?.[0]?.id || '',
            carga_horaria: asig.carga_horaria,
            estado: asig.estado,
        });
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setEditing(null);
        reset();
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (editing) {
            put(route('asignaciones.update', editing.id), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        } else {
            post(route('asignaciones.store'), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        }
    }

    function handleDelete(asig) {
        if (confirm(`Eliminar asignación de ${asig.materia} - ${asig.grupo}?`)) {
            destroy(route('asignaciones.destroy', asig.id));
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

                    <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-700 p-8 shadow-xl">
                        <div className="absolute inset-0 bg-white/5"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Asignación Académica</h1>
                                <p className="mt-1 text-amber-100 text-sm">Asigne docentes a grupos y materias. El sistema valida el límite de 4 grupos por docente.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <div></div>
                        <button onClick={openCreateModal}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Asignación
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600">
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">📘 Materia</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">👥 Grupo</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">🧑‍🏫 Docente</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">⏱ Carga Horaria</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/90">📅 Horarios</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">📌 Estado</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-white/90">⚙️ Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {(asignaciones?.data || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                No hay asignaciones registradas.
                                            </td>
                                        </tr>
                                    ) : (
                                        (asignaciones?.data || []).map((asig) => (
                                            <tr key={asig.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{asig.materia}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        {asig.grupo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{asig.docente}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{asig.carga_horaria} hrs</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        asig.horarios_count > 0
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {asig.horarios_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        asig.estado === 'Activo'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>{asig.estado}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openEditModal(asig)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors mr-2">
                                                        Editar
                                                    </button>
                                                    <button onClick={() => handleDelete(asig)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
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

                    {asignaciones?.last_page > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center gap-2">
                                {Array.from({ length: asignaciones.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link key={page}
                                        href={route('asignaciones.index', { page })}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            page === asignaciones.current_page
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}>{page}</Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
                        <div className="relative inline-block w-full max-w-lg p-6 my-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {editing ? 'Editar Asignación' : 'Nueva Asignación'}
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
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white">
                                        <option value="">Seleccione materia</option>
                                        {materias.map((m) => (
                                            <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.id_materia && <p className="mt-1 text-sm text-red-600">{errors.id_materia}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grupo <span className="text-red-500">*</span></label>
                                    <select value={data.id_grupo} onChange={(e) => setData('id_grupo', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white">
                                        <option value="">Seleccione grupo</option>
                                        {grupos.map((g) => (
                                            <option key={g.id} value={g.id}>{g.sigla} - {g.turno}</option>
                                        ))}
                                    </select>
                                    {errors.id_grupo && <p className="mt-1 text-sm text-red-600">{errors.id_grupo}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Docente <span className="text-red-500">*</span></label>
                                    <select value={data.id_docente} onChange={(e) => setData('id_docente', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white">
                                        <option value="">Seleccione docente</option>
                                        {docentes.map((d) => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.id_docente && <p className="mt-1 text-sm text-red-600">{errors.id_docente}</p>}
                                </div>

                                {!editing && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gestión <span className="text-red-500">*</span></label>
                                        <select value={data.id_gestion_cup} onChange={(e) => setData('id_gestion_cup', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm dark:bg-gray-700 dark:text-white">
                                            {gestiones.map((g) => (
                                                <option key={g.id} value={g.id}>{g.nombre_gestion}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carga Horaria (horas) <span className="text-red-500">*</span></label>
                                    <input type="number" min="1" max="200" value={data.carga_horaria}
                                        onChange={(e) => setData('carga_horaria', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white" />
                                    {errors.carga_horaria && <p className="mt-1 text-sm text-red-600">{errors.carga_horaria}</p>}
                                </div>

                                {editing && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                                        <select value={data.estado} onChange={(e) => setData('estado', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:text-white">
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button type="button" onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                                    <button type="submit" disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-lg disabled:opacity-50">
                                        {processing ? 'Guardando...' : editing ? 'Actualizar' : 'Guardar Asignación'}
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
