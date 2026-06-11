import { useState, useMemo } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const PERIODOS = [
    { key: 'dia', label: 'Hoy' },
    { key: 'semana', label: 'Esta Semana' },
    { key: 'mes', label: 'Este Mes' },
];

const ESTADOS_ESTUDIANTE = ['', 'Presente', 'Ausente', 'Tardanza', 'Sin registrar'];
const ESTADOS_DOCENTE = ['', 'Presente', 'Ausente'];

export default function AdminAsistencia({ tab, asistencias, filtros, grupos, materias, docentes }) {
    const { props } = usePage();
    const flashMessage = props.flash?.success || props.flash?.error;

    const isEstudiante = tab === 'estudiante';

    const [fechaInicio, setFechaInicio] = useState(filtros.fecha_inicio || '');
    const [fechaFin, setFechaFin] = useState(filtros.fecha_fin || '');

    function aplicarFiltros(nuevosFiltros) {
        const params = { tab, ...filtros, ...nuevosFiltros };

        if (params.periodo === 'rango' && fechaInicio && fechaFin) {
            params.fecha_inicio = fechaInicio;
            params.fecha_fin = fechaFin;
        } else if (params.periodo !== 'rango') {
            params.fecha_inicio = undefined;
            params.fecha_fin = undefined;
        }

        if (!params.id_grupo) params.id_grupo = undefined;
        if (!params.id_materia) params.id_materia = undefined;
        if (!params.id_docente) params.id_docente = undefined;
        if (!params.estado) params.estado = undefined;

        router.get(route('admin.asistencia.index'), params, { preserveState: true, replace: true });
    }

    function cambiarTab(nuevoTab) {
        router.get(route('admin.asistencia.index'), { tab: nuevoTab }, { preserveState: false, replace: true });
    }

    function irPagina(page) {
        const params = { tab, ...filtros };
        params.page = page;
        router.get(route('admin.asistencia.index'), params, { preserveState: true, replace: true });
    }

    const totalRegistros = asistencias?.total || 0;
    const data = asistencias?.data || [];

    const resumen = useMemo(() => {
        if (!data.length) return { presente: 0, ausente: 0, tardanza: 0 };
        return {
            presente: data.filter((d) => d.estado === 'Presente').length,
            ausente: data.filter((d) => d.estado === 'Ausente').length,
            tardanza: data.filter((d) => d.estado === 'Tardanza').length,
        };
    }, [data]);

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

                    <div className="relative overflow-hidden mb-8 rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-8 shadow-xl">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold text-white tracking-tight">Asistencia y Control</h1>
                            <p className="mt-1 text-emerald-100 text-sm">
                                Visualice y filtre la asistencia de docentes y estudiantes por período, grupo, materia y más.
                            </p>
                        </div>
                    </div>

                    {/* ── Tabs ─────────────────────────────────────── */}
                    <div className="flex gap-3 mb-6">
                        <button onClick={() => cambiarTab('docente')}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                !isEstudiante
                                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}>
                            👨‍🏫 Asistencia Docente
                        </button>
                        <button onClick={() => cambiarTab('estudiante')}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                isEstudiante
                                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}>
                            👤 Asistencia Estudiantes
                        </button>
                    </div>

                    {/* ── Filtros ──────────────────────────────────── */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Período</label>
                                <div className="flex gap-1.5 flex-wrap">
                                    {PERIODOS.map((p) => (
                                        <button key={p.key}
                                            onClick={() => aplicarFiltros({ periodo: p.key })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                filtros.periodo === p.key
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}>
                                            {p.label}
                                        </button>
                                    ))}
                                    <button onClick={() => aplicarFiltros({ periodo: 'rango' })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            filtros.periodo === 'rango'
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}>
                                        Rango
                                    </button>
                                </div>
                                {filtros.periodo === 'rango' && (
                                    <div className="flex gap-2 mt-2">
                                        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs" />
                                        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs" />
                                        <button onClick={() => aplicarFiltros({})}
                                            className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium">Ir</button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Grupo</label>
                                <select value={filtros.id_grupo || ''} onChange={(e) => aplicarFiltros({ id_grupo: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">Todos los grupos</option>
                                    {grupos.map((g) => (
                                        <option key={g.id} value={g.id}>{g.sigla} - {g.turno}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Materia</label>
                                <select value={filtros.id_materia || ''} onChange={(e) => aplicarFiltros({ id_materia: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">Todas las materias</option>
                                    {materias.map((m) => (
                                        <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Docente</label>
                                <select value={filtros.id_docente || ''} onChange={(e) => aplicarFiltros({ id_docente: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">Todos los docentes</option>
                                    {docentes.map((d) => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Estado</label>
                                <select value={filtros.estado || ''} onChange={(e) => aplicarFiltros({ estado: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">Todos los estados</option>
                                    {(isEstudiante ? ESTADOS_ESTUDIANTE : ESTADOS_DOCENTE).map((e) => (
                                        e ? <option key={e} value={e}>{e}</option> : null
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ── Resumen ──────────────────────────────────── */}
                    {data.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-emerald-700">{resumen.presente}</p>
                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Presente</p>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-red-700">{resumen.ausente}</p>
                                <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Ausente</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-amber-700">{resumen.tardanza}</p>
                                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Tardanza</p>
                            </div>
                        </div>
                    )}

                    {/* ── Tabla ────────────────────────────────────── */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                {totalRegistros} registro{totalRegistros !== 1 ? 's' : ''} encontrados
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gradient-to-r from-emerald-600 to-green-600">
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">Fecha</th>
                                        {isEstudiante ? (
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">Estudiante</th>
                                        ) : (
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">Docente</th>
                                        )}
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">Materia</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">Grupo</th>
                                        {isEstudiante ? (
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">Docente</th>
                                        ) : (
                                            <>
                                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">Entrada</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">Salida</th>
                                            </>
                                        )}
                                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/90">Estado</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/90">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {data.length === 0 ? (
                                        <tr>
                                            <td colSpan={isEstudiante ? 8 : 9} className="px-4 py-12 text-center text-gray-500">
                                                No se encontraron registros de asistencia para los filtros seleccionados.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.map((row, i) => (
                                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{i + 1}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{row.fecha}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                                    {isEstudiante ? row.estudiante : row.docente}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{row.materia}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        {row.grupo}
                                                    </span>
                                                </td>
                                                {isEstudiante ? (
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{row.docente}</td>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{row.hora_entrada || '—'}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{row.hora_salida || '—'}</td>
                                                    </>
                                                )}
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        row.estado === 'Presente' ? 'bg-emerald-100 text-emerald-800' :
                                                        row.estado === 'Ausente' ? 'bg-red-100 text-red-800' :
                                                        row.estado === 'Tardanza' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {row.estado}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-gray-400">
                                                    {row.tipo_registro || '—'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Paginación ───────────────────────────────── */}
                    {asistencias?.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Página {asistencias.current_page} de {asistencias.last_page}
                            </p>
                            <div className="flex gap-2">
                                {Array.from({ length: Math.min(asistencias.last_page, 10) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button key={page} onClick={() => irPagina(page)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                page === asistencias.current_page
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}>
                                            {page}
                                        </button>
                                    );
                                })}
                                {asistencias.last_page > 10 && (
                                    <span className="px-2 py-1.5 text-sm text-gray-400">...</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
