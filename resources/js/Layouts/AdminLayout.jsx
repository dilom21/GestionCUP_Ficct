import Navbar from '@/Components/navigation/Navbar';
import SidebarAdmin from '@/Components/navigation/SidebarAdmin';

export default function AdminLayout({ children }) {
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