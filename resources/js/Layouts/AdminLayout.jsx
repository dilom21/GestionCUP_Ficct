import Navbar from '@/Components/navigation/Navbar';
import SidebarAdmin from '@/Components/navigation/SidebarAdmin';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { sincronizarPermisos } from '@/Helpers/Permisos';

export default function AdminLayout({ children }) {
    const { props } = usePage();

    useEffect(() => {
        // Sincronizar permisos desde Inertia a sessionStorage cuando cambian
        const permisos = props?.auth?.usuario_permisos;
        if (permisos) {
            sincronizarPermisos(permisos);
        }
    }, [props?.auth?.usuario_permisos]);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <SidebarAdmin />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
