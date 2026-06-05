import React from 'react';

export default function Navbar() {
    return (
        <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
            <div className="font-bold text-lg">GestionCUP</div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">Usuario</span>
            </div>
        </nav>
    );
}