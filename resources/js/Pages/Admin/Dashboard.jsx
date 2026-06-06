import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminDashboard() {
    const { auth } = usePage().props;

    return (
        <AdminLayout>
            <Head title="Panel Administrador" />

            <div className="max-w-5xl mx-auto">
                {/* Tarjeta de bienvenida */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 flex-shrink-0">
                            {auth.usuario_nombre ? auth.usuario_nombre.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                Bienvenido, {auth.usuario_nombre || 'Usuario'}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    {auth.usuario_rol_nombre}
                                </span>
                                <span className="text-sm text-slate-400">{auth.usuario_correo}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de tarjetas de resumen */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Postulantes', value: '—', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'from-blue-500 to-blue-600' },
                        { label: 'Docentes', value: '—', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'from-emerald-500 to-emerald-600' },
                        { label: 'Grupos activos', value: '—', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-violet-500 to-violet-600' },
                        { label: 'Pendientes', value: '—', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-amber-500 to-amber-600' },
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                                    <p className="text-xs text-slate-400 font-medium">{card.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mensaje de ayuda */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
                    <h3 className="text-lg font-bold mb-2">Gestiona tu plataforma</h3>
                    <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                        Utiliza el menú lateral para navegar entre los diferentes módulos
                        de administración del Curso Preuniversitario FICCT.
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pasa el cursor sobre el menú lateral para expandirlo
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}