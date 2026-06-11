import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import DocenteLayout from '@/Layouts/DocenteLayout';
import axios from 'axios';

export default function DocenteAsistencia({ asignaciones, asistencias_hoy }) {
    const { props } = usePage();
    const [qrData, setQrData] = useState(null);
    const [qrInterval, setQrInterval] = useState(null);
    const [selectedAsignacion, setSelectedAsignacion] = useState(null);
    const [generating, setGenerating] = useState(false);

    const [pinData, setPinData] = useState(null);
    const [pinInterval, setPinInterval] = useState(null);
    const [generatingPin, setGeneratingPin] = useState(false);

    const [listaData, setListaData] = useState(null);
    const [listaLoading, setListaLoading] = useState(false);
    const [marcando, setMarcando] = useState(null);

    const flashMessage = props.flash?.success || props.flash?.error;

    useEffect(() => {
        return () => {
            if (qrInterval) clearInterval(qrInterval);
            if (pinInterval) clearInterval(pinInterval);
        };
    }, [qrInterval, pinInterval]);

    // ── QR ──────────────────────────────────────────────────────────

    const generarQr = useCallback(async (idAsignacion) => {
        setGenerating(true);
        setSelectedAsignacion(idAsignacion);
        setPinData(null);
        setListaData(null);
        try {
            const res = await axios.post(route('docente.asistencia.generar-qr'), {
                id_asignacion_academica: idAsignacion,
            });
            setQrData(res.data);
            if (qrInterval) clearInterval(qrInterval);
            const interval = setInterval(async () => {
                try {
                    const res2 = await axios.post(route('docente.asistencia.generar-qr'), {
                        id_asignacion_academica: idAsignacion,
                    });
                    setQrData(res2.data);
                } catch {}
            }, 15000);
            setQrInterval(interval);
        } catch (err) {
            alert(err.response?.data?.error || 'Error al generar QR');
        } finally {
            setGenerating(false);
        }
    }, [qrInterval]);

    const detenerQr = () => {
        if (qrInterval) clearInterval(qrInterval);
        setQrInterval(null);
        setQrData(null);
        setSelectedAsignacion(null);
    };

    // ── PIN ──────────────────────────────────────────────────────────

    const generarPin = useCallback(async (idAsignacion) => {
        setGeneratingPin(true);
        setSelectedAsignacion(idAsignacion);
        setQrData(null);
        setListaData(null);
        try {
            const res = await axios.post(route('docente.asistencia.generar-pin'), {
                id_asignacion_academica: idAsignacion,
            });
            setPinData(res.data);
            if (pinInterval) clearInterval(pinInterval);
            const interval = setInterval(async () => {
                try {
                    const res2 = await axios.post(route('docente.asistencia.generar-pin'), {
                        id_asignacion_academica: idAsignacion,
                    });
                    setPinData(res2.data);
                } catch {}
            }, 60000);
            setPinInterval(interval);
        } catch (err) {
            alert(err.response?.data?.error || 'Error al generar PIN');
        } finally {
            setGeneratingPin(false);
        }
    }, [pinInterval]);

    const detenerPin = () => {
        if (pinInterval) clearInterval(pinInterval);
        setPinInterval(null);
        setPinData(null);
        setSelectedAsignacion(null);
    };

    // ── Lista ────────────────────────────────────────────────────────

    const abrirLista = async (idAsignacion) => {
        setSelectedAsignacion(idAsignacion);
        setQrData(null);
        setPinData(null);
        setListaLoading(true);
        setListaData(null);
        try {
            const res = await axios.get(route('docente.asistencia.estudiantes'), {
                params: { id_asignacion_academica: idAsignacion },
            });
            setListaData(res.data.estudiantes);
        } catch (err) {
            alert(err.response?.data?.error || 'Error al cargar estudiantes');
        } finally {
            setListaLoading(false);
        }
    };

    const marcarEstudiante = async (idInscripcion, estado) => {
        setMarcando(idInscripcion);
        try {
            const res = await axios.post(route('docente.asistencia.registrar-estudiante'), {
                id_asignacion_academica: selectedAsignacion,
                id_inscripcion_cup: idInscripcion,
                estado,
            });
            setListaData((prev) =>
                prev.map((e) =>
                    e.id_inscripcion === idInscripcion
                        ? { ...e, estado_asistencia: estado, hora_registro: res.data.hora }
                        : e
                )
            );
        } catch (err) {
            alert(err.response?.data?.error || 'Error al registrar asistencia');
        } finally {
            setMarcando(null);
        }
    };

    const cerrarLista = () => {
        setListaData(null);
        setSelectedAsignacion(null);
    };

    const regresar = () => {
        detenerQr();
        detenerPin();
        cerrarLista();
    };

    // ── Entrada/Salida Docente ───────────────────────────────────────

    const registrarEntrada = async (idAsignacion) => {
        if (!confirm('¿Registrar entrada para esta clase?')) return;
        try {
            const res = await axios.post(route('docente.asistencia.entrada'), {
                id_asignacion_academica: idAsignacion,
            });
            alert(res.data.mensaje || 'Entrada registrada');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al registrar entrada');
        }
    };

    const registrarSalida = async (idAsignacion) => {
        if (!confirm('¿Registrar salida para esta clase?')) return;
        try {
            const res = await axios.post(route('docente.asistencia.salida'), {
                id_asignacion_academica: idAsignacion,
            });
            alert(res.data.mensaje || 'Salida registrada');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al registrar salida');
        }
    };

    function getAsistenciaHoy(idAsignacion) {
        return asistencias_hoy?.find(a => a.id_asignacion === idAsignacion);
    }

    // ── Timer ────────────────────────────────────────────────────────

    function TimerDisplay({ expiresAt }) {
        const [remaining, setRemaining] = useState('');
        useEffect(() => {
            function tick() {
                const diff = new Date(expiresAt) - new Date();
                if (diff <= 0) setRemaining('00:00');
                else setRemaining(`0:${String(Math.ceil(diff / 1000)).padStart(2, '0')}`);
            }
            tick();
            const i = setInterval(tick, 1000);
            return () => clearInterval(i);
        }, [expiresAt]);
        return <span className="font-mono text-sm">{remaining}</span>;
    }

    // ── Render ──────────────────────────────────────────────────────

    return (
        <DocenteLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {flashMessage && (
                        <div className={`mb-6 px-5 py-3 rounded-xl text-sm font-medium shadow-sm border ${
                            props.flash.success
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            <span>{flashMessage}</span>
                        </div>
                    )}

                    <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-8 shadow-xl">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold text-white tracking-tight">Asistencia Docente</h1>
                            <p className="mt-1 text-emerald-100 text-sm">Registre su entrada/salida y gestione la asistencia de sus estudiantes mediante QR, código PIN o llamando lista.</p>
                        </div>
                    </div>

                    {/* Asignaciones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {asignaciones.map((asig) => {
                            const asis = getAsistenciaHoy(asig.id);
                            return (
                                <div key={asig.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{asig.materia}</h3>
                                            <p className="text-sm text-gray-500">Grupo: {asig.grupo}</p>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            asis?.hora_entrada
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {asis?.hora_entrada ? 'Presente' : 'Pendiente'}
                                        </span>
                                    </div>

                                    <div className="space-y-1 mb-4">
                                        {asig.horarios.map((h, i) => (
                                            <div key={i} className="text-xs text-gray-500">
                                                {h.dia}: {h.inicio} - {h.fin} | Aula: {h.aula}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Botones entrada/salida docente */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {!asis?.hora_entrada ? (
                                            <button onClick={() => registrarEntrada(asig.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors">
                                                Registrar Entrada
                                            </button>
                                        ) : !asis?.hora_salida ? (
                                            <button onClick={() => registrarSalida(asig.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors">
                                                Registrar Salida
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Clase completada</span>
                                        )}
                                    </div>

                                    {/* Botones de modos de asistencia */}
                                    {asis?.hora_entrada && (
                                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <button onClick={() => generarQr(asig.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors">
                                                📷 QR
                                            </button>
                                            <button onClick={() => generarPin(asig.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-medium transition-colors">
                                                🔑 Código
                                            </button>
                                            <button onClick={() => abrirLista(asig.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-medium transition-colors">
                                                📋 Lista
                                            </button>
                                        </div>
                                    )}

                                    {asis && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                                            {asis.hora_entrada && <p>Entrada: {asis.hora_entrada}</p>}
                                            {asis.hora_salida && <p>Salida: {asis.hora_salida}</p>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {asignaciones.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No tiene asignaciones activas.
                            </div>
                        )}
                    </div>

                    {/* ── Modal QR ──────────────────────────────────── */}
                    {qrData && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen px-4">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={detenerQr} />
                                <div className="relative inline-block w-full max-w-md p-6 my-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl text-center">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">📷 Código QR</h2>
                                        <button onClick={detenerQr} className="text-red-500 hover:text-red-700 text-sm font-medium">Detener</button>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">{qrData.materia} - {qrData.grupo}</p>
                                    <p className="text-xs text-gray-400 mb-3">Válido por <TimerDisplay expiresAt={qrData.expira_en} /></p>
                                    <div className="bg-white p-4 rounded-lg inline-block mb-4 border border-gray-200">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData.token)}`}
                                            alt="QR" className="w-44 h-44 mx-auto"
                                            onError={(e) => {
                                                e.target.src = `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(qrData.token)}`;
                                            }} />
                                    </div>
                                    <button onClick={() => { navigator.clipboard?.writeText(qrData.token); }}
                                        className="text-xs text-blue-600 hover:underline">Copiar token</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Modal PIN ─────────────────────────────────── */}
                    {pinData && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen px-4">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={detenerPin} />
                                <div className="relative inline-block w-full max-w-sm p-8 my-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl text-center">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">🔑 Código PIN</h2>
                                        <button onClick={detenerPin} className="text-red-500 hover:text-red-700 text-sm font-medium">Detener</button>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">{pinData.materia} - {pinData.grupo}</p>

                                    <div className="my-6 py-6 px-4 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-lg">
                                        <p className="text-purple-200 text-xs mb-2">Ingrese este código en su sesión de estudiante</p>
                                        <div className="text-5xl md:text-6xl font-bold tracking-[0.3em] text-white font-mono select-all">
                                            {pinData.pin}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Válido por <TimerDisplay expiresAt={pinData.expira_en} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Modal Lista ───────────────────────────────── */}
                    {listaData !== null && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen px-4">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={cerrarLista} />
                                <div className="relative inline-block w-full max-w-3xl p-6 my-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">📋 Tomar Lista</h2>
                                            <p className="text-sm text-gray-500">
                                                {listaData.length} estudiante{listaData.length !== 1 ? 's' : ''} en el grupo
                                            </p>
                                        </div>
                                        <button onClick={cerrarLista} className="text-gray-400 hover:text-gray-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-rose-600 to-pink-600">
                                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">#</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">Estudiante</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/90">CI</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/90">Estado</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/90">Registrar</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {listaLoading ? (
                                                    <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">Cargando estudiantes...</td></tr>
                                                ) : listaData.length === 0 ? (
                                                    <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No hay estudiantes inscritos en este grupo.</td></tr>
                                                ) : (
                                                    listaData.map((est, i) => (
                                                        <tr key={est.id_inscripcion} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{i + 1}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{est.nombre_completo}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{est.ci}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    est.estado_asistencia === 'Presente' ? 'bg-emerald-100 text-emerald-800' :
                                                                    est.estado_asistencia === 'Ausente' ? 'bg-red-100 text-red-800' :
                                                                    est.estado_asistencia === 'Tardanza' ? 'bg-amber-100 text-amber-800' :
                                                                    'bg-gray-100 text-gray-500'
                                                                }`}>
                                                                    {est.estado_asistencia}
                                                                </span>
                                                                {est.hora_registro && (
                                                                    <p className="text-xs text-gray-400 mt-0.5">{est.hora_registro}</p>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    {(['Presente', 'Tardanza', 'Ausente']).map((estado) => (
                                                                        <button key={estado}
                                                                            onClick={() => marcarEstudiante(est.id_inscripcion, estado)}
                                                                            disabled={marcando === est.id_inscripcion}
                                                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                                                                est.estado_asistencia === estado
                                                                                    ? estado === 'Presente' ? 'bg-emerald-200 text-emerald-900 ring-2 ring-emerald-500' :
                                                                                      estado === 'Tardanza' ? 'bg-amber-200 text-amber-900 ring-2 ring-amber-500' :
                                                                                      'bg-red-200 text-red-900 ring-2 ring-red-500'
                                                                                    : estado === 'Presente' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' :
                                                                                      estado === 'Tardanza' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' :
                                                                                      'bg-red-50 text-red-600 hover:bg-red-100'
                                                                            } disabled:opacity-50`}>
                                                                            {estado === 'Presente' ? '✅' : estado === 'Tardanza' ? '⏰' : '❌'}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DocenteLayout>
    );
}
