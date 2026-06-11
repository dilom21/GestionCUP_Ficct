import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

function Modal({ abierto, onClose, titulo, children }) {
    if (!abierto) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-[slideUp_0.25s_ease-out]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200 group">
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ModalDetalle({ abierto, onClose, p }) {
    if (!p) return null;
    return (
        <Modal abierto={abierto} onClose={onClose} titulo="Detalle del postulante">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl p-6 mb-6 border border-emerald-200/50">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/30">
                        {p.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                        <p className="text-xl font-bold text-slate-800">{p.nombre} {p.apellidos}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{p.correo}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${p.estado_usuario === 'Activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${p.estado_usuario === 'Activo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {p.estado_usuario}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Datos personales
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-medium">CI</span>
                            <span className="text-sm font-semibold text-slate-800 font-mono">{p.ci}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-medium">Teléfono</span>
                            <span className="text-sm font-semibold text-slate-800">{p.telefono || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-medium">Dirección</span>
                            <span className="text-sm font-semibold text-slate-800 text-right max-w-[180px]">{p.direccion || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-medium">Ciudad</span>
                            <span className="text-sm font-semibold text-slate-800">{p.ciudad || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-medium">Colegio</span>
                            <span className="text-sm font-semibold text-slate-800 text-right max-w-[180px]">{p.colegio_procedencia || '—'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" /></svg>
                        Postulación
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-medium">Turno</span>
                            <span className="text-sm font-semibold text-slate-800">{p.turno || '—'}</span>
                        </div>
                        <div className="px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-400 font-medium">Opción 1</span>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Primera</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{p.carrera1 || '—'} {p.carrera1_sigla && <span className="text-[10px] text-blue-500 ml-1 font-normal">({p.carrera1_sigla})</span>}</span>
                        </div>
                        <div className="px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-400 font-medium">Opción 2</span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Segunda</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{p.carrera2 || '—'} {p.carrera2_sigla && <span className="text-[10px] text-slate-500 ml-1 font-normal">({p.carrera2_sigla})</span>}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 mt-4 border-t border-slate-100">
                <button onClick={onClose} className="px-6 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-slate-700/20">
                    Cerrar
                </button>
            </div>
        </Modal>
    );
}

function ModalEditar({ abierto, onClose, postulante }) {
    const { data, setData, put, processing, errors } = useForm({
        telefono: '', direccion: '', ciudad: '', colegio_procedencia: '',
    });

    useEffect(() => {
        if (postulante) {
            setData({
                telefono: postulante.telefono || '',
                direccion: postulante.direccion || '',
                ciudad: postulante.ciudad || '',
                colegio_procedencia: postulante.colegio_procedencia || '',
            });
        }
    }, [postulante]);

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/postulantes-gestion/${postulante.id}`, { onSuccess: () => onClose() });
    };

    if (!postulante) return null;

    return (
        <Modal abierto={abierto} onClose={onClose} titulo="Editar postulante">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl p-5 mb-6 border border-blue-100/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-blue-500/20">
                        {postulante.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <p className="text-base font-bold text-slate-800">{postulante.nombre} {postulante.apellidos}</p>
                        <p className="text-xs text-slate-400">{postulante.correo}</p>
                    </div>
                    <span className={`ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${postulante.estado_usuario === 'Activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${postulante.estado_usuario === 'Activo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {postulante.estado_usuario}
                    </span>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <input type="text" value={data.telefono} onChange={(e) => setData('telefono', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ciudad</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <input type="text" value={data.ciudad} onChange={(e) => setData('ciudad', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all" />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dirección</label>
                        <textarea rows="2" value={data.direccion} onChange={(e) => setData('direccion', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all resize-none" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Colegio de procedencia</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <input type="text" value={data.colegio_procedencia} onChange={(e) => setData('colegio_procedencia', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                        Cancelar
                    </button>
                    <button type="submit" disabled={processing}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                Guardando...
                            </span>
                        ) : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default function PostulantesGestionIndex({ postulantes }) {
    const { flash } = usePage().props;
    const [modalDetalle, setModalDetalle] = useState(null);
    const [modalEditar, setModalEditar] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            setTimeout(() => setToast(null), 4000);
        }
    }, [flash]);

    const cambiarEstado = (p) => {
        if (confirm(`¿${p.estado_usuario === 'Activo' ? 'Desactivar' : 'Activar'} a ${p.nombre}?`)) {
            router.post(`/admin/postulantes-gestion/${p.id}/cambiar-estado`, {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Gestión de Postulantes" />
            <div className="max-w-7xl mx-auto">
                {toast && (
                    <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-[slideDown_0.2s_ease-out]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-sm font-medium text-emerald-700">{toast}</p>
                    </div>
                )}

                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div><h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión de Postulantes</h1><p className="text-sm text-slate-500 mt-1">Postulantes que completaron su proceso de inscripción</p></div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {postulantes.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7" /></svg>
                            </div>
                            <p className="text-base font-semibold text-slate-700 mb-1">No hay postulantes registrados</p>
                            <p className="text-sm">Los postulantes aparecerán aquí una vez que completen su pago e inscripción</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Postulante</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">CI</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Carreras</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Turno</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Estado</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {postulantes.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
                                                        {p.nombre?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{p.nombre} {p.apellidos}</p>
                                                        <p className="text-xs text-slate-400">{p.correo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-xs">{p.ci}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block w-fit">1: {p.carrera1 || '—'}</span>
                                                    <span className="text-[10px] font-medium text-slate-500">2: {p.carrera2 || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-block text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{p.turno || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${p.estado_usuario === 'Activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${p.estado_usuario === 'Activo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {p.estado_usuario}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setModalDetalle(p)} className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                                                        Ver
                                                    </button>
                                                    <button onClick={() => setModalEditar(p)} className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-xs font-medium rounded-lg transition-all duration-200">
                                                        Editar
                                                    </button>
                                                    <button onClick={() => cambiarEstado(p)}
                                                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${p.estado_usuario === 'Activo' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}>
                                                        {p.estado_usuario === 'Activo' ? 'Desact.' : 'Activar'}
                                                    </button>
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

            <ModalDetalle abierto={!!modalDetalle} onClose={() => setModalDetalle(null)} p={modalDetalle} />
            <ModalEditar abierto={!!modalEditar} onClose={() => setModalEditar(null)} postulante={modalEditar} />
        </AdminLayout>
    );
}