<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Postulacion;
use App\Services\BitacoraService;
use Illuminate\Http\Request;

class PostulacionKanbanController extends Controller
{
    public function index()
    {
        return inertia('Admin/PostulacionesPostulantes/Kanban');
    }

    public function tablero()
    {
        $postulaciones = Postulacion::with([
            'postulante:id_postulante,nombre,apellidos,ci',
            'carrera1:id_carrera,nombre',
            'documentos',
        ])
            ->orderBy('fecha_postulacion', 'desc')
            ->get()
            ->groupBy('estado_postulacion');

        $estados = ['Pendiente', 'Observado', 'Pago', 'Aprobado', 'Rechazado'];
        $columnas = collect();

        foreach ($estados as $estado) {
            $items = ($postulaciones->get($estado) ?? collect())->map(fn($p) => [
                'id'           => $p->id,
                'postulante'   => trim(($p->postulante?->nombre ?? '') . ' ' . ($p->postulante?->apellidos ?? '')),
                'ci'           => $p->postulante?->ci,
                'carrera'      => $p->carrera1?->nombre,
                'documentos'   => $p->documentos->count(),
                'fecha'        => $p->fecha_postulacion?->diffForHumans(),
            ]);

            $columnas->push([
                'estado' => $estado,
                'items'  => $items->values(),
                'total'  => $items->count(),
            ]);
        }

        return response()->json(['columnas' => $columnas]);
    }

    public function mover(Request $request, $id)
    {
        $request->validate(['estado' => 'required|in:Pendiente,Observado,Rechazado,Pago,Aprobado']);

        $postulacion = Postulacion::findOrFail($id);

        $estadosFinales = ['Aprobado'];
        if (in_array($postulacion->estado_postulacion, $estadosFinales)) {
            return response()->json(['error' => 'No se puede cambiar una postulación aprobada.'], 422);
        }

        $postulacion->update([
            'estado_postulacion'  => $request->estado,
            'fecha_revision'      => now(),
            'id_usuario_revisor'  => session('usuario_id'),
        ]);

        BitacoraService::registrar(
            "Kanban: Postulación #{$id} cambió a {$request->estado}",
            session('usuario_id'),
            'postulacion'
        );

        return response()->json(['success' => true]);
    }
}
