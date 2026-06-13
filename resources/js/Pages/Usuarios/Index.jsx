import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ModalImportarUsuarios from './_components/ModalImportarUsuarios';

function EstadoBadge({ estado }) {
    const isActive = estado === 'Activo';
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isActive ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
            {estado}
        </span>
    );
}

export default function UsuariosIndex({ usuarios, roles }) {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [importResultado, setImportResultado] = useState(flash?.import_resultado || null);

    useEffect(() => {
        if (flash?.import_resultado && !showImportModal) {
            setImportResultado(flash.import_resultado);
            setShowImportModal(true);
        }
    }, [flash?.import_resultado]);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        nombre: '',
        apellidos: '',
        correo: '',
        password: '',
        password_confirmation: '',
        id_rol: '',
        estado: 'Activo',
    });

    function openCreateModal() {
        setEditingUsuario(null);
        reset();
        setShowModal(true);
    }

    function openEditModal(usuario) {
        setEditingUsuario(usuario);
        setData({
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            correo: usuario.correo,
            password: '',
            password_confirmation: '',
            id_rol: usuario.id_rol,
            estado: usuario.estado,
        });
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setEditingUsuario(null);
        reset();
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (editingUsuario) {
            put(route('usuarios.update', editingUsuario.id), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        } else {
            post(route('usuarios.store'), {
                onSuccess: () => closeModal(),
                onError: () => {},
            });
        }
    }

    function handleDeactivate(usuario) {
        if (confirm(`¿Está seguro de dar de baja al usuario "${usuario.nombre} ${usuario.apellidos}"?`)) {
            destroy(route('usuarios.destroy', usuario.id));
        }
    }

    return (
        <AdminLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* ─── Hero Header ─── */}
                    <div className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 shadow-xl">
                        <div className="absolute inset-0 bg-white/5"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    Gestión de Usuarios
                                </h1>
                                <p className="mt-1 text-emerald-100 text-sm max-w-xl">
                                    Administre las cuentas de los usuarios del sistema. Asigne roles, active o desactive accesos y mantenga el control de su plataforma.
                                </p>
                            </div>
                        </div>
                        <div className="absolute bottom-3 right-8 opacity-20">
                            <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Header with button */}
                    <div className="flex justify-end items-center gap-3 mb-6">
                        <button
                            onClick={() => { setShowImportModal(true); setImportResultado(null); }}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Importar Usuarios
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Nuevo Usuario
                        </button>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Correo
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Rol
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {usuarios.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                    </svg>
                                                    <p className="text-sm font-medium">No hay usuarios registrados</p>
                                                    <p className="text-xs mt-1">Cree un nuevo usuario para comenzar.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        usuarios.map((usuario) => (
                                            <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-bold mr-3 shadow-sm">
                                                            {usuario.nombre.charAt(0).toUpperCase()}{usuario.apellidos.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                {usuario.nombre} {usuario.apellidos}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {usuario.correo}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {usuario.rol}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <EstadoBadge estado={usuario.estado} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(usuario)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors mr-2"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Editar
                                                    </button>
                                                    {usuario.estado === 'Activo' && (
                                                        <button
                                                            onClick={() => handleDeactivate(usuario)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                            Dar de Baja
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" onClick={closeModal} />

                        <div className="relative inline-block w-full max-w-lg p-6 my-8 text-left bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Nombre */}
                                    <div>
                                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nombre <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={data.nombre}
                                            onChange={(e) => setData('nombre', e.target.value)}
                                            className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                errors.nombre ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Ej: Juan"
                                        />
                                        {errors.nombre && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
                                        )}
                                    </div>

                                    {/* Apellidos */}
                                    <div>
                                        <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Apellidos <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="apellidos"
                                            type="text"
                                            value={data.apellidos}
                                            onChange={(e) => setData('apellidos', e.target.value)}
                                            className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                errors.apellidos ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Ej: Pérez"
                                        />
                                        {errors.apellidos && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.apellidos}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Correo */}
                                <div>
                                    <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Correo Electrónico <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="correo"
                                        type="email"
                                        value={data.correo}
                                        onChange={(e) => setData('correo', e.target.value)}
                                        className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                            errors.correo ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Ej: juan.perez@example.com"
                                    />
                                    {errors.correo && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.correo}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Contraseña {!editingUsuario && <span className="text-red-500">*</span>}
                                        {editingUsuario && <span className="text-gray-400 text-xs ml-1">(dejar vacío para mantener)</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`w-full pr-10 px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                errors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder={editingUsuario ? 'Dejar vacío para mantener' : 'Mínimo 6 caracteres'}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Rol */}
                                    <div>
                                        <label htmlFor="id_rol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Rol <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="id_rol"
                                            value={data.id_rol}
                                            onChange={(e) => setData('id_rol', e.target.value)}
                                            className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                errors.id_rol ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">Seleccione un rol</option>
                                            {roles.map((rol) => (
                                                <option key={rol.id} value={rol.id}>
                                                    {rol.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.id_rol && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.id_rol}</p>
                                        )}
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Estado <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="estado"
                                            value={data.estado}
                                            onChange={(e) => setData('estado', e.target.value)}
                                            className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                errors.estado ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                        {errors.estado && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.estado}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Guardando...' : editingUsuario ? 'Actualizar Usuario' : 'Guardar Usuario'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    </div>
            )}

            <ModalImportarUsuarios
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                importResultado={importResultado}
                onDeshacer={() => {
                    setImportResultado(null);
                    setShowImportModal(false);
                }}
            />
        </AdminLayout>
    );
}