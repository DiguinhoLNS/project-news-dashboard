<?php

declare(strict_types=1);

namespace ProjectNews\Theme;

defined('ABSPATH') || exit;

add_action('after_setup_theme', static function (): void {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']);

    register_nav_menus(['primary' => 'Menu principal']);
});

add_action('wp_footer', static function (): void {
    if (wp_get_environment_type() !== 'local') {
        return;
    }

    global $template;
    printf("<!-- template: %s -->\n", esc_html(basename((string) $template)));
});
