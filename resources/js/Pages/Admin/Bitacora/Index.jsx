import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

export default function BitacoraIndex({ registros, usuarios, filtros }) {
    const [accion, setAccion] = useState(filtros.accion);
    const [idUsuario, setIdUsuario] = useState(filtros.id_usuario);
    const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde);
    const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta);

    const aplicarFiltros = (e) => {
        e.preventDefault();
        router.get('/admin/bitacora', {
            accion: accion || '',
            id_usuario: idUsuario || '',
            fecha_desde: fechaDesde || '',
            fecha_hasta: fechaHasta || '',
        }, { preserveState: true });
    };

    const limpiarFiltros = () => {
        setAccion('');
        setIdUsuario('');
        setFechaDesde('');
        setFechaHasta('');
        router.get('/admin/bitacora');
    };

    const formatearFecha = (fecha) => {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout>
            <Head title="Bitácora de Operaciones" />

            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                    <div className="bg-slate-800 p-3 rounded-2xl text-white">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            Bitácora de Operaciones
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Consulta las acciones registradas en el sistema
                        </p>
                    </div>
                </div>

                {/* Filtros */}
                <form onSubmit={aplicarFiltros} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                Acción / Evento
                            </label>
                            <input
                                type="text"
                                value={accion}
                                onChange={(e) => setAccion(e.target.value)}
                                placeholder="Buscar acción..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                Usuario
                            </label>
                            <select
                                value={idUsuario}
                                onChange={(e) => setIdUsuario(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Todos los usuarios</option>
                                {usuarios.map((u) => (
                                    <option key={u.id_usuario} value={u.id_usuario}>
                                        {u.nombre} {u.apellido}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                Desde
                            </label>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                Hasta
                            </label>
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                        >
                            Limpiar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            Buscar / Filtrar
                        </button>
                    </div>
                </form>

                {/* Tabla */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {registros.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-base font-semibold text-slate-700 mb-1">No se encontraron registros</p>
                            <p className="text-sm">Prueba ajustando los filtros de búsqueda</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">ID</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Acción</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Tabla Afectada</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Fecha y Hora</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">IP</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Usuario</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {registros.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-xs">#{item.id}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-slate-800">{item.accion}</span>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{item.tabla_afectada}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{item.tabla_afectada}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-700 text-xs">
                                                {formatearFecha(item.fecha_hora)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-xs">{item.ip}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">
                                                        {item.usuario ? item.usuario.nombre.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-slate-700 block leading-tight">
                                                            {item.usuario ? `${item.usuario.nombre} ${item.usuario.apellidos}` : 'Sistema'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-mono">ID: {item.id_usuario}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
        </AdminLayout>
    );
}