import { useState, useCallback } from 'react';
import Navbar from '@/Components/navigation/Navbar';
import SidebarAdmin from '@/Components/navigation/SidebarAdmin';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { sincronizarPermisos } from '@/Helpers/Permisos';
import { PermisosProvider } from '@/Contexts/PermisosContext';

export default function AdminLayout({ children }) {
    const { props } = usePage();
    const permisos = props?.auth?.usuario_permisos || [];
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (permisos.length > 0) {
            sincronizarPermisos(permisos);
        }
    }, [permisos]);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    return (
        <PermisosProvider permisos={permisos}>
            <div className="flex min-h-screen bg-slate-50">
                <SidebarAdmin sidebarOpen={sidebarOpen} onClose={closeSidebar} />
                <div className="flex-1 flex flex-col min-w-0">
                    <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </PermisosProvider>
    );
}
