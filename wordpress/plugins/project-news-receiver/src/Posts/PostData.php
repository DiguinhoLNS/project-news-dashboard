<?php

declare(strict_types=1);

namespace ProjectNews\Receiver\Posts;

use WP_REST_Request;

/**
 * Dados do post já sanitizados
 */
final readonly class PostData
{
    /**
     * @param string[] $keyPoints
     * @param string[] $tags
     */
    public function __construct(
        public string $idempotencyKey,
        public string $title,
        public string $slug,
        public string $excerpt,
        public string $contentHtml,
        public array $keyPoints,
        public array $tags,
        public string $category,
        public string $metaDescription,
        public int $readingTimeMinutes,
        public ?string $featuredImageUrl,
        public string $sourceUrl,
        public ?string $sourceSiteName,
        public ?string $sourceAuthor,
        public ?string $sourcePublishedAt,
        public string $status,
    ) {}

    public static function fromRequest(WP_REST_Request $request): self
    {
        $source = (array) $request->get_param('source');

        return new self(
            idempotencyKey: (string) $request->get_param('idempotency_key'),
            title: sanitize_text_field($request->get_param('title')),
            slug: sanitize_title($request->get_param('slug')),
            excerpt: sanitize_textarea_field($request->get_param('excerpt')),
            contentHtml: wp_kses_post($request->get_param('content_html')),
            keyPoints: self::textList($request->get_param('key_points')),
            tags: self::textList($request->get_param('tags')),
            category: sanitize_text_field($request->get_param('category')),
            metaDescription: sanitize_text_field($request->get_param('meta_description')),
            readingTimeMinutes: (int) $request->get_param('reading_time_minutes'),
            featuredImageUrl: self::url($request->get_param('featured_image_url')),
            sourceUrl: self::url($source['url'] ?? null) ?? '',
            sourceSiteName: self::optionalText($source['site_name'] ?? null),
            sourceAuthor: self::optionalText($source['author'] ?? null),
            sourcePublishedAt: self::optionalText($source['published_at'] ?? null),
            status: (string) $request->get_param('status'),
        );
    }

    /** @return string[] */
    private static function textList(mixed $values): array
    {
        $items = array_map('sanitize_text_field', (array) $values);
        return array_values(array_filter($items, static fn (string $item): bool => $item !== ''));
    }

    private static function optionalText(mixed $value): ?string
    {
        $text = sanitize_text_field((string) $value);
        return $text === '' ? null : $text;
    }

    private static function url(mixed $value): ?string
    {
        $url = esc_url_raw((string) $value, ['http', 'https']);
        return $url === '' ? null : $url;
    }
}
