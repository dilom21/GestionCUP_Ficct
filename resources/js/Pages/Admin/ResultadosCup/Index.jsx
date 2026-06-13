import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

function ModalDetalle({ abierto, onClose, inscripcion }) {
    if (!inscripcion) return null;

    const coloresNota = (nota) => {
        if (nota >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (nota >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-[slideUp_0.25s_ease-out]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{inscripcion.postulante?.nombre} {inscripcion.postulante?.apellidos}</h2>
                            <p className="text-xs text-slate-400">{inscripcion.postulante?.ci} — Grupo: {inscripcion.grupo} — Turno: {inscripcion.turno}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all group">
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Evaluaciones */}
                <div className="space-y-6">
                    {inscripcion.evaluaciones?.map((evalItem, idx) => (
                        <div key={idx} className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    {evalItem.nombre}
                                    <span className="text-[10px] font-normal text-slate-400 ml-1">({evalItem.porcentaje}%)</span>
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {evalItem.materias?.map((mat, i) => (
                                    <div key={i} className={`rounded-xl border px-3 py-2.5 text-center ${coloresNota(mat.nota)}`}>
                                        <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">{mat.materia}</p>
                                        <p className="text-lg font-bold mt-0.5">{mat.nota}</p>
                                    </div>
                                ))}
                            </div>
                            {evalItem.materias?.length > 0 && (
                                <div className="mt-3 text-right">
                                    <span className="text-xs text-slate-400">
                                        Promedio: <strong className="text-slate-700">
                                            {(evalItem.materias.reduce((s, m) => s + m.nota, 0) / evalItem.materias.length).toFixed(2)}
                                        </strong>
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Resultado */}
                {inscripcion.resultado ? (
                    <div className={`mt-6 rounded-2xl p-5 border ${inscripcion.resultado.estado_resultado === 'Aprobado' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${inscripcion.resultado.estado_resultado === 'Aprobado' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {inscripcion.resultado.estado_resultado === 'Aprobado' ? (
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ) : (
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                )}
                            </div>
                            <div>
                                <p className={`text-lg font-bold ${inscripcion.resultado.estado_resultado === 'Aprobado' ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {inscripcion.resultado.estado_resultado}
                                </p>
                                <p className="text-sm text-slate-500 mt-0.5">{inscripcion.resultado.observacion}</p>
                            </div>
                            {inscripcion.resultado.estado_resultado === 'Aprobado' && (
                                <span className="ml-auto text-3xl font-bold text-emerald-600">{inscripcion.resultado.promedio_general}</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
                        <p className="text-sm text-slate-400">Aún no se ha calculado el resultado.</p>
                        <button onClick={() => {
                            router.post(`/admin/resultados-cup/${inscripcion.id}/calcular`, {}, { preserveScroll: true });
                            onClose();
                        }} className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all">
                            Calcular resultado
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ResultadosCupIndex({ inscripciones }) {
    const { flash } = usePage().props;
    const [modalDetalle, setModalDetalle] = useState(null);
    const [toast, setToast] = useState(null);
    const [calculandoTodos, setCalculandoTodos] = useState(false);

    useEffect(() => {
        if (flash?.success) { setToast(flash.success); setTimeout(() => setToast(null), 4000); }
    }, [flash]);

    const coloresResultado = {
        Aprobado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Reprobado: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <AdminLayout>
            <Head title="Resultados CUP" />
            <div className="max-w-7xl mx-auto">
                {toast && (
                    <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-[slideDown_0.2s_ease-out]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-sm font-medium text-emerald-700">{toast}</p>
                    </div>
                )}

                <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-xl">
                    <div className="absolute inset-0 bg-white/5" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Resultados CUP</h1>
                            <p className="mt-1 text-blue-200 text-sm">Visualiza las notas y calcula los resultados del Curso Preuniversitario</p>
                        </div>
                        <button onClick={() => {
                            if (confirm('¿Calcular resultados de TODOS los postulantes con notas?')) {
                                setCalculandoTodos(true);
                                router.post('/admin/resultados-cup/calcular-todos', {}, {
                                    preserveScroll: true,
                                    onFinish: () => setCalculandoTodos(false),
                                });
                            }
                        }} disabled={calculandoTodos}
                            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold rounded-xl transition-all border border-white/20 disabled:opacity-50">
                            {calculandoTodos ? (
                                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Calculando...</>
                            ) : 'Calcular todos'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {inscripciones.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7" /></svg>
                            </div>
                            <p className="text-base font-semibold text-slate-700 mb-1">No hay postulantes inscritos</p>
                            <p className="text-sm">Los postulantes aparecerán aquí una vez que se inscriban al CUP</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Postulante</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">CI</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Grupo</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Turno</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Estado</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {inscripciones.map((ins) => (
                                        <tr key={ins.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                        {ins.postulante?.nombre?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{ins.postulante?.nombre} {ins.postulante?.apellidos}</p>
                                                        <p className="text-xs text-slate-400">{ins.postulante?.correo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-xs">{ins.postulante?.ci}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{ins.grupo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{ins.turno}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {ins.resultado ? (
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${coloresResultado[ins.resultado.estado_resultado] || ''}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${ins.resultado.estado_resultado === 'Aprobado' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                        {ins.resultado.estado_resultado}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                        Sin calcular
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setModalDetalle(ins)} className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all">Ver notas</button>
                                                    {!ins.resultado && (
                                                        <button onClick={() => router.post(`/admin/resultados-cup/${ins.id}/calcular`, {}, { preserveScroll: true })}
                                                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-lg transition-all">Calcular</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ModalDetalle abierto={!!modalDetalle} onClose={() => setModalDetalle(null)} inscripcion={modalDetalle} />
        </AdminLayout>
    );
}