<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    public function index(): JsonResponse
    {
        $noLeidas = Notificacion::where('leida', false)->orderBy('created_at', 'desc')->take(20)->get();
        $todas = Notificacion::orderBy('created_at', 'desc')->take(50)->get();

        return response()->json([
            'no_leidas' => $noLeidas,
            'todas'     => $todas,
            'total_no_leidas' => Notificacion::where('leida', false)->count(),
        ]);
    }

    public function marcarLeida(int $id): JsonResponse
    {
        Notificacion::where('id', $id)->update(['leida' => true]);
        return response()->json(['success' => true]);
    }

    public function marcarTodasLeidas(): JsonResponse
    {
        Notificacion::where('leida', false)->update(['leida' => true]);
        return response()->json(['success' => true]);
    }

    public function noLeidas(): JsonResponse
    {
        $noLeidas = Notificacion::where('leida', false)->orderBy('created_at', 'desc')->take(10)->get();
        return response()->json([
            'data' => $noLeidas,
            'total_no_leidas' => Notificacion::where('leida', false)->count(),
        ]);
    }
}
