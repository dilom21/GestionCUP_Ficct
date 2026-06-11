import { useState, useMemo } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function HorariosIndex({ horarios, asignaciones, aulas, filtros }) {
    const { props } = usePage();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        id_asignacion_academica: '',
        id_aula: '',
        dia_semana: 'Lunes',
        horario_inicio: '07:00',
        horario_fin: '08:00',
    });

    const flashMessage = props.flash?.success || props.flash?.error;

    const filteredHorarios = useMemo(() => {
        let items = horarios?.data || [];
        if (filtros?.dia_semana) {
            items = items.filter(h => h.dia_semana === filtros.dia_semana);
        }
        if (filtros?.id_asignacion_academica) {
            items = items.filter(h => h.id_asignacion_academica === parseInt(filtros.id_asignacion_academica));
        }
        return items;
    }, [horarios, filtros]);

    function openCreateModal() {
        setEditing(null);
        reset();
        setData({
            id_asignacion_academica: asignaciones?.[0]?.id || '',
            id_aula: aulas?.[0]?.id || '',
            dia_semana: 'Lunes',
            horario_inicio: '07:00',
            horario_fin: '08:00',
        });
        setShowModal(true);
    }

    function openEditModal(h) {
        setEditing(h);
        setData({
            id_asignacion_academica: h.id_asignacion_academica,
            id_aula: h.id_aula,
            dia_semana: h.dia_semana,
            horario_inicio: h.horario_inicio,
            horario_fin: h.horario_fin,
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
            put(route('horarios.update', editing.id), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        } else {
            post(route('horarios.store'), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        }
    }

    function handleDelete(h) {
        if (confirm(`Eliminar horario ${h.dia_semana} ${h.horario_inicio}-${h.horario_fin}?`)) {
            destroy(route('horarios.destroy', h.id));
        }
    }

    function getErrors() {
        return props.errors || {};
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

                    {props.errors?.error && (
                        <div className="mb-6 px-5 py-3 rounded-xl text-sm font-medium shadow-sm border bg-red-50 border-red-200 text-red-800">
                            {props.errors.error}
                        </div>
                    )}

                    <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 shadow-xl">
                        <div className="absolute inset-0 bg-white/5"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Horarios</h1>
                                <p className="mt-1 text-indigo-100 text-sm">Gestione los horarios con validación estricta de cruces de aula, grupo y docente.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-3">
                            <select value={filtros.dia_semana} onChange={(e) => {
                                const params = new URLSearchParams(window.location.search);
                                params.set('dia_semana', e.target.value);
                                window.location.href = route('horarios.index') + '?' + params.toString();
                            }}
                                className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm shadow-sm dark:bg-gray-700 dark:text-white">
                                <option value="">Todos los días</option>
                                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <button onClick={openCreateModal}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Horario
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">📆 Día</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">⏰ Horario</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">📖 Materia / Grupo</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">🧑‍🏫 Docente</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/90">🏫 Aula</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-white/90">⚙️ Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredHorarios.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No hay horarios registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredHorarios.map((h) => (
                                            <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                        {h.dia_semana}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {h.horario_inicio} - {h.horario_fin}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{h.materia}</span>
                                                    <span className="text-xs text-gray-500 ml-2">({h.grupo})</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{h.docente}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                                                        {h.aula}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openEditModal(h)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors mr-2">
                                                        Editar
                                                    </button>
                                                    <button onClick={() => handleDelete(h)}
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

                    {horarios?.last_page > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center gap-2">
                                {Array.from({ length: horarios.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link key={page}
                                        href={route('horarios.index', { page, dia_semana: filtros.dia_semana })}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            page === horarios.current_page
                                                ? 'bg-indigo-600 text-white'
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
                                    {editing ? 'Editar Horario' : 'Nuevo Horario'}
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {!editing && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignación Académica <span className="text-red-500">*</span></label>
                                        <select value={data.id_asignacion_academica} onChange={(e) => setData('id_asignacion_academica', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                                            <option value="">Seleccione asignación</option>
                                            {asignaciones.map((a) => (
                                                <option key={a.id} value={a.id}>{a.label}</option>
                                            ))}
                                        </select>
                                        {errors.id_asignacion_academica && <p className="mt-1 text-sm text-red-600">{errors.id_asignacion_academica}</p>}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aula <span className="text-red-500">*</span></label>
                                        <select value={data.id_aula} onChange={(e) => setData('id_aula', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                                            <option value="">Seleccione aula</option>
                                            {aulas.map((a) => (
                                                <option key={a.id} value={a.id}>{a.codigo} - {a.nombre} (cap: {a.capacidad_maxima})</option>
                                            ))}
                                        </select>
                                        {errors.id_aula && <p className="mt-1 text-sm text-red-600">{errors.id_aula}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Día <span className="text-red-500">*</span></label>
                                        <select value={data.dia_semana} onChange={(e) => setData('dia_semana', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                                            {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        {errors.dia_semana && <p className="mt-1 text-sm text-red-600">{errors.dia_semana}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Inicio <span className="text-red-500">*</span></label>
                                        <input type="time" value={data.horario_inicio} onChange={(e) => setData('horario_inicio', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
                                        {errors.horario_inicio && <p className="mt-1 text-sm text-red-600">{errors.horario_inicio}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Fin <span className="text-red-500">*</span></label>
                                        <input type="time" value={data.horario_fin} onChange={(e) => setData('horario_fin', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
                                        {errors.horario_fin && <p className="mt-1 text-sm text-red-600">{errors.horario_fin}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button type="button" onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                                    <button type="submit" disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg disabled:opacity-50">
                                        {processing ? 'Validando...' : editing ? 'Actualizar Horario' : 'Guardar Horario'}
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
