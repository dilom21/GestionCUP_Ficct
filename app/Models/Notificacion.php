<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificacion';
    public $timestamps = false;

    protected $fillable = [
        'titulo',
        'mensaje',
        'tipo',
        'icono',
        'link',
        'id_usuario',
        'leida',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'leida' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}
