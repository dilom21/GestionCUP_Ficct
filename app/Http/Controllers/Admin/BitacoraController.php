<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bitacora;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BitacoraController extends Controller
{
    public function index(Request $request)
    {
        $query = Bitacora::with('usuario')
            ->orderBy('fecha_hora', 'desc');

        if ($request->filled('accion')) {
            $query->where('accion', 'ilike', '%' . $request->accion . '%');
        }

        if ($request->filled('id_usuario')) {
            $query->where('id_usuario', $request->id_usuario);
        }

        if ($request->filled('fecha_desde')) {
            $query->where('fecha_hora', '>=', $request->fecha_desde . ' 00:00:00');
        }

        if ($request->filled('fecha_hasta')) {
            $query->where('fecha_hora', '<=', $request->fecha_hasta . ' 23:59:59');
        }

        $registros = $query->paginate(20)->withQueryString();

        // Obtener usuarios para el filtro de empleados
        $usuarios = \App\Models\User::select('id', 'nombre', 'apellidos')
            ->orderBy('nombre')
            ->get()
            ->map(fn($u) => [
                'id_usuario' => $u->id,
                'nombre' => $u->nombre,
                'apellido' => $u->apellidos,
            ]);

        return Inertia::render('Admin/Bitacora/Index', [
            'registros' => $registros,
            'usuarios' => $usuarios,
            'filtros' => [
                'accion' => $request->accion ?? '',
                'id_usuario' => $request->id_usuario ?? '',
                'fecha_desde' => $request->fecha_desde ?? '',
                'fecha_hasta' => $request->fecha_hasta ?? '',
            ],
        ]);
    }
}