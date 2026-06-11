import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { usePage } from '@inertiajs/react';

export default function PanelDashboard() {
    const { props } = usePage();
    const nombre = props?.auth?.usuario_nombre || 'Usuario';
    const rol = props?.auth?.usuario_rol_nombre || '';

    return (
        <AdminLayout>
            <Head title="Dashboard" />
            <div className="max-w-5xl mx-auto">
                <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-xl">
                    <div className="absolute inset-0 bg-white/5" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            ¡Bienvenido, {nombre}!
                        </h1>
                        <p className="mt-2 text-blue-200 text-sm">
                            {rol} — Panel de control del Curso Preuniversitario FICCT
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Sistema Integrado</h3>
                        <p className="text-sm text-slate-500">Gestión completa del Curso Preuniversitario FICCT</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Acceso Seguro</h3>
                        <p className="text-sm text-slate-500">Tu sesión está protegida y los datos encriptados</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Rol: {rol}</h3>
                        <p className="text-sm text-slate-500">Tienes acceso a los módulos asignados</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}