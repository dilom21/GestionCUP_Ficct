<?php

namespace App\Http\Controllers\Postulante;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PagoController extends Controller
{
    public function index()
    {
        return inertia('Inscripcion/PasarelaPago');
    }
}