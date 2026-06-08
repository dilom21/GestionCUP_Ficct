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
        // Instanciamos Faker con nombres en Español
        $faker = Faker::create('es_ES');
        $password = Hash::make('123'); // Contraseña encriptada estándar

        $this->command->info('Iniciando la población masiva para la FICCT...');

        // 🔥 1. POBLAR CATÁLOGOS BÁSICOS
        DB::table('rol')->insertOrIgnore([
            ['id_rol' => 1, 'nombre' => 'Administrador'],
            ['id_rol' => 5, 'nombre' => 'Postulante'],
        ]);

        // Llamar al seeder de módulos, funciones y permisos de roles
        $this->call(RolFuncionSeeder::class);

        DB::table('gestion_cup')->insertOrIgnore([
            ['id_gestion_cup' => 1, 'nombre_gestion' => '1-2023'],
            ['id_gestion_cup' => 2, 'nombre_gestion' => '2-2023'],
            ['id_gestion_cup' => 3, 'nombre_gestion' => '1-2024'],
        ]);

        // Aseguramos que existan 4 carreras para el random
        for($c=1; $c<=4; $c++) {
            DB::table('carrera')->insertOrIgnore(['id_carrera' => $c, 'nombre' => "Carrera $c"]);
        }

        // 🔥 2. EL BUCLE MAESTRO (3 Gestiones x 100 Estudiantes)
        $gestiones = [1, 2, 3]; // IDs de las gestiones 1-2023, 2-2023, 1-2024

        foreach ($gestiones as $id_gestion) {
            $this->command->info("Poblando 100 alumnos para la Gestión ID: $id_gestion ...");

            for ($i = 0; $i < 100; $i++) {
                
                // A) Crear USUARIO
                $id_usuario = DB::table('usuario')->insertGetId([
                    'nombre' => $faker->firstName,
                    'apellidos' => $faker->lastName . ' ' . $faker->lastName,
                    'correo' => $faker->unique()->safeEmail,
                    'password' => $password,
                    'id_rol' => 5, // Rol Postulante
                    'estado' => 'Activo',
                ]);

                // B) Crear POSTULANTE
                $id_postulante = DB::table('postulante')->insertGetId([
                    'id_usuario' => $id_usuario,
                    'ci' => $faker->unique()->numerify('########'),
                    'fecha_nacimiento' => $faker->dateTimeBetween('2003-01-01', '2006-12-31')->format('Y-m-d'),
                    'sexo' => $faker->randomElement(['M', 'F']),
                    'ciudad' => $faker->randomElement(['Santa Cruz', 'Montero', 'Warnes', 'La Guardia']),
                    'direccion' => $faker->streetAddress,
                    'colegio_procedencia' => $faker->company . ' School',
                    'estado_postulante' => 'Habilitado',
                ]);

                // C) Crear POSTULACION (Eligiendo 2 carreras al azar)
                $id_postulacion = DB::table('postulacion')->insertGetId([
                    'id_postulante' => $id_postulante,
                    'id_carrera_opcion_1' => $faker->numberBetween(1, 2),
                    'id_carrera_opcion_2' => $faker->numberBetween(3, 4),
                    'nro_formulario' => 'F-' . $id_gestion . '-' . $faker->unique()->numerify('####'),
                ]);

                // D) Crear PAGO (Simulando Stripe)
                DB::table('pago')->insert([
                    'id_postulacion' => $id_postulacion,
                    'monto' => 300.00,
                    'referencia' => $faker->randomElement(['Stripe', 'PayPal']),
                    'estado_pago' => 'Confirmado',
                    'cod_transaccion' => 'TX-' . $faker->regexify('[A-Z0-9]{8}'),
                ]);

                // E) Crear INSCRIPCION_CUP
                $id_inscripcion = DB::table('inscripcion_cup')->insertGetId([
                    'id_postulacion' => $id_postulacion,
                    'id_grupo' => $faker->numberBetween(1, 6), // Asumiendo que tienes 6 grupos creados
                    'id_gestion_cup' => $id_gestion,
                ]);

                // F) Crear NOTAS (Asumiendo 12 evaluaciones en total)
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

        $this->command->info('¡Población masiva completada con éxito! 🚀');
    }
}