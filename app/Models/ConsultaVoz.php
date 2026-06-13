<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultaVoz extends Model
{
    protected $table = 'consulta_voz';

    protected $fillable = [
        'id_usuario',
        'consulta_texto',
        'tipo_reporte',
        'parametros',
        'resultado_resumen',
        'resultado_datos',
        'ip',
        'procesado',
    ];

    protected $casts = [
        'parametros' => 'array',
        'resultado_datos' => 'array',
        'procesado' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id');
    }
}
