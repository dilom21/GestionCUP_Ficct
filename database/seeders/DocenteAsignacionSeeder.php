<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocenteAsignacionSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Asignando materias, asignaciones académicas y horarios a todos los docentes...');

        $docentes = DB::table('docente')->get();
        $materias = DB::table('materia')->where('estado', 'Activo')->get();
        $grupos = DB::table('grupo')->where('estado', 'Activo')->get();
        $aulas = DB::table('aula')->where('estado', 'Activo')->get();
        $gestionActiva = DB::table('gestion_cup')->first();

        if ($docentes->isEmpty()) {
            $this->command->warn('No hay docentes para asignar.');
            return;
        }

        if ($materias->isEmpty() || $grupos->isEmpty() || $aulas->isEmpty()) {
            $this->command->warn('Faltan materias, grupos o aulas. Ejecute DatabaseSeeder primero.');
            return;
        }

        $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        $turnosHorarios = [
            'Mañana'  => ['07:00:00', '09:15:00'],
            'Tarde'   => ['14:00:00', '16:15:00'],
            'Noche'   => ['18:00:00', '20:15:00'],
        ];

        foreach ($docentes as $docente) {
            // Actualizar maximo_grupos a 4
            DB::table('docente')->where('id', $docente->id)->update(['maximo_grupos' => 4]);

            // Asignar cada materia al docente (docente_materia)
            foreach ($materias as $materia) {
                DB::table('docente_materia')->updateOrInsert(
                    ['id_docente' => $docente->id, 'id_materia' => $materia->id_materia],
                    ['estado' => 'Activo']
                );
            }

            // Crear asignacion_academica para cada materia en un grupo distinto
            foreach ($materias as $idx => $materia) {
                $grupo = $grupos[$idx % count($grupos)] ?? $grupos->first();
                $turno = $grupo->turno ?? 'Mañana';
                $ventana = $turnosHorarios[$turno] ?? $turnosHorarios['Mañana'];

                DB::table('asignacion_academica')->updateOrInsert(
                    [
                        'id_materia' => $materia->id_materia,
                        'id_grupo'   => $grupo->id,
                        'id_docente' => $docente->id,
                        'id_gestion_cup' => $gestionActiva->id,
                    ],
                    [
                        'carga_horaria' => 80,
                        'estado'        => 'Activo',
                    ]
                );

                // Obtener el ID real de la asignacion
                $asignacion = DB::table('asignacion_academica')
                    ->where('id_materia', $materia->id_materia)
                    ->where('id_grupo', $grupo->id)
                    ->where('id_docente', $docente->id)
                    ->first();

                if (!$asignacion) continue;

                // Crear horarios: un día por cada asignación (distribuir entre L-V)
                $dia = $diasSemana[$idx % count($diasSemana)];
                $aula = $aulas[$idx % count($aulas)];

                // Verificar si el horario ya existe para esta asignacion
                $existeHorario = DB::table('horario')
                    ->where('id_asignacion_academica', $asignacion->id)
                    ->where('dia_semana', $dia)
                    ->exists();

                if ($existeHorario) continue;

                // Intentar insertar; si hay conflicto de aula, buscar otra aula disponible
                $insertado = false;
                foreach ($aulas as $aulaCandidata) {
                    try {
                        DB::table('horario')->insert([
                            'id_asignacion_academica' => $asignacion->id,
                            'id_aula'                 => $aulaCandidata->id,
                            'dia_semana'              => $dia,
                            'horario_inicio'          => $ventana[0],
                            'horario_fin'             => $ventana[1],
                        ]);
                        $insertado = true;
                        break;
                    } catch (\Exception $e) {
                        continue;
                    }
                }

                if (!$insertado) {
                    $this->command->warn("No se pudo crear horario para asignación {$asignacion->id} (aulas ocupadas).");
                }
            }
        }

        $this->command->info('Docentes asignados correctamente con materias, asignaciones y horarios.');
    }
}
