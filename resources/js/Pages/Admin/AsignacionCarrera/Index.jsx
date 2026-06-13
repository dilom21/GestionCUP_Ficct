import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

export default function AsignacionCarreraIndex({ gestiones, gestionId, aprobados, resumenCupos, carreras }) {
    const { flash } = usePage().props;
    const [tabActivo, setTabActivo] = useState('resumen');
    const [gestionSel, setGestionSel] = useState(gestionId || '');
    const [toast, setToast] = useState(null);
    const [ejecutando, setEjecutando] = useState(false);
    const [modalConfirmar, setModalConfirmar] = useState(false);

    useEffect(() => {
        if (flash?.success) { setToast(flash.success); setTimeout(() => setToast(null), 5000); }
    }, [flash]);

    const cambiarGestion = (id) => {
        setGestionSel(id);
        router.get('/admin/asignacion-carrera', { id_gestion_cup: id }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title="Asignar Estudiantes a Carrera" />
            <div className="max-w-7xl mx-auto">
                {toast && (
                    <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-[slideDown_0.2s_ease-out]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-sm font-medium text-emerald-700">{toast}</p>
                    </div>
                )}

                <div className="relative overflow-hidden mb-8 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-8 shadow-xl">
                    <div className="absolute inset-0 bg-white/5" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white tracking-tight">Asignar Estudiantes a Carrera</h1>
                                    <p className="mt-1 text-orange-200 text-sm">Asigna automáticamente a los aprobados según su orden de mérito y preferencias</p>
                                </div>
                            </div>
                            <select value={gestionSel} onChange={(e) => cambiarGestion(e.target.value)}
                                className="px-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-white/30">
                                <option value="" className="text-slate-800">Seleccionar gestión...</option>
                                {gestiones.map((g) => <option key={g.id} value={g.id} className="text-slate-800">{g.nombre_gestion}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8">
                    <button onClick={() => setTabActivo('resumen')}
                        className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${tabActivo === 'resumen' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        📊 Vista General
                    </button>
                    <button onClick={() => setTabActivo('ranking')}
                        className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${tabActivo === 'ranking' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        👥 Ranking de Estudiantes
                    </button>
                </div>

                {/* Tab: Vista General */}
                {tabActivo === 'resumen' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800">Resumen de cupos por carrera</h2>
                                <p className="text-sm text-slate-400 mt-1">Demanda actual vs cupos disponibles</p>
                            </div>
                            {resumenCupos.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <p className="text-sm">No hay cupos configurados para esta gestión. Configúralos en "Gestión de Cupos por Carrera" primero.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Carrera</th>
                                                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] text-center">Cupos</th>
                                                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] text-center">Ocupados</th>
                                                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] text-center">Libres</th>
                                                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] text-center">Demanda Op1</th>
                                                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] text-center">Demanda Op2</th>
                                                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] text-center">Admitidos</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {resumenCupos.map((c, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xs font-bold">{c.sigla?.charAt(0) || '?'}</div>
                                                            <span className="font-medium text-slate-800">{c.carrera} ({c.sigla})</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center"><span className="inline-flex px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-bold">{c.cupos_totales}</span></td>
                                                    <td className="px-6 py-4 text-center text-slate-600 text-xs">{c.cupos_ocupados}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${c.cupos_libres > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{c.cupos_libres}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${c.demanda_op1 > c.cupos_totales ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{c.demanda_op1}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-slate-600 text-xs">{c.demanda_op2}</td>
                                                    <td className="px-6 py-4 text-center"><span className="inline-flex px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold">{c.admitidos}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Total de aprobados: <strong className="text-slate-800">{aprobados.length}</strong></p>
                                    <p className="text-xs text-slate-400 mt-0.5">La asignación se realiza por orden de mérito (mejor nota primero)</p>
                                </div>
                                <button
                                    onClick={() => setModalConfirmar(true)}
                                    disabled={aprobados.length === 0 || ejecutando}
                                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                                    {ejecutando ? (
                                        <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Asignando...</>
                                    ) : (
                                        <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Ejecutar asignación por mérito</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Ranking de Estudiantes */}
                {tabActivo === 'ranking' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Ranking de estudiantes aprobados</h2>
                                <p className="text-sm text-slate-400 mt-1">{aprobados.length} estudiantes ordenados por nota</p>
                            </div>
                            <button
                                onClick={() => setModalConfirmar(true)}
                                disabled={aprobados.length === 0 || ejecutando}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
                                Asignar todos
                            </button>
                        </div>
                        {aprobados.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7" /></svg>
                                </div>
                                <p className="text-sm">No hay estudiantes aprobados para esta gestión.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200">
                                            <th className="px-4 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">#</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Estudiante</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Nota</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Opción 1</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Opción 2</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Asignación</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {aprobados.map((a, idx) => (
                                            <tr key={a.id_resultado} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{a.ranking}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                                                            {a.nombre?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <span className="font-medium text-slate-800">{a.nombre}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">{a.nota}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{a.opcion_1 || '—'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{a.opcion_2 || '—'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {a.asignado ? (
                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            {a.asignado.carrera} ({a.asignado.tipo})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                            Sin asignar
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {!a.asignado && (
                                                        <button onClick={() => {
                                                            router.post(`/admin/asignacion-carrera/${a.id_resultado}/asignar`, {}, {
                                                                preserveScroll: true,
                                                            });
                                                        }} className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-all">
                                                            Asignar ▶
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal confirmar asignación masiva */}
            {modalConfirmar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalConfirmar(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-8 animate-[slideUp_0.25s_ease-out] text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">¿Ejecutar asignación por mérito?</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-2">
                            Se asignarán <strong className="text-slate-700">{aprobados.length} estudiantes</strong> según su orden de nota:
                        </p>
                        <ul className="text-xs text-slate-500 space-y-1 mb-6 text-left bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Prioridad a opción 1</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Si no hay cupo, a opción 2</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Si no, a carrera con cupo libre</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Si todo está lleno, queda pendiente</li>
                        </ul>
                        <div className="flex gap-3">
                            <button onClick={() => setModalConfirmar(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                            <button onClick={() => {
                                setEjecutando(true);
                                setModalConfirmar(false);
                                router.post('/admin/asignacion-carrera/ejecutar', { id_gestion_cup: gestionSel }, {
                                    preserveScroll: true,
                                    onFinish: () => setEjecutando(false),
                                });
                            }}
                                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-600/20">
                                Sí, ejecutar asignación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}