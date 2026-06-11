<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGrupoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_gestion_cup' => 'required|integer|exists:gestion_cup,id',
            'sigla'          => 'required|string|max:50',
            'cupo_maximo'    => 'required|integer|min:1',
            'turno'          => 'required|string|in:Mañana,Tarde,Noche',
            'modalidad'      => 'nullable|string|max:100',
            'estado'         => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'id_gestion_cup.required' => 'La gestión es obligatoria.',
            'id_gestion_cup.exists'   => 'La gestión seleccionada no existe.',
            'sigla.required'          => 'La sigla del grupo es obligatoria.',
            'cupo_maximo.required'    => 'El cupo máximo es obligatorio.',
            'cupo_maximo.min'         => 'El cupo mínimo debe ser al menos 1.',
            'turno.required'          => 'El turno es obligatorio.',
            'turno.in'                => 'El turno debe ser Mañana, Tarde o Noche.',
        ];
    }
}
