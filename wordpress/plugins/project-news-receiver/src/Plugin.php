<?php

declare(strict_types=1);

namespace ProjectNews\Receiver;

use ProjectNews\Receiver\Http\PostsController;
use ProjectNews\Receiver\Http\SignatureVerifier;
use ProjectNews\Receiver\Posts\FeaturedImage;
use ProjectNews\Receiver\Posts\PostPublisher;
use ProjectNews\Receiver\Posts\PublishLock;
use ProjectNews\Receiver\Seo\MetaDescription;

final class Plugin
{
    public static function boot(): void
    {
        $controller = new PostsController(
            new SignatureVerifier(),
            new PostPublisher(new FeaturedImage(), new PublishLock()),
        );

        add_action('rest_api_init', [$controller, 'register']);
        add_action('wp_head', [MetaDescription::class, 'render'], 1);
    }
}
