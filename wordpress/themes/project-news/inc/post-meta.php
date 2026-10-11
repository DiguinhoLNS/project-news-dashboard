<?php

declare(strict_types=1);

namespace ProjectNews\Theme;

const META_READING_TIME = '_project_news_reading_time_minutes';
const META_KEY_POINTS = '_project_news_key_points';
const META_SOURCE_URL = '_project_news_source_url';
const META_SOURCE_SITE_NAME = '_project_news_source_site_name';
const META_SOURCE_AUTHOR = '_project_news_source_author';
const META_SOURCE_PUBLISHED_AT = '_project_news_source_published_at';

function reading_time(?int $postId = null): ?int
{
    $minutes = (int) get_post_meta($postId ?? get_the_ID(), META_READING_TIME, true);

    return $minutes > 0 ? $minutes : null;
}

/** @return string[] */
function key_points(?int $postId = null): array
{
    $points = get_post_meta($postId ?? get_the_ID(), META_KEY_POINTS, true);

    return is_array($points) ? array_values(array_filter($points, 'is_string')) : [];
}

/**
 * A matéria original que a IA reescreveu.
 *
 * @return array{url: string, siteName: string, author: ?string, publishedAt: ?int}|null
 */
function article_source(?int $postId = null): ?array
{
    $postId ??= get_the_ID();
    $url = text_meta($postId, META_SOURCE_URL);

    if ($url === null) {
        return null;
    }

    $siteName = text_meta($postId, META_SOURCE_SITE_NAME) ?? preg_replace('/^www\./', '', (string) wp_parse_url($url, PHP_URL_HOST));
    $author = text_meta($postId, META_SOURCE_AUTHOR);
    $publishedAt = strtotime((string) text_meta($postId, META_SOURCE_PUBLISHED_AT));

    return [
        'url' => $url,
        'siteName' => $siteName,
        'author' => $author !== $siteName ? $author : null,
        'publishedAt' => $publishedAt ?: null,
    ];
}

function text_meta(int|false $postId, string $key): ?string
{
    $value = trim((string) get_post_meta($postId, $key, true));

    return $value === '' ? null : $value;
}
