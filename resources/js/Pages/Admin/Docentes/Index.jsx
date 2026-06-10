import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

// ─── Modal wrapper ───
function Modal({ abierto, onClose, titulo, children }) {
    if (!abierto) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─── Modal Crear ───
function ModalCrear({ abierto, onClose, usuarios }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id_usuario: '', ci: '', profesion: '', area_profesional: '',
        grado_academico: '', maestria: false, diplomado_educacion_superior: false,
        experiencia_anios: '', maximo_grupos: '0',
    });

    const handleUsuarioChange = (e) => {
        const id = e.target.value;
        const user = usuarios.find(u => u.id == id);
        if (user && user.postulacion) {
            setData({
                id_usuario: id,
                ci: user.postulacion.ci || '',
                profesion: user.postulacion.profesion || '',
                grado_academico: user.postulacion.grado_academico || '',
                experiencia_anios: user.postulacion.experiencia_anios || '',
                area_profesional: '',
                maestria: false,
                diplomado_educacion_superior: false,
                maximo_grupos: '0',
            });
        } else {
            setData('id_usuario', id);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/docentes', {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <Modal abierto={abierto} onClose={onClose} titulo="Nuevo docente">
            <form onSubmit={submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Usuario *</label>
                        <select value={data.id_usuario} onChange={handleUsuarioChange}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${errors.id_usuario ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'}`}>
                            <option value="">Seleccionar...</option>
                            {usuarios.map((u) => (
                                <option key={u.id} value={u.id}>{u.nombre} {u.apellidos} — {u.correo}</option>
                            ))}
                        </select>
                        {errors.id_usuario && <p className="mt-1 text-xs text-red-500">{errors.id_usuario}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">CI *</label>
                        <input type="text" value={data.ci} onChange={(e) => setData('ci', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.ci ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-600/20`} />
                        {errors.ci && <p className="mt-1 text-xs text-red-500">{errors.ci}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Profesión *</label>
                        <input type="text" value={data.profesion} onChange={(e) => setData('profesion', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.profesion ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-600/20`} />
                        {errors.profesion && <p className="mt-1 text-xs text-red-500">{errors.profesion}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Grado académico *</label>
                        <select value={data.grado_academico} onChange={(e) => setData('grado_academico', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.grado_academico ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-600/20`}>
                            <option value="">Seleccionar...</option>
                            <option value="Licenciatura">Licenciatura</option>
                            <option value="Diplomado">Diplomado</option>
                            <option value="Especialidad">Especialidad</option>
                            <option value="Maestría">Maestría</option>
                            <option value="Doctorado">Doctorado</option>
                        </select>
                        {errors.grado_academico && <p className="mt-1 text-xs text-red-500">{errors.grado_academico}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Experiencia (años) *</label>
                        <input type="number" min="0" value={data.experiencia_anios} onChange={(e) => setData('experiencia_anios', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.experiencia_anios ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-600/20`} />
                        {errors.experiencia_anios && <p className="mt-1 text-xs text-red-500">{errors.experiencia_anios}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Área profesional</label>
                        <input type="text" value={data.area_profesional} onChange={(e) => setData('area_profesional', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Máx. grupos</label>
                        <input type="number" min="0" value={data.maximo_grupos} onChange={(e) => setData('maximo_grupos', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.maestria} onChange={(e) => setData('maestria', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/30" />
                            <span className="text-sm text-slate-700">Maestría</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.diplomado_educacion_superior} onChange={(e) => setData('diplomado_educacion_superior', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/30" />
                            <span className="text-sm text-slate-700">Diplomado Ed. Superior</span>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button type="submit" disabled={processing}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {processing ? 'Guardando...' : 'Guardar docente'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ─── Modal Editar ───
function ModalEditar({ abierto, onClose, docente }) {
    const { data, setData, put, processing, errors } = useForm({
        ci: '', profesion: '', area_profesional: '', grado_academico: '',
        maestria: false, diplomado_educacion_superior: false,
        experiencia_anios: '', maximo_grupos: '0', telefono: '',
    });

    useEffect(() => {
        if (docente) {
            setData({
                ci: docente.ci || '',
                profesion: docente.profesion || '',
                area_profesional: docente.area_profesional || '',
                grado_academico: docente.grado_academico || '',
                maestria: docente.maestria || false,
                diplomado_educacion_superior: docente.diplomado_educacion_superior || false,
                experiencia_anios: docente.experiencia_anios || '',
                maximo_grupos: docente.maximo_grupos || '0',
                telefono: docente.usuario?.telefono || '',
            });
        }
    }, [docente]);

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/docentes/${docente.id}`, { onSuccess: () => onClose() });
    };

    if (!docente) return null;

    return (
        <Modal abierto={abierto} onClose={onClose} titulo="Editar docente">
            <div className="mb-4 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <span className="text-slate-400">Usuario: </span>
                <span className="font-medium text-slate-800">{docente.usuario?.nombre} {docente.usuario?.apellidos} ({docente.usuario?.correo})</span>
            </div>
            <form onSubmit={submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">CI *</label>
                        <input type="text" value={data.ci} onChange={(e) => setData('ci', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.ci ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-600/20`} />
                        {errors.ci && <p className="mt-1 text-xs text-red-500">{errors.ci}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Profesión *</label>
                        <input type="text" value={data.profesion} onChange={(e) => setData('profesion', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.profesion ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-600/20`} />
                        {errors.profesion && <p className="mt-1 text-xs text-red-500">{errors.profesion}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Grado académico *</label>
                        <select value={data.grado_academico} onChange={(e) => setData('grado_academico', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.grado_academico ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-600/20`}>
                            <option value="">Seleccionar...</option>
                            <option value="Licenciatura">Licenciatura</option>
                            <option value="Diplomado">Diplomado</option>
                            <option value="Especialidad">Especialidad</option>
                            <option value="Maestría">Maestría</option>
                            <option value="Doctorado">Doctorado</option>
                        </select>
                        {errors.grado_academico && <p className="mt-1 text-xs text-red-500">{errors.grado_academico}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Experiencia (años) *</label>
                        <input type="number" min="0" value={data.experiencia_anios} onChange={(e) => setData('experiencia_anios', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 ${errors.experiencia_anios ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'} focus:outline-none focus:ring-2 focus:ring-blue-600/20`} />
                        {errors.experiencia_anios && <p className="mt-1 text-xs text-red-500">{errors.experiencia_anios}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Área profesional</label>
                        <input type="text" value={data.area_profesional} onChange={(e) => setData('area_profesional', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                        <input type="text" value={data.telefono} onChange={(e) => setData('telefono', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Máx. grupos</label>
                        <input type="number" min="0" value={data.maximo_grupos} onChange={(e) => setData('maximo_grupos', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.maestria} onChange={(e) => setData('maestria', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/30" />
                            <span className="text-sm text-slate-700">Maestría</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.diplomado_educacion_superior} onChange={(e) => setData('diplomado_educacion_superior', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/30" />
                            <span className="text-sm text-slate-700">Diplomado Ed. Superior</span>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button type="submit" disabled={processing}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {processing ? 'Actualizando...' : 'Actualizar docente'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ─── Modal Detalle ───
function ModalDetalle({ abierto, onClose, docente, onCambiarEstado }) {
    if (!docente) return null;
    return (
        <Modal abierto={abierto} onClose={onClose} titulo="Detalle del docente">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center text-lg font-bold">
                    {docente.usuario?.nombre?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                    <p className="text-lg font-bold text-slate-800">{docente.usuario?.nombre} {docente.usuario?.apellidos}</p>
                    <p className="text-sm text-slate-400">{docente.usuario?.correo}</p>
                </div>
                <span className={`ml-auto inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full border ${docente.usuario?.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                    {docente.usuario?.estado}
                </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
                <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Datos del usuario</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">Teléfono</span><span className="font-medium text-slate-800">{docente.usuario?.telefono || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Rol</span><span className="font-medium text-slate-800">{docente.usuario?.rol?.nombre || '—'}</span></div>
                    </div>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Datos profesionales</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">CI</span><span className="font-medium text-slate-800 font-mono">{docente.ci}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Profesión</span><span className="font-medium text-slate-800">{docente.profesion}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Área</span><span className="font-medium text-slate-800">{docente.area_profesional || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Experiencia</span><span className="font-medium text-slate-800">{docente.experiencia_anios} años</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Grado</span><span className="font-medium text-slate-800">{docente.grado_academico}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Maestría</span><span className={`font-medium ${docente.maestria ? 'text-emerald-600' : 'text-slate-400'}`}>{docente.maestria ? 'Sí' : 'No'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Diplomado</span><span className={`font-medium ${docente.diplomado_educacion_superior ? 'text-emerald-600' : 'text-slate-400'}`}>{docente.diplomado_educacion_superior ? 'Sí' : 'No'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Máx. grupos</span><span className="font-medium text-slate-800">{docente.maximo_grupos}</span></div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                <button onClick={onClose} className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cerrar</button>
            </div>
        </Modal>
    );
}

// ─── Página principal ───
export default function DocentesIndex({ docentes, filtros, usuarios }) {
    const { flash } = usePage().props;
    const [busqueda, setBusqueda] = useState(filtros.busqueda);
    const [estado, setEstado] = useState(filtros.estado);
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(null);
    const [modalDetalle, setModalDetalle] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            setTimeout(() => setToast(null), 3600);
        }
    }, [flash]);

    const aplicar = (e) => { e.preventDefault(); router.get('/admin/docentes', { busqueda: busqueda || '', estado: estado || '' }, { preserveState: true }); };
    const limpiar = () => { setBusqueda(''); setEstado(''); router.get('/admin/docentes'); };

    const cambiarEstado = (docente) => {
        if (confirm(`¿${docente.usuario?.estado === 'Activo' ? 'Desactivar' : 'Activar'} a ${docente.usuario?.nombre}?`)) {
            router.post(`/admin/docentes/${docente.id}/cambiar-estado`, {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Docentes" />
            <div className="max-w-7xl mx-auto">
                {toast && (
                    <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                        <p className="text-sm font-medium text-emerald-700">{toast}</p>
                    </div>
                )}

                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-3 rounded-2xl text-white">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div><h1 className="text-2xl font-bold text-slate-800 tracking-tight">Docentes</h1><p className="text-sm text-slate-500 mt-1">Gestión de perfiles docentes</p></div>
                    </div>
                    <button onClick={() => setModalCrear(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nuevo docente
                    </button>
                </div>

                <form onSubmit={aplicar} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Buscar</label>
                            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, correo o CI..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div><label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estado</label>
                            <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos</option><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Buscar</button>
                            <button type="button" onClick={limpiar} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50">Limpiar</button>
                        </div>
                    </div>
                </form>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {docentes.data.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
                            </div>
                            <p className="text-base font-semibold text-slate-700 mb-1">No hay docentes registrados</p>
                            <p className="text-sm">Crea un nuevo perfil docente para comenzar</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Docente</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">CI</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Profesión</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Grado</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Estado</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {docentes.data.map((d) => (
                                        <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {d.usuario?.nombre?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{d.usuario?.nombre} {d.usuario?.apellidos}</p>
                                                        <p className="text-xs text-slate-400">{d.usuario?.correo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-xs">{d.ci}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{d.profesion}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{d.grado_academico}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full border ${d.usuario?.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                                    {d.usuario?.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setModalDetalle(d)} className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">Ver</button>
                                                    <button onClick={() => setModalEditar(d)} className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium rounded-lg transition-colors">Editar</button>
                                                    <button onClick={() => cambiarEstado(d)}
                                                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${d.usuario?.estado === 'Activo' ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'}`}>
                                                        {d.usuario?.estado === 'Activo' ? 'Desact.' : 'Activar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {docentes.links && docentes.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-xs text-slate-500">Mostrando {docentes.from}-{docentes.to} de {docentes.total}</p>
                            <div className="flex gap-1">
                                {docentes.links.map((link, idx) => (
                                    <Link key={idx} href={link.url || '#'} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            <ModalCrear abierto={modalCrear} onClose={() => setModalCrear(false)} usuarios={usuarios} />
            <ModalDetalle abierto={!!modalDetalle} onClose={() => setModalDetalle(null)} docente={modalDetalle} />
            <ModalEditar abierto={!!modalEditar} onClose={() => setModalEditar(null)} docente={modalEditar} />
        </AdminLayout>
    );
}