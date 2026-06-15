<?php

namespace Tests\Feature;

use App\Models\GestionCup;
use App\Models\Grupo;
use App\Models\InscripcionCup;
use App\Models\Postulacion;
use App\Services\InscripcionCupService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class InscripcionCupServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('gestion_cup', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre_gestion');
            $table->date('fecha_inicio_inscripcion');
            $table->date('fecha_fin_inscripcion');
            $table->date('fecha_inicio_clases');
            $table->date('fecha_fin_clases');
        });

        Schema::create('postulacion', function (Blueprint $table) {
            $table->increments('id');
            $table->string('turno')->nullable();
        });
        
        Schema::create('grupo', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_gestion_cup');
            $table->string('sigla');
            $table->integer('cupo_maximo');
            $table->string('turno');
            $table->string('modalidad');
            $table->string('estado');
        });

        Schema::create('inscripcion_cup', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_postulacion')->unique();
            $table->unsignedInteger('id_grupo');
            $table->unsignedInteger('id_gestion_cup');
            $table->timestamp('fecha_inscripcion');
            $table->string('estado');
        });
    }

    public function test_asigna_un_grupo_disponible_del_turno_elegido(): void
    {
        $gestion = $this->crearGestion();
        $grupo = Grupo::create([
            'id_gestion_cup' => $gestion->id,
            'sigla' => 'T001',
            'cupo_maximo' => 2,
            'turno' => 'Tarde',
            'modalidad' => 'Presencial',
            'estado' => 'Activo',
        ]);
        $postulacion = Postulacion::create(['turno' => 'Tarde']);

        $inscripcion = app(InscripcionCupService::class)->inscribir($postulacion);

        $this->assertSame($grupo->id, $inscripcion->id_grupo);
        $this->assertSame('Tarde', $inscripcion->grupo->turno);
    }

    public function test_crea_un_grupo_nuevo_si_todos_los_del_turno_estan_llenos(): void
    {
        $gestion = $this->crearGestion();
        $grupoLleno = Grupo::create([
            'id_gestion_cup' => $gestion->id,
            'sigla' => 'T001',
            'cupo_maximo' => 1,
            'turno' => 'Tarde',
            'modalidad' => 'Presencial',
            'estado' => 'Activo',
        ]);
        $ocupante = Postulacion::create(['turno' => 'Tarde']);
        InscripcionCup::create([
            'id_postulacion' => $ocupante->id,
            'id_grupo' => $grupoLleno->id,
            'id_gestion_cup' => $gestion->id,
            'fecha_inscripcion' => now(),
            'estado' => 'Inscrito',
        ]);
        $postulacion = Postulacion::create(['turno' => 'Tarde']);

        $inscripcion = app(InscripcionCupService::class)->inscribir($postulacion);

        $this->assertNotSame($grupoLleno->id, $inscripcion->id_grupo);
        $this->assertSame('T002', $inscripcion->grupo->sigla);
        $this->assertSame('Tarde', $inscripcion->grupo->turno);
        $this->assertSame(80, $inscripcion->grupo->cupo_maximo);
    }

    public function test_no_duplica_la_inscripcion_si_se_confirma_dos_veces(): void
    {
        $gestion = $this->crearGestion();
        Grupo::create([
            'id_gestion_cup' => $gestion->id,
            'sigla' => 'M001',
            'cupo_maximo' => 80,
            'turno' => 'Mañana',
            'modalidad' => 'Presencial',
            'estado' => 'Activo',
        ]);
        $postulacion = Postulacion::create(['turno' => 'Mañana']);

        $primera = app(InscripcionCupService::class)->inscribir($postulacion);
        $segunda = app(InscripcionCupService::class)->inscribir($postulacion);

        $this->assertSame($primera->id, $segunda->id);
        $this->assertSame(1, InscripcionCup::where('id_postulacion', $postulacion->id)->count());
    }

    private function crearGestion(): GestionCup
    {
        return GestionCup::create([
            'nombre_gestion' => '1-2026',
            'fecha_inicio_inscripcion' => '2026-01-01',
            'fecha_fin_inscripcion' => '2026-06-30',
            'fecha_inicio_clases' => '2026-07-01',
            'fecha_fin_clases' => '2026-12-15',
        ]);
    }
}
