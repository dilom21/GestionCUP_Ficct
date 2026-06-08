import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

export default function PostulacionesPostulantesIndex({ postulaciones, filtros }) {
    const [busqueda, setBusqueda] = useState(filtros.busqueda);
    const [estado, setEstado] = useState(filtros.estado);

    const aplicarFiltros = (e) => { e.preventDefault(); router.get('/admin/postulaciones-postulantes', { busqueda: busqueda || '', estado: estado || '' }, { preserveState: true }); };
    const limpiarFiltros = () => { setBusqueda(''); setEstado(''); router.get('/admin/postulaciones-postulantes'); };

    const colores = { 'Pendiente': 'bg-amber-100 text-amber-700 border-amber-200', 'Observado': 'bg-orange-100 text-orange-700 border-orange-200', 'Rechazado': 'bg-red-100 text-red-700 border-red-200', 'Aprobado': 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    const formatearFecha = (f) => { if (!f) return '—'; const d = new Date(f); return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };

    return (
        <AdminLayout>
            <Head title="Postulaciones de Postulantes" />
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                    <div className="bg-slate-800 p-3 rounded-2xl text-white">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" /></svg>
                    </div>
                    <div><h1 className="text-2xl font-bold text-slate-800 tracking-tight">Postulaciones de Postulantes</h1><p className="text-sm text-slate-500 mt-1">Revisa las postulaciones recibidas de estudiantes</p></div>
                </div>

                <form onSubmit={aplicarFiltros} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Buscar</label><input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nro. formulario..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estado</label>
                            <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos</option><option value="Pendiente">Pendiente</option><option value="Observado">Observado</option><option value="Rechazado">Rechazado</option><option value="Aprobado">Aprobado</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Buscar</button>
                            <button type="button" onClick={limpiarFiltros} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50">Limpiar</button>
                        </div>
                    </div>
                </form>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {postulaciones.data.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7" /></svg>
                            </div>
                            <p className="text-base font-semibold text-slate-700 mb-1">No hay postulaciones</p>
                            <p className="text-sm">Prueba ajustando los filtros</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Postulante</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Nro. Formulario</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Carreras</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Fecha</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Estado</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {postulaciones.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                                        {p.postulante?.nombre?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm">{p.postulante?.nombre || '—'} {p.postulante?.apellidos || ''}</p>
                                                        <p className="text-[10px] text-slate-400">{p.postulante?.ci || ''}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span className="font-mono text-xs font-medium text-slate-800">{p.nro_formulario}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-medium text-blue-700">1: {p.carrera1?.nombre || '—'}</span>
                                                    <span className="text-[10px] font-medium text-slate-500">2: {p.carrera2?.nombre || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{formatearFecha(p.fecha_postulacion)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full border ${colores[p.estado_postulacion] || 'bg-slate-100 text-slate-700'}`}>{p.estado_postulacion}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link href={`/admin/postulaciones-postulantes/${p.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                                                    Ver detalle<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {postulaciones.links && postulaciones.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-xs text-slate-500">Mostrando {postulaciones.from}-{postulaciones.to} de {postulaciones.total}</p>
                            <div className="flex gap-1">
                                {postulaciones.links.map((link, idx) => (
                                    <Link key={idx} href={link.url || '#'} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}