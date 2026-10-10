<?php

declare(strict_types=1);

namespace ProjectNews\Receiver;

final class PostMeta
{
    public const IDEMPOTENCY_KEY = '_project_news_idempotency_key';
    public const KEY_POINTS = '_project_news_key_points';
    public const META_DESCRIPTION = '_project_news_meta_description';
    public const READING_TIME_MINUTES = '_project_news_reading_time_minutes';
    public const SOURCE_URL = '_project_news_source_url';
    public const SOURCE_SITE_NAME = '_project_news_source_site_name';
    public const SOURCE_AUTHOR = '_project_news_source_author';
    public const SOURCE_PUBLISHED_AT = '_project_news_source_published_at';
}
