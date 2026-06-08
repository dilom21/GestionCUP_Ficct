<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'    => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'correo'    => 'required|string|email|max:180|unique:usuario,correo',
            'password'  => 'required|string|min:6',
            'id_rol'    => 'required|integer|exists:rol,id',
            'estado'    => 'required|string|in:Activo,Inactivo',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'    => 'El nombre es obligatorio.',
            'nombre.max'         => 'El nombre no debe exceder los 100 caracteres.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'apellidos.max'      => 'Los apellidos no deben exceder los 100 caracteres.',
            'correo.required'    => 'El correo es obligatorio.',
            'correo.email'       => 'Ingrese un correo válido.',
            'correo.unique'      => 'El correo ya está registrado.',
            'password.required'  => 'La contraseña es obligatoria.',
            'password.min'       => 'La contraseña debe tener al menos 6 caracteres.',
            'id_rol.required'    => 'El rol es obligatorio.',
            'id_rol.exists'      => 'El rol seleccionado no existe.',
            'estado.required'    => 'El estado es obligatorio.',
            'estado.in'          => 'El estado debe ser Activo o Inactivo.',
        ];
    }
}