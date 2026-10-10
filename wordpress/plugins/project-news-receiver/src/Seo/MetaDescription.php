<?php

declare(strict_types=1);

namespace ProjectNews\Receiver\Seo;

use ProjectNews\Receiver\PostMeta;

final class MetaDescription
{
    public static function render(): void
    {
        if (!is_singular('post')) {
            return;
        }

        $description = get_post_meta(get_queried_object_id(), PostMeta::META_DESCRIPTION, true);
        if (!is_string($description) || $description === '') {
            return;
        }

        printf("<meta name=\"description\" content=\"%s\">\n", esc_attr($description));
    }
}
