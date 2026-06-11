import Navbar from '@/Components/navigation/Navbar';
import SidebarAdmin from '@/Components/navigation/SidebarAdmin';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { sincronizarPermisos } from '@/Helpers/Permisos';
import { PermisosProvider } from '@/Contexts/PermisosContext';

export default function AdminLayout({ children }) {
    const { props } = usePage();
    const permisos = props?.auth?.usuario_permisos || [];

    useEffect(() => {
        if (permisos.length > 0) {
            sincronizarPermisos(permisos);
        }
    }, [permisos]);

    return (
        <PermisosProvider permisos={permisos}>
            <div className="flex min-h-screen bg-slate-50">
                <SidebarAdmin />
                <div className="flex-1 flex flex-col min-w-0">
                    <Navbar />
                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </PermisosProvider>
    );
}