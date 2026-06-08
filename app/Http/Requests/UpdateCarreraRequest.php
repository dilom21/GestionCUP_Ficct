<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCarreraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $carreraId = $this->route('carrera');

        return [
            'sigla'  => ['required', 'string', 'max:3', Rule::unique('carrera', 'sigla')->ignore($carreraId, 'id_carrera')],
            'nombre' => ['required', 'string', 'max:150', Rule::unique('carrera', 'nombre')->ignore($carreraId, 'id_carrera')],
        ];
    }

    public function messages(): array
    {
        return [
            'sigla.required' => 'La sigla de la carrera es obligatoria.',
            'sigla.max'      => 'La sigla no debe exceder los 3 caracteres.',
            'sigla.unique'   => 'Ya existe otra carrera con esa sigla.',
            'nombre.required'=> 'El nombre de la carrera es obligatorio.',
            'nombre.unique'  => 'Ya existe otra carrera con ese nombre.',
            'nombre.max'     => 'El nombre no debe exceder los 150 caracteres.',
        ];
    }
}