<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResetPassword extends Model
{
    protected $table = 'reset_password';

    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'token_hash',
        'created_at',
        'expires_at',
        'used',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'expires_at' => 'datetime',
            'used' => 'boolean',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}
