import { Head, Link } from '@inertiajs/react';

export default function Pago({ postulacion }) {
    const pasos = [
        { num: 1, label: 'Datos del postulante' },
        { num: 2, label: 'Requisitos' },
        { num: 3, label: 'Pago' },
        { num: 4, label: 'Estado' },
    ];

    const colores = {
        Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
        Observado: 'bg-orange-100 text-orange-700 border-orange-200',
        Rechazado: 'bg-red-100 text-red-700 border-red-200',
        Aprobado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };

    return (
        <>
            <Head title="Pago - CUP FICCT" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0B2046] via-[#122D5C] to-[#1E62A0]">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                                <img src="/imagenes/Logo-Ficct.png" alt="Logo" className="w-10 h-10 object-contain" />
                                <div>
                                    <span className="text-sm font-bold text-white">FICCT</span>
                                    <span className="text-[10px] text-blue-300 block">Curso Preuniversitario</span>
                                </div>
                            </div>
                        </div>
                        <div className="pb-8 text-center">
                            <h1 className="text-3xl font-extrabold text-white">Preinscripción CUP FICCT</h1>
                            <p className="text-blue-200/90 mt-2">Completa los pasos para registrar tu postulación</p>
                        </div>
                    </div>
                </div>

                {/* Stepper */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                        <div className="flex items-center justify-between">
                            {pasos.map((p, i) => (
                                <div key={i} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${i <= 1 ? 'bg-emerald-500 text-white shadow-md' : i === 2 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                                            {i <= 1 ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            ) : p.num}
                                        </div>
                                        <span className={`text-[10px] mt-1.5 font-medium text-center ${i <= 1 ? 'text-emerald-700' : i === 2 ? 'text-blue-700 font-semibold' : 'text-slate-400'}`}>{p.label}</span>
                                    </div>
                                    {i < pasos.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-3 mt-[-1.5rem] ${i < 2 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Información del postulante */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Hola, {postulacion.postulante?.nombre || 'Postulante'}
                        </h2>
                        <p className="text-slate-500 mb-2">
                            Estás realizando el pago del <strong>Curso Preuniversitario FICCT</strong>
                        </p>
                        <div className="inline-flex items-center gap-4 mt-2 bg-slate-50 rounded-xl border border-slate-200 px-5 py-3 text-sm">
                            <span className="text-slate-500">Nro. Formulario:</span>
                            <span className="font-mono font-bold text-slate-800">{postulacion.nro_formulario}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500">Estado:</span>
                            <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full border ${colores[postulacion.estado_postulacion] || ''}`}>
                                {postulacion.estado_postulacion}
                            </span>
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
                            <span>Opción 1: <strong className="text-slate-600">{postulacion.carrera1?.nombre || '—'}</strong></span>
                            <span>Opción 2: <strong className="text-slate-600">{postulacion.carrera2?.nombre || '—'}</strong></span>
                        </div>
                    </div>

                    {/* Placeholder de pago */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Realiza tu pago</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                            Esta sección de pago estará disponible próximamente. Una vez realizado el pago, recibirás tus credenciales de acceso al sistema.
                        </p>
                    </div>
                </div>

                <footer className="bg-slate-900 text-white py-6 mt-16">
                    <div className="max-w-5xl mx-auto px-4 text-center">
                        <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} FICCT — UAGRM</p>
                    </div>
                </footer>
            </div>
        </>
    );
}