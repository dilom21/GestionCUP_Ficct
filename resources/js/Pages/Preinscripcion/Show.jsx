import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function PreinscripcionShow({ postulacion }) {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
        }
    }, [flash]);

    const colores = {
        Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
        Observado: 'bg-orange-100 text-orange-700 border-orange-200',
        Rechazado: 'bg-red-100 text-red-700 border-red-200',
        Aprobado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };

    return (
        <>
            <Head title="Postulación registrada" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 max-w-lg w-full border border-slate-100 p-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Postulación registrada correctamente</h2>
                    <p className="text-slate-500 leading-relaxed mb-2">Hemos recibido tu solicitud.</p>
                    <p className="text-slate-500 leading-relaxed mb-2">Recibirás un correo electrónico con el seguimiento de tu postulación.</p>
                    <p className="text-slate-400 text-sm mb-6">Si no encuentra el correo, revise también Spam o Correo no deseado.</p>

                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6 text-left">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resumen</p>
                        <p className="text-sm text-slate-700"><span className="font-medium">Nro. Formulario:</span> <span className="font-mono">{postulacion.nro_formulario}</span></p>
                        <p className="text-sm text-slate-700 mt-1"><span className="font-medium">Estado:</span> <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ml-1 ${colores[postulacion.estado_postulacion] || ''}`}>{postulacion.estado_postulacion}</span></p>
                    </div>

                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </>
    );
}