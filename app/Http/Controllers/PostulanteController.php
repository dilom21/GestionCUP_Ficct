<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Exception;

class PostulanteController extends Controller
{
    /**
     * Muestra el formulario de registro en React
     */
    public function create()
    {
        // Esto renderizará el componente React ubicado en resources/js/Pages/Postulantes/Create.jsx
        return Inertia::render('Postulantes/Create');
    }

    /**
     * Guarda el postulante y calcula su estado (Aprobado/Reprobado)
     */
    public function store(Request $request)
    {
        // 1. REQUERIMIENTO: Validaciones PHP estrictas
        $validated = $request->validate([
            'ci' => 'required|string|max:15|unique:postulantes',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            // Notas para la fórmula
            'nota1' => 'required|numeric|min:0|max:100',
            'nota2' => 'required|numeric|min:0|max:100',
            'nota3' => 'required|numeric|min:0|max:100',
        ]);

        // 2. REQUERIMIENTO: Manejar errores correctamente (Try-Catch)
        try {
            DB::beginTransaction(); // Protegemos la transacción a la base de datos

            // 3. REQUERIMIENTO: Algoritmo de Cálculo de Promedio (Fórmula exacta del documento)
            $promedio = ($request->nota1 + $request->nota2 + $request->nota3) / 3;

            // Condición estricta de aprobación
            if ($promedio >= 60) {
                $estado = 'APROBADO';
            } else {
                $estado = 'REPROBADO';
            }

            // Aquí iría el código para guardar en tu tabla 'postulantes'
            // Postulante::create([...]);

            DB::commit(); // Confirmamos que todo salió bien

            // Redirigimos al frontend (React) con un mensaje de éxito
            return redirect()->back()->with('success', 'Postulante registrado con estado: ' . $estado);

        } catch (Exception $e) {
            DB::rollBack(); // Si algo falla, revertimos la base de datos para no dejar datos corruptos

            // Retornamos el error de forma amigable sin que explote la pantalla de Laravel
            return redirect()->back()->withErrors(['error' => 'Ocurrió un error al registrar el postulante: ' . $e->getMessage()]);
        }
    }
}