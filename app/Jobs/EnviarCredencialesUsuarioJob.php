<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\ResendEmailService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;

class EnviarCredencialesUsuarioJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    public User $usuario;
    public string $passwordPlano;

    public function __construct(User $usuario, string $passwordPlano)
    {
        $this->usuario = $usuario;
        $this->passwordPlano = $passwordPlano;
    }

    public function handle(ResendEmailService $resend): void
    {
        $nombreCompleto = e($this->usuario->nombre . ' ' . $this->usuario->apellidos);
        $correo = e($this->usuario->correo);
        $password = e($this->passwordPlano);
        $rolNombre = e($this->usuario->rol?->nombre ?? 'Usuario');
        $loginUrl = url('/login');

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f7fc; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 30px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 8px;">🎓</div>
            <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 700;">Curso Preuniversitario FICCT</h1>
            <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 6px 0 0 0;">Facultad de Ciencias de la Computación y Telecomunicaciones</p>
        </div>
        <div style="padding: 30px;">
            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 6px 0;">¡Bienvenido(a), {$nombreCompleto}!</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Se ha creado tu cuenta de acceso al sistema de gestión del CUP con el rol <strong>{$rolNombre}</strong>.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #475569;">TUS CREDENCIALES DE ACCESO</p>
                <table style="width: 100%; font-size: 14px;">
                    <tr><td style="padding: 6px 0; color: #64748b;">Correo:</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">{$correo}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Contraseña temporal:</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b; font-family: monospace;">{$password}</td></tr>
                </table>
            </div>
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
            <div style="text-align: center; margin: 25px 0;">
                <a href="{$loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; padding: 13px 40px; border-radius: 10px; font-size: 15px; font-weight: 600;">Ingresar a la plataforma</a>
            </div>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Curso Preuniversitario FICCT — Facultad de Ciencias de la Computación y Telecomunicaciones</p>
        </div>
    </div>
</body>
</html>
HTML;

        $resend->enviar($this->usuario->correo, "Bienvenido al CUP FICCT – Credenciales de Acceso", $html);
    }
}
