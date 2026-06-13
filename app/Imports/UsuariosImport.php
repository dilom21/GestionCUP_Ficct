<?php

namespace App\Imports;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\Importable;

class UsuariosImport implements ToModel, WithHeadingRow, WithValidation
{
    use Importable;

    protected string $batchId;
    protected array $errores = [];
    protected array $creados = [];
    protected array $rolesCache = [];

    public function __construct(string $batchId)
    {
        $this->batchId = $batchId;
    }

    public function model(array $row)
    {
        $nombre  = trim($row['nombre'] ?? '');
        $apellidos = trim($row['apellido'] ?? '');
        $correo  = trim($row['correo'] ?? '');
        $rolNombre = trim($row['rol'] ?? '');

        if (empty($nombre) || empty($apellidos) || empty($correo) || empty($rolNombre)) {
            $this->errores[] = [
                'fila'   => $this->getRowNum(),
                'campo'  => 'general',
                'motivo' => 'La fila tiene campos obligatorios vacíos (Nombre, Apellido, Correo, Rol).',
            ];
            return null;
        }

        $correo = strtolower($correo);

        if (User::where('correo', $correo)->exists()) {
            $this->errores[] = [
                'fila'   => $this->getRowNum(),
                'campo'  => 'Correo',
                'motivo' => "El correo '{$correo}' ya existe en el sistema.",
            ];
            return null;
        }

        $rol = $this->resolverRol($rolNombre);
        if (!$rol) {
            $this->errores[] = [
                'fila'   => $this->getRowNum(),
                'campo'  => 'Rol',
                'motivo' => "El rol '{$rolNombre}' no existe en el sistema.",
            ];
            return null;
        }

        $passwordPlano = Str::random(10);

        $usuario = User::create([
            'nombre'            => $nombre,
            'apellidos'         => $apellidos,
            'correo'            => $correo,
            'password'          => Hash::make($passwordPlano),
            'id_rol'            => $rol->id,
            'estado'            => 'Activo',
            'intentos_fallidos' => 0,
            'import_batch'      => $this->batchId,
        ]);

        $this->creados[] = [
            'usuario'       => $usuario,
            'passwordPlano' => $passwordPlano,
        ];

        return $usuario;
    }

    public function rules(): array
    {
        return [
            '*.nombre'  => 'required|string|max:100',
            '*.apellido' => 'required|string|max:150',
            '*.correo'  => 'required|string|email|max:180',
            '*.rol'     => 'required|string|max:100',
        ];
    }

    public function getCreados(): array
    {
        return $this->creados;
    }

    public function getErrores(): array
    {
        return $this->errores;
    }

    protected function resolverRol(string $nombre): ?Rol
    {
        $key = strtolower(trim($nombre));
        if (isset($this->rolesCache[$key])) {
            return $this->rolesCache[$key];
        }

        $rol = Rol::whereRaw('LOWER(nombre) = ?', [$key])->first();
        $this->rolesCache[$key] = $rol;
        return $rol;
    }

    protected int $rowNum = 0;

    protected function getRowNum(): int
    {
        return ++$this->rowNum;
    }
}
