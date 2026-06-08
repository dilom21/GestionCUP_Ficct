<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCarreraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sigla'  => 'required|string|max:3|unique:carrera,sigla',
            'nombre' => 'required|string|max:150|unique:carrera,nombre',
        ];
    }

    public function messages(): array
    {
        return [
            'sigla.required' => 'La sigla de la carrera es obligatoria.',
            'sigla.max'      => 'La sigla no debe exceder los 3 caracteres.',
            'sigla.unique'   => 'Ya existe una carrera con esa sigla.',
            'nombre.required'=> 'El nombre de la carrera es obligatorio.',
            'nombre.unique'  => 'Ya existe una carrera con ese nombre.',
            'nombre.max'     => 'El nombre no debe exceder los 150 caracteres.',
        ];
    }
}