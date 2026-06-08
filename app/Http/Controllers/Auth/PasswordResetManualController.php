<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ResetPassword;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetManualController extends Controller
{
    private const GENERIC_MESSAGE = 'Si el correo existe, se enviará un enlace de recuperación.';

    public function showForgotPassword(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function sendResetLink(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'correo' => ['required', 'email'],
        ], [
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'Ingresa un correo electrónico válido.',
        ]);

        $usuario = User::where('correo', $validated['correo'])->first();

        if (!$usuario) {
            return back()->with('status', self::GENERIC_MESSAGE);
        }

        $token = DB::transaction(function () use ($usuario): string {
            ResetPassword::where('id_usuario', $usuario->id)
                ->where('used', false)
                ->update(['used' => true]);

            $token = Str::random(64);

            ResetPassword::create([
                'id_usuario' => $usuario->id,
                'token_hash' => $token,
                'created_at' => now(),
                'expires_at' => now()->addMinutes(30),
                'used' => false,
            ]);

            return $token;
        });

        try {
            $this->sendEmail($usuario, $token);
        } catch (\Throwable $exception) {
            Log::error('No se pudo conectar con Resend para enviar la recuperación.', [
                'message' => $exception->getMessage(),
                'id_usuario' => $usuario->id,
            ]);
        }

        return back()->with('status', self::GENERIC_MESSAGE);
    }

    public function showResetPassword(string $token): Response|RedirectResponse
    {
        $reset = ResetPassword::where('token_hash', $token)->first();

        if (!$this->isValid($reset)) {
            return redirect('/login')->withErrors([
                'token' => 'El enlace de recuperación es inválido o expiró.',
            ]);
        }

        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
        ]);
    }

    public function resetPassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers(),
            ],
        ], [
            'token.required' => 'El token de recuperación es obligatorio.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'La confirmación de contraseña no coincide.',
        ]);

        $updated = DB::transaction(function () use ($validated): bool {
            $reset = ResetPassword::where('token_hash', $validated['token'])
                ->lockForUpdate()
                ->first();

            if (!$this->isValid($reset)) {
                return false;
            }

            $usuario = User::whereKey($reset->id_usuario)
                ->lockForUpdate()
                ->first();

            if (!$usuario) {
                $reset->update(['used' => true]);

                return false;
            }

            $usuario->password = Hash::make($validated['password']);
            $usuario->save();

            $reset->update(['used' => true]);

            return true;
        });

        if (!$updated) {
            return redirect('/login')->withErrors([
                'token' => 'El enlace de recuperación es inválido o expiró.',
            ]);
        }

        return redirect('/login')->with(
            'status',
            'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'
        );
    }

    private function isValid(?ResetPassword $reset): bool
    {
        return $reset !== null
            && !$reset->used
            && $reset->expires_at->greaterThanOrEqualTo(now());
    }

    private function sendEmail(User $usuario, string $token): void
    {
        $url = url('/reset-password/'.$token);
        $nombre = e(trim($usuario->nombre.' '.$usuario->apellidos));
        $safeUrl = e($url);

        $html = <<<HTML
        <h1>Recuperación de contraseña</h1>
        <p>Hola, {$nombre}.</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="{$safeUrl}">Restablecer contraseña</a></p>
        <p>Este enlace expirará en 30 minutos.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        HTML;

        $response = Http::withToken(env('RESEND_API_KEY'))
            ->acceptJson()
            ->post('https://api.resend.com/emails', [
                'from' => sprintf(
                    '%s <%s>',
                    env('RESEND_FROM_NAME'),
                    env('RESEND_FROM_EMAIL')
                ),
                'to' => [env('EMAIL_TEST')],
                'subject' => 'Recuperación de contraseña',
                'html' => $html,
            ]);

        if ($response->failed()) {
            Log::error('Resend no pudo enviar el correo de recuperación.', [
                'status' => $response->status(),
                'response' => $response->body(),
                'id_usuario' => $usuario->id,
            ]);
        }
    }
}
