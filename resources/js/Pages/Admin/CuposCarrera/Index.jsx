import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

function Modal({ abierto, onClose, titulo, children }) {
    if (!abierto) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-[slideUp_0.25s_ease-out]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all group">
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ModalEditar({ abierto, onClose, cupo, gestiones }) {
    const { data, setData, put, processing, errors } = useForm({
        id_gestion_cup: '', id_carrera: '', cantidad_cupos: '',
    });

    useEffect(() => {
        if (cupo) {
            setData({
                id_gestion_cup: cupo.id_gestion_cup || '',
                id_carrera: cupo.id_carrera || '',
                cantidad_cupos: cupo.cantidad_cupos || '',
            });
        }
    }, [cupo]);

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/cupos-carrera/${cupo.id_gestion_cup}/${cupo.id_carrera}`, {
            data: { cantidad_cupos: data.cantidad_cupos },
            onSuccess: () => onClose(),
        });
    };

    if (!cupo) return null;

    return (
        <Modal abierto={abierto} onClose={onClose} titulo="Editar cupos">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50/50 rounded-2xl p-5 mb-6 border border-teal-100/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-teal-500/20">
                        {cupo.carrera?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <p className="text-base font-bold text-slate-800">{cupo.carrera} ({cupo.carrera_sigla})</p>
                        <p className="text-xs text-slate-400">{cupo.gestion}</p>
                    </div>
                </div>
            </div>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cupos disponibles *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <input type="number" min="0" value={data.cantidad_cupos} onChange={(e) => setData('cantidad_cupos', e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.cantidad_cupos ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-teal-500/30`} />
                    </div>
                    {errors.cantidad_cupos && <p className="mt-1 text-xs text-red-500">{errors.cantidad_cupos}</p>}
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500">Actualmente ocupados:</span>
                    <span className="text-sm font-bold text-slate-700">{cupo.cupos_ocupados}</span>
                    <span className="text-xs text-slate-400">de</span>
                    <span className="text-sm font-bold text-teal-600">{cupo.cantidad_cupos}</span>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
                    <button type="submit" disabled={processing}
                        className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50">
                        {processing ? 'Actualizando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function ModalCrear({ abierto, onClose, gestiones, carreras }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id_gestion_cup: '', id_carrera: '', cantidad_cupos: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/cupos-carrera', {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <Modal abierto={abierto} onClose={onClose} titulo="Nuevos cupos por carrera">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Gestión CUP *</label>
                        <select value={data.id_gestion_cup} onChange={(e) => setData('id_gestion_cup', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.id_gestion_cup ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-teal-500/30`}>
                            <option value="">Seleccionar...</option>
                            {gestiones.map((g) => <option key={g.id} value={g.id}>{g.nombre_gestion}</option>)}
                        </select>
                        {errors.id_gestion_cup && <p className="mt-1 text-xs text-red-500">{errors.id_gestion_cup}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Carrera *</label>
                        <select value={data.id_carrera} onChange={(e) => setData('id_carrera', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.id_carrera ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-teal-500/30`}>
                            <option value="">Seleccionar...</option>
                            {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre} ({c.sigla})</option>)}
                        </select>
                        {errors.id_carrera && <p className="mt-1 text-xs text-red-500">{errors.id_carrera}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Cupos disponibles *</label>
                    <input type="number" min="0" value={data.cantidad_cupos} onChange={(e) => setData('cantidad_cupos', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.cantidad_cupos ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-teal-500/30`} />
                    {errors.cantidad_cupos && <p className="mt-1 text-xs text-red-500">{errors.cantidad_cupos}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
                    <button type="submit" disabled={processing}
                        className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50">
                        {processing ? 'Guardando...' : 'Guardar cupos'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default function CuposCarreraIndex({ cupos, gestiones, carreras, filtros }) {
    const { flash } = usePage().props;
    const [busqueda, setBusqueda] = useState(filtros.busqueda);
    const [filtroGestion, setFiltroGestion] = useState(filtros.id_gestion_cup);
    const [filtroEstado, setFiltroEstado] = useState(filtros.estado);
    const [modalEditar, setModalEditar] = useState(null);
    const [modalCrear, setModalCrear] = useState(false);
    const [isDesactivarModalOpen, setIsDesactivarModalOpen] = useState(false);
    const [cupoSeleccionado, setCupoSeleccionado] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) { setToast(flash.success); setTimeout(() => setToast(null), 4000); }
    }, [flash]);

    const aplicar = (e) => {
        e.preventDefault();
        router.get('/admin/cupos-carrera', { busqueda: busqueda || '', id_gestion_cup: filtroGestion || '', estado: filtroEstado || '' }, { preserveState: true });
    };
    const limpiar = () => { setBusqueda(''); setFiltroGestion(''); setFiltroEstado(''); router.get('/admin/cupos-carrera'); };

    const coloresEstado = { Activo: 'bg-emerald-100 text-emerald-700 border-emerald-200', Inactivo: 'bg-red-100 text-red-700 border-red-200' };

    return (
        <AdminLayout>
            <Head title="Cupos por Carrera" />
            <div className="max-w-7xl mx-auto">
                {toast && (
                    <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-[slideDown_0.2s_ease-out]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                        <p className="text-sm font-medium text-emerald-700">{toast}</p>
                    </div>
                )}

                <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 p-8 shadow-xl">
                    <div className="absolute inset-0 bg-white/5" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Cupos por Carrera</h1>
                            <p className="mt-1 text-teal-200 text-sm">Gestiona los cupos disponibles por carrera para cada gestión del CUP</p>
                        </div>
                        <button onClick={() => setModalCrear(true)} className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold rounded-xl transition-all border border-white/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Nuevos cupos
                        </button>
                    </div>
                </div>

                <form onSubmit={aplicar} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Buscar</label>
                            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre de carrera..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
                        </div>
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Gestión</label>
                            <select value={filtroGestion} onChange={(e) => setFiltroGestion(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                                <option value="">Todas</option>
                                {gestiones.map((g) => <option key={g.id} value={g.id}>{g.nombre_gestion}</option>)}
                            </select>
                        </div>
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estado</label>
                            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                                <option value="">Todos</option>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2 md:col-span-3">
                            <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all">Buscar</button>
                            <button type="button" onClick={limpiar} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50">Limpiar</button>
                        </div>
                    </div>
                </form>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {cupos.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" /></svg>
                            </div>
                            <p className="text-base font-semibold text-slate-700 mb-1">No hay cupos configurados</p>
                            <p className="text-sm">Configura los cupos para cada carrera y gestión</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Carrera</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Gestión</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Cupos</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Ocupados</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Disponibles</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Estado</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {cupos.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                        {c.carrera?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{c.carrera}</p>
                                                        <p className="text-xs text-slate-400">{c.carrera_sigla}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{c.gestion}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-teal-100 text-teal-700 text-xs font-bold">{c.cantidad_cupos}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{c.cupos_ocupados}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${(c.cantidad_cupos - c.cupos_ocupados) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {c.cantidad_cupos - c.cupos_ocupados}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${coloresEstado[c.estado] || ''}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${c.estado === 'Activo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {c.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setModalEditar(c)} className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-all">Editar</button>
                                                    <button onClick={() => {
                                                        setCupoSeleccionado(c);
                                                        setIsDesactivarModalOpen(true);
                                                    }}
                                                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${c.estado === 'Activo' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}>
                                                        {c.estado === 'Activo' ? 'Desact.' : 'Activar'}
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

            {/* Modal desactivar */}
            {isDesactivarModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setIsDesactivarModalOpen(false); setCupoSeleccionado(null); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-8 animate-[slideUp_0.25s_ease-out] text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">¿Desactivar estos cupos?</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            Estás a punto de desactivar los cupos de <strong className="text-slate-700">{cupoSeleccionado?.carrera}</strong> para la gestión <strong className="text-slate-700">{cupoSeleccionado?.gestion}</strong>. Al hacerlo, cambiará su estado a Inactivo.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => { setIsDesactivarModalOpen(false); setCupoSeleccionado(null); }}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">No, mantener activo</button>
                            <button onClick={() => {
                                router.post(`/admin/cupos-carrera/${cupoSeleccionado.id_gestion_cup}/${cupoSeleccionado.id_carrera}/cambiar-estado`, {}, {
                                    preserveScroll: true,
                                    onFinish: () => { setIsDesactivarModalOpen(false); setCupoSeleccionado(null); },
                                });
                            }}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-red-600/20">
                                Sí, desactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ModalEditar abierto={!!modalEditar} onClose={() => setModalEditar(null)} cupo={modalEditar} gestiones={gestiones} />
            <ModalCrear abierto={modalCrear} onClose={() => setModalCrear(false)} gestiones={gestiones} carreras={carreras} />
        </AdminLayout>
    );
}