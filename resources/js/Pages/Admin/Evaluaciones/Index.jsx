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
                        <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200 group">
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ModalCrear({ abierto, onClose, materias, gestiones }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id_materia: '', id_gestion_cup: '', nombre: '',
        porcentaje: '', puntaje_maximo: '100', fecha_evaluacion: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/evaluaciones', {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <Modal abierto={abierto} onClose={onClose} titulo="Nueva evaluación">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Materia *</label>
                        <select value={data.id_materia} onChange={(e) => setData('id_materia', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.id_materia ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`}>
                            <option value="">Seleccionar...</option>
                            {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                        {errors.id_materia && <p className="mt-1 text-xs text-red-500">{errors.id_materia}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Gestión CUP *</label>
                        <select value={data.id_gestion_cup} onChange={(e) => setData('id_gestion_cup', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.id_gestion_cup ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`}>
                            <option value="">Seleccionar...</option>
                            {gestiones.map((g) => <option key={g.id} value={g.id}>{g.nombre_gestion}</option>)}
                        </select>
                        {errors.id_gestion_cup && <p className="mt-1 text-xs text-red-500">{errors.id_gestion_cup}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
                    <input type="text" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.nombre ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`} />
                    {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">% *</label>
                        <div className="relative">
                            <input type="number" min="1" max="100" value={data.porcentaje} onChange={(e) => setData('porcentaje', e.target.value)}
                                className={`w-full pr-8 px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.porcentaje ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                        </div>
                        {errors.porcentaje && <p className="mt-1 text-xs text-red-500">{errors.porcentaje}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Puntaje máx. *</label>
                        <input type="number" min="1" value={data.puntaje_maximo} onChange={(e) => setData('puntaje_maximo', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.puntaje_maximo ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`} />
                        {errors.puntaje_maximo && <p className="mt-1 text-xs text-red-500">{errors.puntaje_maximo}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha *</label>
                        <input type="date" value={data.fecha_evaluacion} onChange={(e) => setData('fecha_evaluacion', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.fecha_evaluacion ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`} />
                        {errors.fecha_evaluacion && <p className="mt-1 text-xs text-red-500">{errors.fecha_evaluacion}</p>}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                    <button type="submit" disabled={processing}
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50">
                        {processing ? 'Guardando...' : 'Guardar evaluación'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function ModalEditar({ abierto, onClose, evaluacion, materias, gestiones }) {
    const { data, setData, put, processing, errors } = useForm({
        id_materia: '', id_gestion_cup: '', nombre: '', porcentaje: '', puntaje_maximo: '', fecha_evaluacion: '',
    });

    useEffect(() => {
        if (evaluacion) {
            setData({
                id_materia: evaluacion.id_materia || '',
                id_gestion_cup: evaluacion.id_gestion_cup || '',
                nombre: evaluacion.nombre || '',
                porcentaje: evaluacion.porcentaje || '',
                puntaje_maximo: evaluacion.puntaje_maximo || '',
                fecha_evaluacion: evaluacion.fecha_evaluacion || '',
            });
        }
    }, [evaluacion]);

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/evaluaciones/${evaluacion.id}`, { onSuccess: () => onClose() });
    };

    if (!evaluacion) return null;

    return (
        <Modal abierto={abierto} onClose={onClose} titulo="Editar evaluación">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Materia *</label>
                        <select value={data.id_materia} onChange={(e) => setData('id_materia', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.id_materia ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`}>
                            {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Gestión *</label>
                        <select value={data.id_gestion_cup} onChange={(e) => setData('id_gestion_cup', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.id_gestion_cup ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`}>
                            {gestiones.map((g) => <option key={g.id} value={g.id}>{g.nombre_gestion}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
                    <input type="text" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.nombre ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">% *</label>
                        <input type="number" min="1" max="100" value={data.porcentaje} onChange={(e) => setData('porcentaje', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.porcentaje ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`} />
                        {errors.porcentaje && <p className="mt-1 text-xs text-red-500">{errors.porcentaje}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Puntaje máx. *</label>
                        <input type="number" min="1" value={data.puntaje_maximo} onChange={(e) => setData('puntaje_maximo', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.puntaje_maximo ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha *</label>
                        <input type="date" value={data.fecha_evaluacion} onChange={(e) => setData('fecha_evaluacion', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.fecha_evaluacion ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`} />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
                    <button type="submit" disabled={processing}
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50">
                        {processing ? 'Actualizando...' : 'Actualizar evaluación'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function ModalDetalle({ abierto, onClose, e }) {
    if (!e) return null;
    return (
        <Modal abierto={abierto} onClose={onClose} titulo="Detalle de evaluación">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50/50 rounded-2xl p-6 mb-6 border border-violet-100/50">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-500/30">
                        {e.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                        <p className="text-lg font-bold text-slate-800">{e.nombre}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{e.materia?.nombre} — {e.gestion_cup?.nombre_gestion}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${e.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${e.estado === 'Activo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {e.estado}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-400 font-medium mb-1">Porcentaje</p>
                    <p className="text-2xl font-bold text-violet-600">{e.porcentaje}%</p>
                </div>
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-400 font-medium mb-1">Puntaje máximo</p>
                    <p className="text-2xl font-bold text-slate-800">{e.puntaje_maximo} pts</p>
                </div>
                <div className="sm:col-span-2 bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-400 font-medium mb-1">Fecha de evaluación</p>
                    <p className="text-base font-semibold text-slate-800">
                        {new Date(e.fecha_evaluacion).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
            <div className="flex justify-end pt-6 mt-4 border-t border-slate-100">
                <button onClick={onClose} className="px-6 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-slate-700/20">Cerrar</button>
            </div>
        </Modal>
    );
}

export default function EvaluacionesIndex({ evaluaciones, materias, gestiones, filtros }) {
    const { flash } = usePage().props;
    const [busqueda, setBusqueda] = useState(filtros.busqueda);
    const [filtroGestion, setFiltroGestion] = useState(filtros.id_gestion_cup);
    const [filtroMateria, setFiltroMateria] = useState(filtros.id_materia);
    const [filtroEstado, setFiltroEstado] = useState(filtros.estado);
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(null);
    const [modalDetalle, setModalDetalle] = useState(null);
    const [isDesactivarModalOpen, setIsDesactivarModalOpen] = useState(false);
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
    const [toast, setToast] = useState(null);
    const [desactivarLoading, setDesactivarLoading] = useState(false);

    useEffect(() => {
        if (flash?.success) { setToast(flash.success); setTimeout(() => setToast(null), 4000); }
    }, [flash]);

    const aplicar = (e) => {
        e.preventDefault();
        router.get('/admin/evaluaciones', { busqueda: busqueda || '', id_gestion_cup: filtroGestion || '', id_materia: filtroMateria || '', estado: filtroEstado || '' }, { preserveState: true });
    };
    const limpiar = () => { setBusqueda(''); setFiltroGestion(''); setFiltroMateria(''); setFiltroEstado(''); router.get('/admin/evaluaciones'); };

    const abrirModalDesactivar = (evaluacion) => {
        setEvaluacionSeleccionada(evaluacion);
        setIsDesactivarModalOpen(true);
    };

    const confirmarDesactivar = () => {
        if (!evaluacionSeleccionada) return;
        setDesactivarLoading(true);
        router.post(`/admin/evaluaciones/${evaluacionSeleccionada.id}/cambiar-estado`, {}, {
            preserveScroll: true,
            onFinish: () => {
                setDesactivarLoading(false);
                setIsDesactivarModalOpen(false);
                setEvaluacionSeleccionada(null);
            },
        });
    };

    const cerrarModalDesactivar = () => {
        setIsDesactivarModalOpen(false);
        setEvaluacionSeleccionada(null);
    };

    const coloresEstado = { Activo: 'bg-emerald-100 text-emerald-700 border-emerald-200', Inactivo: 'bg-red-100 text-red-700 border-red-200' };

    return (
        <AdminLayout>
            <Head title="Evaluaciones" />
            <div className="max-w-7xl mx-auto">
                {toast && (
                    <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-[slideDown_0.2s_ease-out]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                        <p className="text-sm font-medium text-emerald-700">{toast}</p>
                    </div>
                )}

                <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 p-8 shadow-xl">
                    <div className="absolute inset-0 bg-white/5" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Evaluaciones</h1>
                            <p className="mt-1 text-violet-200 text-sm">Configura las evaluaciones del CUP por materia y gestión</p>
                        </div>
                        <button onClick={() => setModalCrear(true)} className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold rounded-xl transition-all border border-white/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Nueva evaluación
                        </button>
                    </div>
                </div>

                <form onSubmit={aplicar} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Buscar</label>
                            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                        </div>
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Gestión</label>
                            <select value={filtroGestion} onChange={(e) => setFiltroGestion(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                                <option value="">Todas</option>
                                {gestiones.map((g) => <option key={g.id} value={g.id}>{g.nombre_gestion}</option>)}
                            </select>
                        </div>
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Materia</label>
                            <select value={filtroMateria} onChange={(e) => setFiltroMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                                <option value="">Todas</option>
                                {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                        </div>
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estado</label>
                            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                                <option value="">Todos</option>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2 md:col-span-4">
                            <button type="submit" className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-all">Buscar</button>
                            <button type="button" onClick={limpiar} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50">Limpiar</button>
                        </div>
                    </div>
                </form>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {evaluaciones.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <p className="text-base font-semibold text-slate-700 mb-1">No hay evaluaciones</p>
                            <p className="text-sm">Configura la primera evaluación para comenzar</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Evaluación</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Materia</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Gestión</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">%</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Puntaje</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Fecha</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Estado</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {evaluaciones.map((e) => (
                                        <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                        {e.nombre?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <p className="font-medium text-slate-800">{e.nombre}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{e.materia?.nombre || '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{e.gestion_cup?.nombre_gestion || '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-violet-100 text-violet-700 text-xs font-bold">{e.porcentaje}%</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{e.puntaje_maximo} pts</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{new Date(e.fecha_evaluacion).toLocaleDateString('es-BO')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${coloresEstado[e.estado] || ''}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${e.estado === 'Activo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {e.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setModalDetalle(e)} className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-all">Ver</button>
                                                    <button onClick={() => setModalEditar(e)} className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-lg transition-all">Editar</button>
                                                    <button onClick={() => e.estado === 'Activo' ? abrirModalDesactivar(e) : router.post(`/admin/evaluaciones/${e.id}/cambiar-estado`, {}, { preserveScroll: true })}
                                                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${e.estado === 'Activo' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}>
                                                        {e.estado === 'Activo' ? 'Desact.' : 'Activar'}
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

            <ModalCrear abierto={modalCrear} onClose={() => setModalCrear(false)} materias={materias} gestiones={gestiones} />
            <ModalEditar abierto={!!modalEditar} onClose={() => setModalEditar(null)} evaluacion={modalEditar} materias={materias} gestiones={gestiones} />
            <ModalDetalle abierto={!!modalDetalle} onClose={() => setModalDetalle(null)} e={modalDetalle} />

            {/* Modal de confirmación para desactivar */}
            {isDesactivarModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={cerrarModalDesactivar} />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-8 animate-[slideUp_0.25s_ease-out] text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">¿Desactivar esta evaluación?</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            Estás a punto de desactivar la evaluación <strong className="text-slate-700">'{evaluacionSeleccionada?.nombre}'</strong> para la materia <strong className="text-slate-700">{evaluacionSeleccionada?.materia?.nombre}</strong>. Al hacerlo, cambiará su estado a Inactivo.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={cerrarModalDesactivar}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                No, mantener activa
                            </button>
                            <button onClick={confirmarDesactivar} disabled={desactivarLoading}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-red-600/20">
                                {desactivarLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                        Desactivando...
                                    </span>
                                ) : 'Sí, desactivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}