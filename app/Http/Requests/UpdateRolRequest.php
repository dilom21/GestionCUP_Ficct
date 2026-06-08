<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rolId = $this->route('rol');

        return [
            'nombre'      => ['required', 'string', 'max:100', Rule::unique('rol', 'nombre')->ignore($rolId, 'id_rol')],
            'descripcion' => 'nullable|string|max:255',
            'funciones'   => 'nullable|array',
            'funciones.*' => 'integer|exists:funcion,id',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'     => 'El nombre del rol es obligatorio.',
            'nombre.unique'       => 'Ya existe un rol con ese nombre.',
            'nombre.max'          => 'El nombre no debe exceder los 100 caracteres.',
            'descripcion.max'     => 'La descripción no debe exceder los 255 caracteres.',
        ];
    }
}