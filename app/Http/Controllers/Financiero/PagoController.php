<?php

namespace App\Http\Controllers\Financiero;

use App\Http\Controllers\Controller;
use App\Models\Bitacora;
use App\Models\Pago;
use App\Models\Postulacion;
use App\Models\User as Usuario;
use App\Services\BitacoraService;
use App\Services\ResendEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class PagoController extends Controller
{
    const MONTO_INSCRIPCION_CENTAVOS = 35000;
    const MONEDA = 'bob';

    public function index()
    {
        $pagos = Pago::with('postulacion.postulante')
            ->orderBy('fecha_pago', 'desc')
            ->get()
            ->map(function ($pago) {
                return [
                    'id'              => $pago->id,
                    'id_postulacion'  => $pago->id_postulacion,
                    'monto'           => number_format($pago->monto, 2),
                    'fecha_pago'      => $pago->fecha_pago,
                    'referencia'      => $pago->referencia,
                    'estado_pago'     => $pago->estado_pago,
                    'cod_transaccion' => $pago->cod_transaccion,
                    'postulante'      => $pago->postulacion && $pago->postulacion->postulante
                        ? $pago->postulacion->postulante->ci
                        : 'N/A',
                ];
            });

        return inertia('Financiero/Pagos', [
            'pagos' => $pagos,
        ]);
    }

    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'id_postulacion' => 'required|integer|exists:postulacion,id',
            'token'          => 'nullable|string|max:64',
        ]);

        $idPostulacion = $request->input('id_postulacion');
        $token = $request->input('token');

        $postulacion = Postulacion::with('postulante')->find($idPostulacion);

        if (!$postulacion) {
            return response()->json(['error' => 'Postulación no encontrada'], 404);
        }

        $idUsuario = null;

        if ($token) {
            if ($postulacion->token_pago !== $token) {
                return response()->json(['error' => 'Token de pago inválido o ya utilizado'], 403);
            }
        } else {
            $idUsuario = session('usuario_id');
            if (!$idUsuario) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $postulante = $postulacion->postulante;
            if (!$postulante || $postulante->id_usuario != $idUsuario) {
                return response()->json([
                    'error' => 'No tienes permisos para realizar el pago de esta postulación',
                ], 403);
            }
        }

        $pagoExistente = Pago::where('id_postulacion', $idPostulacion)
            ->where('estado_pago', 'Confirmado')
            ->first();

        if ($pagoExistente) {
            return response()->json([
                'error' => 'Esta postulación ya tiene un pago confirmado',
            ], 409);
        }

        $montoCentavos = self::MONTO_INSCRIPCION_CENTAVOS;
        $montoBolivianos = $montoCentavos / 100;

        Bitacora::create([
            'accion'         => "Solicitud de pago iniciada para postulación ID {$idPostulacion}" . ($idUsuario ? " por usuario ID {$idUsuario}" : " vía token"),
            'fecha_hora'     => now(),
            'ip'             => $request->ip(),
            'id_usuario'     => $idUsuario,
            'tabla_afectada' => 'pago',
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'mode'                 => 'payment',
                'line_items'           => [
                    [
                        'price_data' => [
                            'currency'     => self::MONEDA,
                            'product_data' => [
                                'name' => 'Inscripción CUP - Gestión Académica',
                                'description' => "Pago de inscripción para postulación #{$idPostulacion}",
                            ],
                            'unit_amount'  => $montoCentavos,
                        ],
                        'quantity'   => 1,
                    ],
                ],
                'success_url' => url('/financiero/pago/exito?session_id={CHECKOUT_SESSION_ID}&id_postulacion=' . $idPostulacion),
                'cancel_url'  => url('/financiero/pago/cancelado?id_postulacion=' . $idPostulacion),
                'metadata'    => [
                    'id_postulacion' => (string) $idPostulacion,
                    'id_usuario'     => (string) ($idUsuario ?? 0),
                ],
            ]);

            Pago::create([
                'id_postulacion'  => $idPostulacion,
                'monto'           => $montoBolivianos,
                'fecha_pago'      => now(),
                'referencia'      => "Sesión Stripe: {$session->id}",
                'estado_pago'     => 'Pendiente',
                'cod_transaccion' => $session->id,
            ]);

            return response()->json([
                'url' => $session->url,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creando sesión Stripe: ' . $e->getMessage(), [
                'id_postulacion' => $idPostulacion,
                'id_usuario'     => $idUsuario,
            ]);

            return response()->json([
                'error' => 'Error al procesar el pago. Intente nuevamente.',
            ], 500);
        }
    }

    public function pagoExito(Request $request)
    {
        $idPostulacion = $request->input('id_postulacion');
        $sessionId = $request->input('session_id');

        if ($sessionId && $idPostulacion) {
            try {
                Stripe::setApiKey(config('services.stripe.secret'));
                $session = Session::retrieve($sessionId);
                if ($session->payment_status === 'paid') {
                    $this->procesarConfirmacionPago($session->id, $idPostulacion);
                }
            } catch (\Exception $e) {
                Log::error('Error verificando sesión Stripe en pagoExito', [
                    'session_id' => $sessionId,
                    'id_postulacion' => $idPostulacion,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return redirect('/preinscripcion?id=' . $idPostulacion . '&status=success');
    }

    public function pagoCancelado(Request $request)
    {
        $idPostulacion = $request->input('id_postulacion');

        return inertia('Financiero/PasarelaPago', [
            'status'         => 'cancelled',
            'id_postulacion' => $idPostulacion,
            'mensaje'        => 'El proceso de pago fue cancelado. Puedes intentarlo nuevamente cuando quieras.',
        ]);
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        if (!$endpointSecret) {
            Log::error('STRIPE_WEBHOOK_SECRET no configurado en .env');
            return response('Webhook secret not configured', 500);
        }

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            Log::error('Stripe webhook: payload inválido', ['error' => $e->getMessage()]);
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Stripe webhook: firma inválida', ['error' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $idPostulacion = $session->metadata->id_postulacion ?? null;

            if (!$idPostulacion) {
                Log::error('Stripe webhook: metadata sin id_postulacion', ['session_id' => $session->id]);
                return response('Missing id_postulacion in metadata', 400);
            }

            $this->procesarConfirmacionPago($session->id, $idPostulacion);
        }

        return response('Webhook received', 200);
    }

    private function procesarConfirmacionPago(string $sessionId, int $idPostulacion): bool
    {
        try {
            DB::beginTransaction();

            $pago = Pago::where('cod_transaccion', $sessionId)->first();
            if (!$pago) {
                Log::warning('Pago no encontrado para sesión', ['session_id' => $sessionId]);
                DB::rollBack();
                return false;
            }

            if ($pago->estado_pago === 'Confirmado') {
                DB::rollBack();
                return true;
            }

            $pago->update(['estado_pago' => 'Confirmado']);

            $postulacion = Postulacion::with('postulante')->findOrFail($idPostulacion);
            $postulacion->update([
                'estado_postulacion' => 'Aprobado',
                'token_pago'         => null,
            ]);

            $postulante = $postulacion->postulante;

            $password = Str::random(12);

            $usuario = Usuario::create([
                'nombre'    => $postulante->nombre,
                'apellidos' => $postulante->apellidos,
                'correo'    => $postulante->correo,
                'password'  => Hash::make($password),
                'id_rol'    => 5,
                'telefono'  => $postulante->telefono,
                'estado'    => 'Activo',
            ]);

            $postulante->update(['id_usuario' => $usuario->id]);

            DB::commit();

            try {
                $resendService = new ResendEmailService();
                $nombreCompleto = e($postulante->nombre . ' ' . $postulante->apellidos);
                $loginUrl = url('/login');
                $html = <<<HTML
                <h1>Inscripción Confirmada - CUP FICCT</h1>
                <p>Hola, <strong>{$nombreCompleto}</strong>.</p>
                <p>Tu pago ha sido <strong>confirmado</strong> y tu inscripción al <strong>Curso Preuniversitario FICCT</strong> está completa.</p>
                <p>A continuación, tus credenciales de acceso al sistema:</p>
                <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;">
                    <p><strong>Usuario:</strong> {$postulante->correo}</p>
                    <p><strong>Contraseña:</strong> {$password}</p>
                </div>
                <p style="text-align:center;margin:30px 0;">
                    <a href='{$loginUrl}' style='display:inline-block;padding:14px 32px;background:#059669;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;'>Ingresar al sistema</a>
                </p>
                <p style="color:#666;font-size:13px;">Recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
                <hr>
                <p style="color:#666;font-size:12px;">Curso Preuniversitario FICCT — Facultad de Ciencias de la Computación y Telecomunicaciones</p>
                HTML;

                $resendService->enviar($postulante->correo, 'Credenciales de acceso - CUP FICCT', $html);
            } catch (\Throwable $e) {
                Log::error('No se pudo enviar correo con credenciales.', [
                    'error' => $e->getMessage(),
                    'id_postulacion' => $idPostulacion,
                ]);
            }

            BitacoraService::registrar(
                "Pago confirmado - Postulación #{$idPostulacion}",
                $usuario->id,
                'pago'
            );

            BitacoraService::registrar(
                "Postulación #{$idPostulacion} aceptada - pago confirmado",
                $usuario->id,
                'postulacion'
            );

            BitacoraService::registrar(
                "Usuario postulante creado automáticamente - {$postulante->correo}",
                $usuario->id,
                'usuario'
            );

            Log::info('Pago procesado exitosamente', [
                'session_id' => $sessionId,
                'id_postulacion' => $idPostulacion,
                'id_usuario_creado' => $usuario->id,
            ]);

            return true;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error procesando confirmación de pago: ' . $e->getMessage(), [
                'session_id' => $sessionId,
                'id_postulacion' => $idPostulacion,
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }
}
