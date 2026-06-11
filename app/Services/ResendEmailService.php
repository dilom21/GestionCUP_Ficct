<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ResendEmailService
{
    private string $apiKey;
    private string $fromEmail;
    private string $fromName;
    private string $testEmail = '';

    public function __construct()
    {
        $this->apiKey = env('RESEND_API_KEY');
        $this->fromEmail = env('RESEND_FROM_EMAIL');
        $this->fromName = env('RESEND_FROM_NAME');
        $this->testEmail = env('EMAIL_TEST', '');
    }

    /**
     * Enviar un correo usando Resend.
     *
     * @param string $to      Destinatario (se usará EMAIL_TEST si está configurado)
     * @param string $subject Asunto
     * @param string $html    Contenido HTML del correo
     * @return bool
     */
    public function enviar(string $to, string $subject, string $html): bool
    {
        $destinatario = $this->testEmail ?: $to;

        $response = Http::withToken($this->apiKey)
            ->acceptJson()
            ->post('https://api.resend.com/emails', [
                'from' => "{$this->fromName} <{$this->fromEmail}>",
                'to' => [$destinatario],
                'subject' => $subject,
                'html' => $html,
            ]);

        if ($response->failed()) {
            Log::error('Resend no pudo enviar el correo.', [
                'status' => $response->status(),
                'response' => $response->body(),
                'to' => $destinatario,
                'subject' => $subject,
            ]);
            return false;
        }

        return true;
    }
}