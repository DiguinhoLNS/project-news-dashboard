<?php

declare(strict_types=1);

namespace ProjectNews\Receiver\Http;

/**
 * Contrato do corpo aceito pelo endpoint. O WordPress valida os tipos e
 * devolve 400 antes de o controller ser chamado.
 */
final class PostSchema
{
    public static function args(): array
    {
        $nullableString = ['type' => ['string', 'null'], 'default' => null];

        return [
            'idempotency_key' => [
                'type' => 'string',
                'required' => true,
                'pattern' => '^[a-f0-9]{64}$',
            ],
            'title' => ['type' => 'string', 'required' => true, 'minLength' => 1, 'maxLength' => 200],
            'slug' => ['type' => 'string', 'required' => true, 'minLength' => 1, 'maxLength' => 200],
            'excerpt' => ['type' => 'string', 'required' => true],
            'content_html' => ['type' => 'string', 'required' => true, 'minLength' => 1],
            'key_points' => ['type' => 'array', 'items' => ['type' => 'string'], 'default' => []],
            'tags' => ['type' => 'array', 'items' => ['type' => 'string'], 'default' => []],
            'category' => ['type' => 'string', 'required' => true, 'minLength' => 1],
            'meta_description' => ['type' => 'string', 'default' => ''],
            'reading_time_minutes' => ['type' => 'integer', 'minimum' => 1, 'default' => 1],
            'featured_image_url' => $nullableString,
            'source' => [
                'type' => 'object',
                'required' => true,
                'properties' => [
                    'url' => ['type' => 'string', 'required' => true],
                    'site_name' => $nullableString,
                    'author' => $nullableString,
                    'published_at' => $nullableString,
                ],
            ],
            'status' => ['type' => 'string', 'enum' => ['publish', 'draft'], 'default' => 'publish'],
        ];
    }
}
