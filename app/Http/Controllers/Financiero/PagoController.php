<?php

namespace App\Http\Controllers\Financiero;

use App\Http\Controllers\Controller;
use App\Models\Bitacora;
use App\Models\Pago;
use App\Models\Postulacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class PagoController extends Controller
{
    /**
     * Monto fijo de inscripción al CUP (en centavos para Stripe).
     * Ejemplo: 350 Bs = 35000 centavos (si se maneja en bolivianos como centavos).
     * Ajusta según la moneda y costo real del sistema.
     */
    const MONTO_INSCRIPCION_CENTAVOS = 35000; // 350.00 Bs

    const MONEDA = 'bob';

    /**
     * Muestra el listado de pagos registrados en el sistema.
     *
     * @return \Inertia\Response
     */
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

    /**
     * Crea una sesión de pago en Stripe Checkout para una postulación.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'id_postulacion' => 'required|integer|exists:postulacion,id',
        ]);

        $idPostulacion = $request->input('id_postulacion');
        $idUsuario = session('usuario_id');

        // 1. Verificar que el usuario autenticado exista
        if (!$idUsuario) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        // 2. Obtener la postulación con su postulante
        $postulacion = Postulacion::with('postulante')->find($idPostulacion);

        if (!$postulacion) {
            return response()->json(['error' => 'Postulación no encontrada'], 404);
        }

        // 3. Validar que el postulante corresponda al usuario logueado (seguridad)
        $postulante = $postulacion->postulante;
        if (!$postulante || $postulante->id_usuario != $idUsuario) {
            return response()->json([
                'error' => 'No tienes permisos para realizar el pago de esta postulación',
            ], 403);
        }

        // 4. Validar que no exista ya un pago confirmado para esta postulación
        $pagoExistente = Pago::where('id_postulacion', $idPostulacion)
            ->where('estado_pago', 'Confirmado')
            ->first();

        if ($pagoExistente) {
            return response()->json([
                'error' => 'Esta postulación ya tiene un pago confirmado',
            ], 409);
        }

        // 5. El monto NO viene del frontend, se define en el backend (seguridad)
        $montoCentavos = self::MONTO_INSCRIPCION_CENTAVOS;
        $montoBolivianos = $montoCentavos / 100;

        // 6. Registrar en BITACORA: inicio de solicitud de pago
        Bitacora::create([
            'accion'        => "Solicitud de pago iniciada por usuario ID {$idUsuario} para postulación ID {$idPostulacion}",
            'fecha_hora'    => now(),
            'ip'            => $request->ip(),
            'id_usuario'    => $idUsuario,
            'tabla_afectada' => 'pago',
        ]);

        // 7. Configurar Stripe
        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            // 8. Crear la sesión de Checkout en Stripe
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
                    'id_usuario'     => (string) $idUsuario,
                ],
            ]);

            // 9. Crear registro del pago en estado "Pendiente"
            Pago::create([
                'id_postulacion'  => $idPostulacion,
                'monto'           => $montoBolivianos,
                'fecha_pago'      => now(),
                'referencia'      => "Sesión Stripe: {$session->id}",
                'estado_pago'     => 'Pendiente',
                'cod_transaccion' => $session->id,
            ]);

            // 10. Devolver la URL de Checkout al frontend
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

    /**
     * Página de éxito después del pago.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function pagoExito(Request $request)
    {
        $sessionId = $request->input('session_id');
        $idPostulacion = $request->input('id_postulacion');

        // La confirmación real se hará vía Webhook (CU11)
        // Aquí solo mostramos la vista de éxito
        return inertia('Financiero/PasarelaPago', [
            'status'         => 'success',
            'session_id'     => $sessionId,
            'id_postulacion' => $idPostulacion,
            'mensaje'        => '¡Pago procesado correctamente! Tu inscripción está siendo verificada.',
        ]);
    }

    /**
     * Página cuando el usuario cancela el pago.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function pagoCancelado(Request $request)
    {
        $idPostulacion = $request->input('id_postulacion');

        return inertia('Financiero/PasarelaPago', [
            'status'         => 'cancelled',
            'id_postulacion' => $idPostulacion,
            'mensaje'        => 'El proceso de pago fue cancelado. Puedes intentarlo nuevamente cuando quieras.',
        ]);
    }
}