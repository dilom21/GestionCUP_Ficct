<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportUsuariosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'archivo' => 'required|file|mimes:csv,xlsx,xls|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'archivo.required' => 'Debe seleccionar un archivo para importar.',
            'archivo.file'     => 'El archivo no es válido.',
            'archivo.mimes'    => 'El archivo debe ser CSV, XLSX o XLS.',
            'archivo.max'      => 'El archivo no debe superar los 5MB.',
        ];
    }
}
