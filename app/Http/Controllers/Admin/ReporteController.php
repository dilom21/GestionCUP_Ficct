<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    public function index()
    {
        return inertia('Administrativo/Reportes/Index');
    }
}