<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGbairaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:3', 'max:2000'],
            'location' => ['nullable', 'string', 'max:80'],
            'device_id' => [
                'nullable',
                'string',
                'uuid',
                function ($attribute, $value, $fail) {
                    if (empty($value) && empty($this->header('X-Device-ID'))) {
                        $fail('Un identifiant appareil (Device ID) est requis dans le corps ou dans les en-têtes (X-Device-ID).');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Le contenu du gbairai est obligatoire.',
            'content.min' => 'Le gbairai doit contenir au moins 3 caractères.',
            'content.max' => 'Le gbairai ne peut pas dépasser 2000 caractères.',
            'location.max' => 'Le nom de la localisation est trop long.',
            'device_id.uuid' => 'Le format du Device ID doit être un UUID valide.',
        ];
    }
}

