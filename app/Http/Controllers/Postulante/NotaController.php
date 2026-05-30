<?php

namespace App\Http\Controllers\Postulante;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotaController extends Controller
{
    public function index()
    {
        return inertia('Postulante/Notas/Index');
    }
}