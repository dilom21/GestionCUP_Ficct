import AdminLayout from '@/Layouts/AdminLayout';
import useGestionRoles from './_hooks/useGestionRoles';
import RolesPageHeader from './_components/RolesPageHeader';
import RolesTable from './_components/RolesTable';
import RolModal from './_components/RolModal';
import PermisosViewModal from './_components/PermisosViewModal';

/**
 * Página principal de Gestión de Roles con asignación de permisos por módulo.
 * Diseño profesional, responsive y con animaciones suaves.
 */
export default function RolesIndex({ roles, modulos }) {
    const {
        // Estados
        rolesFiltrados,
        searchTerm,
        setSearchTerm,
        errors,
        processing,
        animatingFunciones,
        animatingPermisos,

        // Datos del modal
        showModal,
        editingRol,
        selectedFunciones,
        loadingFunciones,
        moduloExpandido,
        data,
        setData,
        modulos: modulosData,

        // Datos del modal de visualización
        showPermisosModal,
        selectedRolForPermisos,

        // Acciones
        openCreateModal,
        openEditModal,
        closeModal,
        handleSubmit,
        handleDelete,
        clearAllPermisos,
        openPermisosModal,
        closePermisosModal,

        // Utilidades de permisos
        agruparPorEntidad,
        getOpcionEntidad,
        getOpcionLabel,
        getOpcionColor,
        handleOpcionEntidad,
        getModuloEstado,
        contarPermisos,
        toggleModuloCompleto,
        toggleModulo,
    } = useGestionRoles({ roles, modulos });

    return (
        <AdminLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* ─── Hero Header ─── */}
                    <RolesPageHeader
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onCreateRole={openCreateModal}
                        totalRoles={roles?.length || 0}
                    />

                    {/* ─── Tabla de Roles ─── */}
                    <RolesTable
                        roles={rolesFiltrados}
                        searchTerm={searchTerm}
                        onEditRole={openEditModal}
                        onDeleteRole={handleDelete}
                        onViewPermisos={openPermisosModal}
                    />

                    {/* ─── MODAL: Crear/Editar Rol con Permisos por Módulo ─── */}
                    <RolModal
                        showModal={showModal}
                        editingRol={editingRol}
                        loadingFunciones={loadingFunciones}
                        animatingFunciones={animatingFunciones}
                        processing={processing}
                        errors={errors}
                        data={data}
                        setData={setData}
                        modulos={modulosData}
                        selectedFunciones={selectedFunciones}
                        moduloExpandido={moduloExpandido}
                        searchTerm={searchTerm}
                        onClose={closeModal}
                        handleSubmit={handleSubmit}
                        toggleModulo={toggleModulo}
                        agruparPorEntidad={agruparPorEntidad}
                        getOpcionEntidad={getOpcionEntidad}
                        getOpcionLabel={getOpcionLabel}
                        getOpcionColor={getOpcionColor}
                        handleOpcionEntidad={handleOpcionEntidad}
                        getModuloEstado={getModuloEstado}
                        contarPermisos={contarPermisos}
                        toggleModuloCompleto={toggleModuloCompleto}
                        clearAllPermisos={clearAllPermisos}
                    />

                    {/* ─── MODAL: Visualización de Permisos ─── */}
                    <PermisosViewModal
                        showPermisosModal={showPermisosModal}
                        selectedRolForPermisos={selectedRolForPermisos}
                        animatingPermisos={animatingPermisos}
                        modulos={modulosData}
                        selectedFunciones={selectedFunciones}
                        onClose={closePermisosModal}
                        agruparPorEntidad={agruparPorEntidad}
                        getOpcionEntidad={getOpcionEntidad}
                        getOpcionLabel={getOpcionLabel}
                    />

                    {/* ─── Estilos para scrollbar personalizado ─── */}
                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 5px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 3px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #94a3b8;
                        }
                    `}</style>
                </div>
            </div>
        </AdminLayout>
    );
}