import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function PagosIndex({ pagos }) {
    const [searchTerm, setSearchTerm] = useState('');

    const pagosFiltrados = useMemo(() => {
        if (!searchTerm.trim()) return pagos;
        const term = searchTerm.toLowerCase();
        return pagos.filter(
            (p) =>
                p.cod_transaccion?.toLowerCase().includes(term) ||
                p.postulante?.toLowerCase().includes(term) ||
                p.estado_pago?.toLowerCase().includes(term) ||
                String(p.id_postulacion).includes(term)
        );
    }, [pagos, searchTerm]);

    const badgeColor = (estado) => {
        switch (estado) {
            case 'Confirmado':
                return 'bg-green-100 text-green-800';
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'Rechazado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <Head title="Pagos" />

            <div className="py-8 px-6">
                {/* Encabezado */}
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Pagos
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Listado de pagos registrados en el sistema.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Total: {pagos.length} pago(s)
                        </span>
                    </div>
                </div>

                {/* Buscador */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por transacción, postulante, estado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full max-w-md rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto bg-white rounded-lg shadow ring-1 ring-black/5">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Postulación
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Postulante (CI)
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Monto
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Transacción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pagosFiltrados.length > 0 ? (
                                pagosFiltrados.map((pago) => (
                                    <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {pago.id}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                            #{pago.id_postulacion}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {pago.postulante}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Bs {pago.monto}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {pago.fecha_pago}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor(pago.estado_pago)}`}>
                                                {pago.estado_pago}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate" title={pago.cod_transaccion}>
                                            {pago.cod_transaccion}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">
                                        {searchTerm
                                            ? 'No se encontraron pagos con ese criterio de búsqueda.'
                                            : 'No hay pagos registrados en el sistema.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}