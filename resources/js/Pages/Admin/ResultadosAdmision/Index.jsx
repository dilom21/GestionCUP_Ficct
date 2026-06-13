import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

function ModalDetalle({ abierto, onClose, a }) {
    if (!a) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 animate-[slideUp_0.25s_ease-out]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-800">Detalle de admisión</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all group">
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50/50 rounded-2xl p-5 mb-6 border border-indigo-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-500/30">
                            {a.nombre?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                            <p className="text-lg font-bold text-slate-800">{a.postulante}</p>
                            <p className="text-xs text-slate-400 mt-0.5">CI: {a.ci}</p>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border mt-2 ${a.estado === 'Admitido' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${a.estado === 'Admitido' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                {a.estado}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Orden mérito</p>
                            <p className="text-2xl font-bold text-indigo-600">#{a.orden_merito}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-400 font-medium mb-1">Promedio final</p>
                        <p className="text-xl font-bold text-slate-800">{a.promedio}</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-400 font-medium mb-1">Carrera asignada</p>
                        <p className="text-base font-bold text-slate-800">{a.carrera_asignada}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{a.tipo_asignacion?.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-400 font-medium mb-1">Opción 1</p>
                        <p className="text-sm font-semibold text-slate-700">{a.opcion_1}</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-400 font-medium mb-1">Opción 2</p>
                        <p className="text-sm font-semibold text-slate-700">{a.opcion_2}</p>
                    </div>
                </div>

                <div className="flex justify-end pt-6 mt-4 border-t border-slate-100">
                    <button onClick={onClose} className="px-6 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-slate-700/20">Cerrar</button>
                </div>
            </div>
        </div>
    );
}

export default function ResultadosAdmisionIndex({ admisiones, gestiones, carreras, filtros }) {
    const { flash } = usePage().props;
    const [busqueda, setBusqueda] = useState(filtros.busqueda);
    const [filtroGestion, setFiltroGestion] = useState(filtros.id_gestion_cup);
    const [filtroCarrera, setFiltroCarrera] = useState(filtros.id_carrera);
    const [filtroEstado, setFiltroEstado] = useState(filtros.estado_admision);
    const [modalDetalle, setModalDetalle] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) { setToast(flash.success); setTimeout(() => setToast(null), 4000); }
    }, [flash]);

    const aplicar = (e) => {
        e.preventDefault();
        router.get('/admin/resultados-admision', {
            busqueda: busqueda || '', id_gestion_cup: filtroGestion || '', id_carrera: filtroCarrera || '', estado_admision: filtroEstado || '',
        }, { preserveState: true });
    };
    const limpiar = () => {
        setBusqueda(''); setFiltroGestion(''); setFiltroCarrera(''); setFiltroEstado('');
        router.get('/admin/resultados-admision');
    };

    const coloresEstado = { Admitido: 'bg-emerald-100 text-emerald-700 border-emerald-200', Pendiente: 'bg-amber-100 text-amber-700 border-amber-200' };
    const tiposAsignacion = { OPCION_1: 'Op 1', OPCION_2: 'Op 2', REASIGNADO: 'Reasig.', PENDIENTE_CUPO: 'Pend.' };

    return (
        <AdminLayout>
            <Head title="Resultados de Admisión" />
            <div className="max-w-7xl mx-auto">
                {toast && (
                    <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-[slideDown_0.2s_ease-out]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                        <p className="text-sm font-medium text-emerald-700">{toast}</p>
                    </div>
                )}

                <div className="relative overflow-hidden mb-8 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-8 shadow-xl">
                    <div className="absolute inset-0 bg-white/5" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Resultados de Admisión</h1>
                            <p className="mt-1 text-indigo-200 text-sm">Consulta los resultados finales de asignación de carreras</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={aplicar} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Buscar</label>
                            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre o CI..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Gestión</label>
                            <select value={filtroGestion} onChange={(e) => setFiltroGestion(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                <option value="">Todas</option>
                                {gestiones.map((g) => <option key={g.id} value={g.id}>{g.nombre_gestion}</option>)}
                            </select>
                        </div>
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Carrera</label>
                            <select value={filtroCarrera} onChange={(e) => setFiltroCarrera(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                <option value="">Todas</option>
                                {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estado</label>
                            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                <option value="">Todos</option>
                                <option value="Admitido">Admitido</option>
                                <option value="Pendiente">Pendiente</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2 md:col-span-4">
                            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all">Buscar</button>
                            <button type="button" onClick={limpiar} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50">Limpiar</button>
                        </div>
                    </div>
                </form>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {admisiones.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-base font-semibold text-slate-700 mb-1">No hay resultados de admisión</p>
                            <p className="text-sm">Ejecuta la asignación de estudiantes primero</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">#</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Postulante</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">CI</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Promedio</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Carrera asignada</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Tipo</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Estado</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {admisiones.map((a, idx) => (
                                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4"><span className="text-xs font-bold text-indigo-600">#{a.orden_merito}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
                                                        {a.nombre?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="font-medium text-slate-800">{a.postulante}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-xs">{a.ci}</td>
                                            <td className="px-6 py-4"><span className="inline-flex px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">{a.promedio}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{a.carrera_asignada}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{tiposAsignacion[a.tipo_asignacion] || a.tipo_asignacion}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${coloresEstado[a.estado] || ''}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${a.estado === 'Admitido' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    {a.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button onClick={() => setModalDetalle(a)} className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-all">Ver</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ModalDetalle abierto={!!modalDetalle} onClose={() => setModalDetalle(null)} a={modalDetalle} />
        </AdminLayout>
    );
}