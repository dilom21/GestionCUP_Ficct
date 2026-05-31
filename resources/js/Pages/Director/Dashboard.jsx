import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';

export default function DirectorDashboard() {
    const { auth } = usePage().props;

    const cerrarSesion = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Panel Director de Carrera" />

            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">
                        Panel del Director de Carrera
                    </h1>
                    <button
                        onClick={cerrarSesion}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Bienvenido, {auth.usuario_nombre || 'Usuario'}
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Rol: <span className="font-semibold text-[#1E62A0]">{auth.usuario_rol_nombre}</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">{auth.usuario_correo}</p>
                </div>
            </main>
        </div>
    );
}