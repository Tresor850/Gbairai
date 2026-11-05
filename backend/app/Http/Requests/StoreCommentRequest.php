<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:1', 'max:1000'],
            'device_id' => [
                'nullable',
                'string',
                'uuid',
                function ($attribute, $value, $fail) {
                    if (empty($value) && empty($this->header('X-Device-ID'))) {
                        $fail('Un identifiant appareil (Device ID) est requis pour commenter.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Le commentaire ne peut pas être vide.',
            'content.max' => 'Le commentaire ne peut pas dépasser 1000 caractères.',
            'device_id.uuid' => 'Le format du Device ID doit être un UUID valide.',
        ];
    }
}

