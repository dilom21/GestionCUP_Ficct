<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConsultaVoz;
use App\Services\InterpretadorConsultaService;
use App\Services\BitacoraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultaVozController extends Controller
{
    public function procesar(Request $request): JsonResponse
    {
        $request->validate([
            'consulta_texto' => 'required|string|max:500',
        ]);

        $texto = $request->input('consulta_texto');

        $interpretador = new InterpretadorConsultaService();
        $interpretacion = $interpretador->interpretar($texto);

        $reporteController = new ReporteController();
        $requestFake = new Request([
            'tipo'   => $interpretacion['tipo'],
            'filtros' => $interpretacion['filtros'],
        ]);
        $resultado = $reporteController->generar($requestFake)->getData(true);

        $resumen = $this->generarResumen($interpretacion['tipo'], $resultado);

        $consulta = ConsultaVoz::create([
            'id_usuario'       => session('usuario_id'),
            'consulta_texto'   => $texto,
            'tipo_reporte'     => $interpretacion['tipo'],
            'parametros'       => $interpretacion['filtros'],
            'resultado_resumen' => $resumen,
            'resultado_datos'  => $resultado,
            'ip'               => $request->ip(),
        ]);

        BitacoraService::registrar(
            "Consulta por voz: {$texto}",
            session('usuario_id'),
            'consulta_voz'
        );

        return response()->json([
            'success'       => true,
            'consulta'      => $consulta,
            'interpretacion' => $interpretacion,
            'resultado'     => $resultado,
            'resumen'       => $resumen,
        ]);
    }

    public function historial(Request $request): JsonResponse
    {
        $consultas = ConsultaVoz::with('usuario:id,nombre,apellidos')
            ->when(session('usuario_id'), fn($q) => $q->where('id_usuario', session('usuario_id')))
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return response()->json(['consultas' => $consultas]);
    }

    private function generarResumen(string $tipo, array $resultado): string
    {
        $data = $resultado['data'] ?? [];

        return match ($tipo) {
            'lista_general' => count($data) . ' postulantes en total.',
            'aprobados' => count($data) . ' postulantes aprobados.',
            'reprobados' => count($data) . ' postulantes reprobados.',
            'promedios' => 'Promedio general: ' . ($data['promedio_general'] ?? '—') . '. ' . ($data['total_resultados'] ?? 0) . ' estudiantes.',
            'grupos_habilitados' => collect($data)->sum('cantidad') . ' grupos habilitados.',
            'estadisticas_materia' => count($data) . ' materias con estadísticas.',
            'docentes_grupos' => collect($data)->pluck('docente')->unique()->count() . ' docentes en ' . count($data) . ' asignaciones.',
            'top_grupos' => 'Top ' . count($data) . ' grupos: el primero con ' . ($data[0]['aprobados'] ?? 0) . ' aprobados.',
            default => 'Consulta procesada con ' . count($data) . ' registros.',
        };
    }
}
