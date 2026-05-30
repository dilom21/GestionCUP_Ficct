<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DocenteController extends Controller
{
    public function index()
    {
        return inertia('Administrativo/Docentes/Index');
    }
}