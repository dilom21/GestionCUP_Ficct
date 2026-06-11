<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAulaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $aulaId = $this->route('aula');

        return [
            'codigo'           => ['required', 'string', 'max:50', Rule::unique('aula', 'codigo')->ignore($aulaId)],
            'nombre'           => 'required|string|max:100',
            'capacidad_maxima' => 'required|integer|min:1',
            'ubicacion'        => 'nullable|string|max:150',
            'estado'           => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'codigo.required'           => 'El código del aula es obligatorio.',
            'codigo.unique'             => 'Ya existe un aula con ese código.',
            'codigo.max'                => 'El código no debe exceder los 50 caracteres.',
            'nombre.required'           => 'El nombre del aula es obligatorio.',
            'nombre.max'                => 'El nombre no debe exceder los 100 caracteres.',
            'capacidad_maxima.required' => 'La capacidad máxima es obligatoria.',
            'capacidad_maxima.integer'  => 'La capacidad debe ser un número entero.',
            'capacidad_maxima.min'      => 'La capacidad mínima debe ser al menos 1.',
            'ubicacion.max'             => 'La ubicación no debe exceder los 150 caracteres.',
        ];
    }
}
