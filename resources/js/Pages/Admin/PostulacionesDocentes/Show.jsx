import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

function RequisitoRow({ requisito, onCambio }) {
    const [estado, setEstado] = useState(requisito.estado || 'Pendiente');
    const [observacion, setObservacion] = useState(requisito.observacion || '');

    const coloresEstado = {
        Pendiente: 'bg-amber-100 text-amber-700',
        Cumple: 'bg-emerald-100 text-emerald-700',
        'No cumple': 'bg-red-100 text-red-700',
        Observado: 'bg-orange-100 text-orange-700',
    };

    const handleEstado = (e) => {
        const nuevo = e.target.value;
        setEstado(nuevo);
        onCambio(requisito.id_requisito, { estado: nuevo, observacion });
    };

    const handleObservacion = (e) => {
        const obs = e.target.value;
        setObservacion(obs);
        onCambio(requisito.id_requisito, { estado, observacion: obs });
    };

    return (
        <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                    <p className="text-sm font-medium text-slate-800">{requisito.requisito?.nombre || 'Requisito'}</p>
                    {requisito.requisito?.descripcion && <p className="text-xs text-slate-400 mt-0.5">{requisito.requisito.descripcion}</p>}
                </div>
                <select value={estado} onChange={handleEstado}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg border ${coloresEstado[estado] || 'bg-slate-100 text-slate-700'} focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                    {['Pendiente', 'Cumple', 'No cumple', 'Observado'].map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
            </div>
            <input type="text" placeholder="Observación (opcional)" value={observacion} onChange={handleObservacion}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
    );
}

export default function PostulacionDocenteShow({ postulacion }) {
    const { flash } = usePage().props;
    const [checks, setChecks] = useState({});
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [observacionGeneral, setObservacionGeneral] = useState('');
    const [correoAcceso, setCorreoAcceso] = useState('');
    const [passwordAcceso, setPasswordAcceso] = useState('');
    const [showPasswordAcceso, setShowPasswordAcceso] = useState(false);
    const [confirmarCambio, setConfirmarCambio] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (postulacion.requisitos) {
            const initial = {};
            postulacion.requisitos.forEach((r) => {
                initial[r.id_requisito] = { estado: r.estado, observacion: r.observacion || '' };
            });
            setChecks(initial);
        }
    }, [postulacion.requisitos]);

    useEffect(() => {
        if (flash?.success) {
            mostrarToast('Operación exitosa', flash.success);
            // Resetear estados del cambio de estado
            setConfirmarCambio(false);
            setNuevoEstado('');
            setObservacionGeneral('');
            setCorreoAcceso('');
            setPasswordAcceso('');
        }
    }, [flash?.success]);

    const { errors } = usePage().props;

    const actualizarCheck = (id, data) => {
        setChecks((prev) => ({ ...prev, [id]: data }));
    };

    const mostrarToast = (titulo, mensaje, tipo = 'success') => {
        setToast({ titulo, mensaje, tipo });

        window.clearTimeout(window.__postulacionToastTimer);
        window.__postulacionToastTimer = window.setTimeout(() => {
            setToast(null);
        }, 3600);
    };

    const getEstadoBadge = (est) => {
        const c = {
            'Pendiente': 'bg-amber-100 text-amber-700 border-amber-200',
            'Observado': 'bg-orange-100 text-orange-700 border-orange-200',
            'Rechazado': 'bg-red-100 text-red-700 border-red-200',
            'Aprobado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
        return c[est] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const formatearFecha = (f) => {
        if (!f) return '—';
        const d = new Date(f);
        return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '—';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const guardarRevision = () => {
        router.post(`/admin/postulaciones-docentes/${postulacion.id}/guardar-revision`, {
            checks: checks,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                mostrarToast(
                    'Revisión guardada',
                    'Los requisitos fueron actualizados correctamente.'
                );
            },
            onError: () => {
                mostrarToast(
                    'No se pudo guardar',
                    'Revisa los datos del checklist e inténtalo nuevamente.',
                    'error'
                );
            },
        });
    };

    const cambiarEstado = () => {
        router.post(`/admin/postulaciones-docentes/${postulacion.id}/cambiar-estado`, {
            estado_postulacion: nuevoEstado,
            observacion_general: observacionGeneral,
            correo_acceso: nuevoEstado === 'Aprobado' ? correoAcceso : undefined,
            password_acceso: nuevoEstado === 'Aprobado' ? passwordAcceso : undefined,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmarCambio(false);
                setNuevoEstado('');
                setObservacionGeneral('');
                setCorreoAcceso('');
                setPasswordAcceso('');
            },
        });
    };

    // ✅ Nuevas funciones usando el id del documento y la ruta de Laravel
    const verDocumento = (id) => {
        window.open(`/admin/postulaciones-docentes/documentos/${id}/descargar?inline=1`, '_blank');
    };

    const descargarDocumento = (id, nombre) => {
        const link = document.createElement('a');
        link.href = `/admin/postulaciones-docentes/documentos/${id}/descargar`;
        link.download = nombre;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <AdminLayout>
            <Head title={`Postulación - ${postulacion.nombre} ${postulacion.apellido}`} />

            {toast && (
                <div className="fixed right-6 top-6 z-[100] animate-[toast-in_220ms_ease-out]">
                    <div className={`flex min-w-[320px] max-w-sm items-center gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
                        toast.tipo === 'error'
                            ? 'border-red-200/80 bg-white/95 shadow-red-900/10'
                            : 'border-emerald-200/80 bg-white/95 shadow-emerald-900/10'
                    }`}>
                        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white shadow-lg ${
                            toast.tipo === 'error'
                                ? 'bg-red-500 shadow-red-500/30'
                                : 'bg-emerald-500 shadow-emerald-500/30'
                        }`}>
                            {toast.tipo === 'error' ? (
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900">{toast.titulo}</h3>
                            <p className="mt-0.5 text-sm leading-snug text-slate-500">{toast.mensaje}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="ml-auto rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Cerrar notificación"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/postulaciones-docentes" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{postulacion.nombre} {postulacion.apellido}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full border ${getEstadoBadge(postulacion.estado_postulacion)}`}>{postulacion.estado_postulacion}</span>
                                <span className="text-xs text-slate-400">{postulacion.correo}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Datos personales</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-slate-400">Nombre</span><p className="font-medium text-slate-800">{postulacion.nombre} {postulacion.apellido}</p></div>
                                <div><span className="text-slate-400">CI</span><p className="font-medium text-slate-800">{postulacion.ci}</p></div>
                                <div><span className="text-slate-400">Correo</span><p className="font-medium text-slate-800">{postulacion.correo}</p></div>
                                <div><span className="text-slate-400">Teléfono</span><p className="font-medium text-slate-800">{postulacion.telefono || '—'}</p></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Datos profesionales</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-slate-400">Profesión</span><p className="font-medium text-slate-800">{postulacion.profesion}</p></div>
                                <div><span className="text-slate-400">Grado académico</span><p className="font-medium text-slate-800">{postulacion.grado_academico}</p></div>
                                <div><span className="text-slate-400">Experiencia</span><p className="font-medium text-slate-800">{postulacion.experiencia_anios} años</p></div>
                                <div><span className="text-slate-400">Disponibilidad</span><p className="font-medium text-slate-800">{postulacion.disponibilidad_horaria}</p></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Materias postuladas</h2>
                            <div className="flex flex-wrap gap-2">
                                {postulacion.materias && postulacion.materias.length > 0 ? postulacion.materias.map((m, i) => (
                                    <span key={i} className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">{m.nombre}</span>
                                )) : <p className="text-sm text-slate-400">Sin materias registradas</p>}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Documentos enviados</h2>
                            {postulacion.documentos && postulacion.documentos.length > 0 ? (
                                <div className="space-y-2">
                                    {postulacion.documentos.map((doc, i) => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">{doc.nombre_archivo}</p>
                                                <p className="text-xs text-slate-400">{doc.tipo_documento} — {formatBytes(doc.tamanio)}</p>
                                            </div>
                                            <button onClick={() => verDocumento(doc.id)} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">Ver</button>
                                            <button onClick={() => descargarDocumento(doc.id, doc.nombre_archivo)} className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">Descargar</button>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-slate-400">Sin documentos</p>}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Checklist de requisitos</h2>
                            <div className="space-y-4">
                                {postulacion.requisitos && postulacion.requisitos.length > 0 ? postulacion.requisitos.map((req) => (
                                    <RequisitoRow key={req.id_requisito} requisito={req} onCambio={actualizarCheck} />
                                )) : <p className="text-sm text-slate-400">Sin requisitos configurados</p>}
                            </div>
                            <button onClick={guardarRevision} className="mt-4 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">Guardar revisión</button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Cambiar estado</h2>
                            {!confirmarCambio ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Nuevo estado</label>
                                        <select value={nuevoEstado} onChange={(e) => { setNuevoEstado(e.target.value); setCorreoAcceso(''); setPasswordAcceso(''); }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">Seleccionar...</option>
                                            <option value="Observado">Observado</option>
                                            <option value="Rechazado">Rechazado</option>
                                            <option value="Aprobado">Aprobado</option>
                                        </select>
                                    </div>

                                    {/* Campos de credenciales - solo para Aprobado */}
                                    {nuevoEstado === 'Aprobado' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Correo de acceso</label>
                                                <input type="email" value={correoAcceso} onChange={(e) => setCorreoAcceso(e.target.value)}
                                                    placeholder="correo@dominio.com"
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.correo_acceso ? 'border-red-300 bg-red-50' : 'border-slate-300'}`} />
                                                {errors?.correo_acceso && <p className="mt-1 text-xs text-red-500">{errors.correo_acceso}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Contraseña de acceso</label>
                                                <div className="relative">
                                                    <input type={showPasswordAcceso ? 'text' : 'password'} value={passwordAcceso} onChange={(e) => setPasswordAcceso(e.target.value)}
                                                        placeholder="••••••••"
                                                        className={`w-full pr-10 px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.password_acceso ? 'border-red-300 bg-red-50' : 'border-slate-300'}`} />
                                                    <button type="button" onClick={() => setShowPasswordAcceso(!showPasswordAcceso)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200">
                                                        {showPasswordAcceso ? (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                                {errors?.password_acceso && <p className="mt-1 text-xs text-red-500">{errors.password_acceso}</p>}
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Observación / Motivo</label>
                                        <textarea rows="3" value={observacionGeneral} onChange={(e) => setObservacionGeneral(e.target.value)}
                                            placeholder="Detalle del motivo del cambio de estado..."
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
                                    </div>
                                    <button disabled={!nuevoEstado} onClick={() => setConfirmarCambio(true)}
                                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors">Cambiar estado y notificar</button>
                                </div>
                            ) : (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <p className="text-sm font-medium text-orange-800">¿Estás seguro de marcar como <strong>{nuevoEstado}</strong>? Se notificará al postulante.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={cambiarEstado} className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">Confirmar</button>
                                        <button onClick={() => setConfirmarCambio(false)} className="flex-1 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Información adicional</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-slate-400">Postulación</span><span className="font-medium text-slate-800">{formatearFecha(postulacion.fecha_postulacion)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Última revisión</span><span className="font-medium text-slate-800">{formatearFecha(postulacion.fecha_revision)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Revisor</span><span className="font-medium text-slate-800">{postulacion.revisor ? `${postulacion.revisor.nombre} ${postulacion.revisor.apellidos}` : '—'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Observación general</span><span className="font-medium text-slate-800 text-right max-w-[200px]">{postulacion.observacion_general || '—'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
