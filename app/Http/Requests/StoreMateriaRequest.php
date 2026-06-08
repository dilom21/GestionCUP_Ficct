<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMateriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:150|unique:materia,nombre',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la materia es obligatorio.',
            'nombre.max'      => 'El nombre no debe exceder los 150 caracteres.',
            'nombre.unique'   => 'Ya existe una materia con ese nombre.',
        ];
    }
}