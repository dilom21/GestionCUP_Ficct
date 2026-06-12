<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('es_ES');
        $password = Hash::make('123');

        $this->command->info('Iniciando la población masiva para la FICCT...');

        DB::table('rol')->insertOrIgnore([
            ['id_rol' => 1, 'nombre' => 'Administrador'],
            ['id_rol' => 2, 'nombre' => 'Administrativo'],
            ['id_rol' => 3, 'nombre' => 'Director de Carrera'],
            ['id_rol' => 4, 'nombre' => 'Docente'],
            ['id_rol' => 5, 'nombre' => 'Postulante'],
        ]);

        $this->call(RolFuncionSeeder::class);

        DB::table('gestion_cup')->insertOrIgnore([
            ['id_gestion_cup' => 1, 'nombre_gestion' => '1-2023'],
            ['id_gestion_cup' => 2, 'nombre_gestion' => '2-2023'],
            ['id_gestion_cup' => 3, 'nombre_gestion' => '1-2024'],
        ]);

        for ($c = 1; $c <= 4; $c++) {
            DB::table('carrera')->insertOrIgnore([
                'id_carrera' => $c,
                'nombre' => "Carrera $c",
                'sigla' => "CAR$c",
            ]);
        }

        // Crear docentes ANTES de DocenteAsignacionSeeder
        $this->command->info('Creando docentes de prueba...');
        $docenteIds = [];
        for ($d = 1; $d <= 3; $d++) {
            $idDocUsuario = DB::table('usuario')->insertGetId([
                'nombre' => $faker->firstName,
                'apellidos' => $faker->lastName . ' ' . $faker->lastName,
                'correo' => $faker->unique()->safeEmail,
                'password' => $password,
                'id_rol' => 4,
                'estado' => 'Activo',
                'telefono' => $faker->phoneNumber,
                'intentos_fallidos' => 0,
                'bloqueado_hasta' => null,
            ]);
            $idDocente = DB::table('docente')->insertGetId([
                'id_usuario' => $idDocUsuario,
                'ci' => $faker->unique()->numerify('########'),
                'profesion' => 'Ingeniero',
                'grado_academico' => 'Licenciatura',
                'experiencia_anios' => $faker->numberBetween(2, 15),
                'maximo_grupos' => 4,
            ]);
            $docenteIds[] = $idDocente;
        }

        // Ahora DocenteAsignacionSeeder encuentra docentes
        $this->call(DocenteAsignacionSeeder::class);

        // Crear grupos base
        $turnos = ['Mañana', 'Tarde', 'Noche'];
        $gestionActiva = DB::table('gestion_cup')->first();
        if ($gestionActiva) {
            foreach ($turnos as $t) {
                DB::table('grupo')->insertOrIgnore([
                    'sigla' => substr($t, 0, 1) . 'A',
                    'id_gestion_cup' => $gestionActiva->id_gestion_cup,
                    'turno' => $t,
                    'cupo_maximo' => 80,
                    'modalidad' => 'Presencial',
                    'estado' => 'Activo',
                ]);
            }
        }

        $gestiones = [1, 2, 3];

        foreach ($gestiones as $id_gestion) {
            $this->command->info("Poblando 100 alumnos para la Gestión ID: $id_gestion ...");

            for ($i = 0; $i < 100; $i++) {
                $nombre = $faker->firstName;
                $apellidos = $faker->lastName . ' ' . $faker->lastName;
                $correo = $faker->unique()->safeEmail;
                $telefono = $faker->phoneNumber;

                $id_usuario = DB::table('usuario')->insertGetId([
                    'nombre' => $nombre,
                    'apellidos' => $apellidos,
                    'correo' => $correo,
                    'password' => $password,
                    'id_rol' => 5,
                    'estado' => 'Activo',
                    'telefono' => $telefono,
                    'intentos_fallidos' => 0,
                    'bloqueado_hasta' => null,
                ]);

                $id_postulante = DB::table('postulante')->insertGetId([
                    'id_usuario' => $id_usuario,
                    'nombre' => $nombre,
                    'apellidos' => $apellidos,
                    'correo' => $correo,
                    'telefono' => $telefono,
                    'ci' => $faker->unique()->numerify('########'),
                    'fecha_nacimiento' => $faker->dateTimeBetween('2003-01-01', '2006-12-31')->format('Y-m-d'),
                    'sexo' => $faker->randomElement(['M', 'F']),
                    'ciudad' => $faker->randomElement(['Santa Cruz', 'Montero', 'Warnes', 'La Guardia']),
                    'direccion' => $faker->streetAddress,
                    'colegio_procedencia' => $faker->company . ' School',
                    'estado_postulante' => 'Habilitado',
                ]);

                $turno = $faker->randomElement(['Mañana', 'Tarde', 'Noche']);
                $id_postulacion = DB::table('postulacion')->insertGetId([
                    'id_postulante' => $id_postulante,
                    'id_carrera_opcion_1' => $faker->numberBetween(1, 2),
                    'id_carrera_opcion_2' => $faker->numberBetween(3, 4),
                    'nro_formulario' => 'F-' . $id_gestion . '-' . $faker->unique()->numerify('####'),
                    'estado_postulacion' => 'Aprobado',
                    'turno' => $turno,
                    'fecha_postulacion' => $faker->dateTimeBetween('2023-01-01', '2024-12-31'),
                ]);

                DB::table('pago')->insert([
                    'id_postulacion' => $id_postulacion,
                    'monto' => 350.00,
                    'referencia' => 'Stripe',
                    'estado_pago' => 'Confirmado',
                    'cod_transaccion' => 'TX-' . $faker->regexify('[A-Z0-9]{8}'),
                ]);

                $grupos = DB::table('grupo')->where('turno', $turno)->get();
                $idGrupo = $grupos->isNotEmpty() ? $grupos->random()->id : 1;

                $id_inscripcion = DB::table('inscripcion_cup')->insertGetId([
                    'id_postulacion' => $id_postulacion,
                    'id_grupo' => $idGrupo,
                    'id_gestion_cup' => $id_gestion,
                    'fecha_inscripcion' => now(),
                    'estado' => 'Inscrito',
                ]);

                $notas = [];
                for ($eval = 1; $eval <= 12; $eval++) {
                    $notas[] = [
                        'id_evaluacion' => $eval,
                        'id_inscripcion_cup' => $id_inscripcion,
                        'nota_obtenida' => $faker->numberBetween(30, 100),
                    ];
                }
                DB::table('nota')->insert($notas);
            }
        }

        $this->command->info('Población masiva completada exitosamente.');
    }
}
