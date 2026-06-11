import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

function RequisitoRow({ requisito, onCambio }) {
    const [estado, setEstado] = useState(requisito.estado_requisito || 'Pendiente');
    const [observacion, setObservacion] = useState(requisito.observacion || '');

    const colores = { Pendiente: 'bg-amber-100 text-amber-700', Cumple: 'bg-emerald-100 text-emerald-700', 'No cumple': 'bg-red-100 text-red-700', Observado: 'bg-orange-100 text-orange-700' };

    const handleEstado = (e) => { const v = e.target.value; setEstado(v); onCambio(requisito.id_requisito, { estado: v, observacion }); };
    const handleObs = (e) => { const v = e.target.value; setObservacion(v); onCambio(requisito.id_requisito, { estado, observacion: v }); };

    return (
        <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div><p className="text-sm font-medium text-slate-800">{requisito.requisito?.nombre || 'Requisito'}</p></div>
                <select value={estado} onChange={handleEstado} className={`text-xs font-semibold px-2 py-1 rounded-lg border ${colores[estado] || 'bg-slate-100 text-slate-700'} focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                    {['Pendiente', 'Cumple', 'No cumple', 'Observado'].map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
            </div>
            <input type="text" placeholder="Observación" value={observacion} onChange={handleObs} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
    );
}

export default function PostulacionPostulanteShow({ postulacion }) {
    const { flash } = usePage().props;
    const [checks, setChecks] = useState({});
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [obsGeneral, setObsGeneral] = useState('');
    const [confirmar, setConfirmar] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (postulacion.requisitos) {
            const init = {};
            postulacion.requisitos.forEach((r) => { init[r.id_requisito] = { estado: r.estado_requisito, observacion: r.observacion || '' }; });
            setChecks(init);
        }
    }, [postulacion.requisitos]);

    useEffect(() => {
        if (flash?.success) {
            setToast({ titulo: 'Éxito', mensaje: flash.success });
            setConfirmar(false); setNuevoEstado(''); setObsGeneral('');
            setTimeout(() => setToast(null), 3600);
        }
    }, [flash?.success]);

    const colores = { Pendiente: 'bg-amber-100 text-amber-700 border-amber-200', Observado: 'bg-orange-100 text-orange-700 border-orange-200', Rechazado: 'bg-red-100 text-red-700 border-red-200', Pago: 'bg-blue-100 text-blue-700 border-blue-200', Aprobado: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    const fFecha = (f) => f ? new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
    const fBytes = (b) => { if (!b) return '—'; const k = 1024, s = ['Bytes', 'KB', 'MB']; const i = Math.floor(Math.log(b) / Math.log(k)); return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + s[i]; };

    return (
        <AdminLayout>
            <Head title={`Postulación - ${postulacion.nro_formulario}`} />
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/postulaciones-postulantes" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{postulacion.nro_formulario}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full border ${colores[postulacion.estado_postulacion] || ''}`}>{postulacion.estado_postulacion}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {toast && (
                    <div className="fixed right-6 top-6 z-[100] bg-white border border-emerald-200 rounded-2xl shadow-2xl p-4">
                        <p className="text-sm font-bold text-emerald-800">{toast.titulo}: {toast.mensaje}</p>
                    </div>
                )}

                <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
                    <div className="space-y-6">
                        {/* Datos del postulante */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Datos del postulante</h2>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="sm:col-span-2 mb-1">
                                    <span className="text-slate-400">Nombre completo</span>
                                    <p className="font-medium text-slate-800 text-base">{postulacion.postulante?.nombre || '—'} {postulacion.postulante?.apellidos || ''}</p>
                                </div>
                                <div><span className="text-slate-400">Nro. Formulario</span><p className="font-medium text-slate-800 font-mono">{postulacion.nro_formulario}</p></div>
                                <div><span className="text-slate-400">CI</span><p className="font-medium text-slate-800">{postulacion.postulante?.ci || '—'}</p></div>
                                <div><span className="text-slate-400">Fecha nac.</span><p className="font-medium text-slate-800">{postulacion.postulante?.fecha_nacimiento || '—'}</p></div>
                                <div><span className="text-slate-400">Sexo</span><p className="font-medium text-slate-800">{postulacion.postulante?.sexo === 'M' ? 'Masculino' : postulacion.postulante?.sexo === 'F' ? 'Femenino' : '—'}</p></div>
                                <div className="sm:col-span-2"><span className="text-slate-400">Ciudad</span><p className="font-medium text-slate-800">{postulacion.postulante?.ciudad || '—'}</p></div>
                                <div className="sm:col-span-2"><span className="text-slate-400">Dirección</span><p className="font-medium text-slate-800">{postulacion.postulante?.direccion || '—'}</p></div>
                                <div className="sm:col-span-2"><span className="text-slate-400">Colegio</span><p className="font-medium text-slate-800">{postulacion.postulante?.colegio_procedencia || '—'}</p></div>
                                <div className="sm:col-span-2"><span className="text-slate-400">Turno</span><p className="font-medium text-slate-800">{postulacion.turno || '—'}</p></div>
                            </div>
                        </div>

                        {/* Carreras */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Carreras seleccionadas</h2>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-xl border border-blue-200">
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Opción 1</span>
                                    <span className="text-sm font-medium text-blue-800">{postulacion.carrera1?.nombre || '—'}</span>
                                </div>
                                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Opción 2</span>
                                    <span className="text-sm font-medium text-slate-700">{postulacion.carrera2?.nombre || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Documentos */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Documentos</h2>
                    {postulacion.documentos?.length > 0 ? (
                                <div className="space-y-2">
                                    {postulacion.documentos.map((d, i) => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">{d.nombre_archivo}</p>
                                                <p className="text-xs text-slate-400">{d.tipo_documento} — {fBytes(d.tamanio)}</p>
                                            </div>
                                            <a href={`/admin/postulaciones-postulantes/documentos/${d.id}/descargar`} target="_blank" rel="noopener noreferrer"
                                                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">Ver</a>
                                            <a href={`/admin/postulaciones-postulantes/documentos/${d.id}/descargar`} download={d.nombre_archivo}
                                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">Descargar</a>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-slate-400">Sin documentos</p>}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Checklist */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Checklist de requisitos</h2>
                            <div className="space-y-4">
                                {postulacion.requisitos?.length > 0 ? postulacion.requisitos.map((r) => (
                                    <RequisitoRow key={r.id_requisito} requisito={r} onCambio={(id, data) => setChecks((p) => ({ ...p, [id]: data }))} />
                                )) : <p className="text-sm text-slate-400">Sin requisitos</p>}
                            </div>
                            <button onClick={() => router.post(`/admin/postulaciones-postulantes/${postulacion.id}/guardar-revision`, { checks }, {
                                onSuccess: () => {
                                    setToast({ titulo: 'Éxito', mensaje: 'Revisión guardada correctamente.' });
                                    setTimeout(() => setToast(null), 3600);
                                },
                                onError: () => {
                                    setToast({ titulo: 'Error', mensaje: 'No se pudo guardar la revisión.' });
                                    setTimeout(() => setToast(null), 3600);
                                }
                            })}
                                className="mt-4 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">Guardar revisión</button>
                        </div>

                        {/* Cambiar estado */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Cambiar estado</h2>
                            {!confirmar ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
                                        <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Seleccionar...</option>
                                            <option value="Observado">Observado</option>
                                            <option value="Rechazado">Rechazado</option>
                                            <option value="Pago">Pago (requisitos cumplen)</option>
                                            <option value="Aprobado">Aprobado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Observación</label>
                                        <textarea rows="3" value={obsGeneral} onChange={(e) => setObsGeneral(e.target.value)} placeholder="Motivo..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                    </div>
                                    <button disabled={!nuevoEstado} onClick={() => setConfirmar(true)}
                                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl">Cambiar estado y notificar</button>
                                </div>
                            ) : (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                    <p className="text-sm font-medium text-orange-800 mb-3">¿Marcar como <strong>{nuevoEstado}</strong>? Se notificará al postulante.</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => {
                                            router.post(`/admin/postulaciones-postulantes/${postulacion.id}/cambiar-estado`, { estado_postulacion: nuevoEstado, observacion_general: obsGeneral }, { preserveScroll: true });
                                            setConfirmar(false);
                                        }} className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg">Confirmar</button>
                                        <button onClick={() => setConfirmar(false)} className="flex-1 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">Cancelar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
