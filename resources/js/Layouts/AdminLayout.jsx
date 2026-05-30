import React from 'react';
import Navbar from '@/Components/Navbar';
import SidebarAdmin from '@/Components/SidebarAdmin';

export default function AdminLayout({ children }) {
    return (
        <div className="flex">
            <SidebarAdmin />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="p-6 bg-gray-100 min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}