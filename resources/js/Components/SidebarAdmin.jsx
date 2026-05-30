import React from 'react';
import { Link } from '@inertiajs/react';

export default function SidebarAdmin() {
    return (
        <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
            <h2 className="text-lg font-bold mb-6">Menú Admin</h2>
            <ul className="space-y-2">
                <li><Link href={route('admin.dashboard')} className="block px-3 py-2 rounded hover:bg-gray-700">Dashboard</Link></li>
                <li><Link href={route('admin.docentes')} className="block px-3 py-2 rounded hover:bg-gray-700">Docentes</Link></li>
                <li><Link href={route('admin.grupos')} className="block px-3 py-2 rounded hover:bg-gray-700">Grupos</Link></li>
                <li><Link href={route('admin.aulas')} className="block px-3 py-2 rounded hover:bg-gray-700">Aulas</Link></li>
                <li><Link href={route('admin.reportes')} className="block px-3 py-2 rounded hover:bg-gray-700">Reportes</Link></li>
            </ul>
        </aside>
    );
}