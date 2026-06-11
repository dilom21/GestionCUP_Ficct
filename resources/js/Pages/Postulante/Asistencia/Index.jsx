import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import PostulanteLayout from '@/Layouts/PostulanteLayout';
import axios from 'axios';

const TABS = [
    { key: 'qr', label: '📷 Escanear QR', desc: 'Use la cámara para escanear el código QR del docente' },
    { key: 'pin', label: '🔑 Código PIN', desc: 'Ingrese el código numérico de 6 dígitos que muestra el docente' },
];

export default function PostulanteAsistencia({ inscripciones }) {
    const { props } = usePage();
    const [activeTab, setActiveTab] = useState('qr');
    const [result, setResult] = useState(null);
    const [scanning, setScanning] = useState(false);

    const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
    const [pinSubmitting, setPinSubmitting] = useState(false);
    const pinInputRefs = useRef([]);

    const scannerRef = useRef(null);
    const scannerInstanceRef = useRef(null);

    const flashMessage = props.flash?.success || props.flash?.error;

    useEffect(() => {
        return () => {
            if (scannerInstanceRef.current) {
                scannerInstanceRef.current.stop().catch(() => {});
            }
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'qr') {
            startScanner();
        } else {
            stopScanner();
        }
    }, [activeTab]);

    // ── QR Scanner ──────────────────────────────────────────────────

    async function startScanner() {
        stopScanner();
        setResult(null);

        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-reader');
            scannerInstanceRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onQrSuccess,
                () => {}
            );
            setScanning(true);
        } catch (err) {
            if (err?.toString().includes('NotAllowedError')) {
                setResult({ success: false, message: 'Permiso de cámara denegado. Use el modo Código PIN.' });
            } else {
                setResult({ success: false, message: 'Error al iniciar la cámara. Use el modo Código PIN.' });
            }
            setScanning(false);
        }
    }

    function stopScanner() {
        if (scannerInstanceRef.current) {
            scannerInstanceRef.current.stop().catch(() => {});
            scannerInstanceRef.current = null;
        }
        setScanning(false);
    }

    async function onQrSuccess(decodedText) {
        if (scannerInstanceRef.current) {
            await scannerInstanceRef.current.stop().catch(() => {});
            scannerInstanceRef.current = null;
        }
        setScanning(false);

        if (decodedText.length !== 64) {
            setResult({ success: false, message: 'Token QR inválido. Debe tener 64 caracteres.' });
            setTimeout(() => setResult(null), 3000);
            return;
        }

        try {
            const res = await axios.post(route('postulante.asistencia.escanear'), {
                token: decodedText.trim(),
            });
            setResult({ success: true, message: res.data.message });
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err) {
            setResult({
                success: false,
                message: err.response?.data?.message || 'Error al validar QR.',
            });
            setTimeout(() => setResult(null), 4000);
        }
    }

    function reiniciarScanner() {
        setResult(null);
        if (activeTab === 'qr') startScanner();
    }

    // ── PIN ──────────────────────────────────────────────────────────

    function presionarDigito(digito) {
        setResult(null);
        const idx = pinDigits.findIndex((d) => d === '');
        if (idx === -1) return;
        const nuevo = [...pinDigits];
        nuevo[idx] = digito;
        setPinDigits(nuevo);

        if (idx === 5) {
            enviarPin([...nuevo]);
        }
    }

    function borrarUltimo() {
        const idx = pinDigits.slice().reverse().findIndex((d) => d !== '');
        if (idx === -1) return;
        const realIdx = 5 - idx;
        const nuevo = [...pinDigits];
        nuevo[realIdx] = '';
        setPinDigits(nuevo);
    }

    function limpiarPin() {
        setPinDigits(['', '', '', '', '', '']);
        setResult(null);
    }

    async function enviarPin(digits) {
        const pin = digits.join('');
        if (pin.length !== 6) return;

        setPinSubmitting(true);
        try {
            const res = await axios.post(route('postulante.asistencia.validar-pin'), { pin });
            setResult({ success: true, message: res.data.message });
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setResult({
                success: false,
                message: err.response?.data?.message || 'Error al validar PIN.',
            });
            limpiarPin();
        } finally {
            setPinSubmitting(false);
        }
    }

    // ── Render ──────────────────────────────────────────────────────

    return (
        <PostulanteLayout>
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

                    <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-xl">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold text-white tracking-tight">Asistencia</h1>
                            <p className="mt-1 text-indigo-100 text-sm">Registre su asistencia escaneando el QR o ingresando el código PIN que el docente muestra en clase.</p>
                        </div>
                    </div>

                    {/* ── Tabs ──────────────────────────────────────── */}
                    <div className="flex gap-2 mb-6">
                        {TABS.map((tab) => (
                            <button key={tab.key}
                                onClick={() => { setActiveTab(tab.key); setResult(null); }}
                                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                                    activeTab === tab.key
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}>
                                <span className="block">{tab.label}</span>
                                <span className={`block text-xs mt-0.5 ${activeTab === tab.key ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {tab.desc}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── Tab QR ────────────────────────────────────── */}
                    {activeTab === 'qr' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-lg mx-auto mb-8">
                            <div id="qr-reader" className="w-full aspect-square mx-auto rounded-lg overflow-hidden bg-gray-100" />

                            {!scanning && !result && (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500">Iniciando cámara...</p>
                                    <button onClick={startScanner}
                                        className="mt-2 inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium">
                                        Activar Cámara
                                    </button>
                                </div>
                            )}

                            {result && (
                                <div className="mt-4">
                                    <div className={`p-4 rounded-xl text-sm font-medium ${
                                        result.success
                                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                                            : 'bg-red-50 border border-red-200 text-red-800'
                                    }`}>
                                        {result.message}
                                    </div>
                                    {!result.success && (
                                        <button onClick={reiniciarScanner}
                                            className="mt-3 w-full px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium">
                                            Intentar de nuevo
                                        </button>
                                    )}
                                </div>
                            )}

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Señale la cámara al código QR que el docente proyecta en el aula.
                                El escaneo es automático al detectar un código válido.
                            </p>
                        </div>
                    )}

                    {/* ── Tab PIN ───────────────────────────────────── */}
                    {activeTab === 'pin' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-sm mx-auto mb-8">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                                Ingrese el código PIN
                            </h2>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                El docente muestra un código de 6 dígitos. Ingrese los números en orden.
                            </p>

                            {/* Display PIN */}
                            <div className="flex justify-center gap-3 mb-8">
                                {pinDigits.map((d, i) => (
                                    <div key={i}
                                        className={`w-10 h-12 flex items-center justify-center rounded-xl text-xl font-bold font-mono border-2 transition-all ${
                                            d !== ''
                                                ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-300'
                                        }`}>
                                        {d || '·'}
                                    </div>
                                ))}
                            </div>

                            {/* Keypad */}
                            <div className="grid grid-cols-3 gap-3 max-w-[200px] mx-auto">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                    <button key={n}
                                        onClick={() => presionarDigito(String(n))}
                                        disabled={pinSubmitting}
                                        className="w-14 h-14 rounded-xl text-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 active:bg-gray-300 disabled:opacity-50 transition-all shadow-sm">
                                        {n}
                                    </button>
                                ))}
                                <button onClick={limpiarPin}
                                    disabled={pinSubmitting}
                                    className="w-14 h-14 rounded-xl text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 transition-all">
                                    Limpiar
                                </button>
                                <button onClick={() => presionarDigito('0')}
                                    disabled={pinSubmitting}
                                    className="w-14 h-14 rounded-xl text-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 active:bg-gray-300 disabled:opacity-50 transition-all shadow-sm">
                                    0
                                </button>
                                <button onClick={borrarUltimo}
                                    disabled={pinSubmitting || pinDigits.every((d) => d === '')}
                                    className="w-14 h-14 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 transition-all shadow-sm">
                                    ⌫
                                </button>
                            </div>

                            {pinSubmitting && (
                                <p className="text-center text-sm text-indigo-600 mt-4 font-medium">Validando código...</p>
                            )}

                            {result && (
                                <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
                                    result.success
                                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                                        : 'bg-red-50 border border-red-200 text-red-800'
                                }`}>
                                    {result.message}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Mis Clases ────────────────────────────────── */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Mis Clases</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inscripciones.map((ins) => (
                            <div key={ins.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                    Grupo {ins.grupo}
                                </h3>
                                {ins.asignaciones.map((a) => (
                                    <div key={a.id} className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0 last:mb-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{a.materia}</p>
                                        <p className="text-xs text-gray-500">Docente: {a.docente}</p>
                                        {a.horarios.map((h, i) => (
                                            <p key={i} className="text-xs text-gray-400">
                                                {h.dia}: {h.inicio}-{h.fin} | {h.aula}
                                            </p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                        {inscripciones.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No tiene inscripciones activas.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PostulanteLayout>
    );
}
