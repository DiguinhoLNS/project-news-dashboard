<?php

declare(strict_types=1);

namespace ProjectNews\Theme;

const PRIMARY_MENU = 'primary';
const FALLBACK_MENU_SIZE = 6;

function the_primary_menu(): void
{
    wp_nav_menu([
        'theme_location' => PRIMARY_MENU,
        'container' => false,
        'menu_class' => 'navbar-nav ms-lg-auto',
        'depth' => 1,
        'fallback_cb' => __NAMESPACE__ . '\\category_menu',
    ]);
}

/** Enquanto ninguém monta o menu no painel, mostra as editorias com mais matérias. */
function category_menu(): void
{
    $categories = get_categories([
        'hide_empty' => true,
        'exclude' => [(int) get_option('default_category')],
        'orderby' => 'count',
        'order' => 'DESC',
        'number' => FALLBACK_MENU_SIZE,
    ]);

    if (!$categories) {
        return;
    }

    echo '<ul class="navbar-nav ms-lg-auto">';

    foreach ($categories as $category) {
        $current = is_category($category->term_id);

        printf(
            '<li class="nav-item"><a class="nav-link%s" href="%s"%s>%s</a></li>',
            $current ? ' active' : '',
            esc_url(get_category_link($category)),
            $current ? ' aria-current="page"' : '',
            esc_html($category->name),
        );
    }

    echo '</ul>';
}

add_filter('nav_menu_css_class', static function (array $classes, $item, $args): array {
    if (($args->theme_location ?? null) === PRIMARY_MENU) {
        $classes[] = 'nav-item';
    }

    return $classes;
}, 10, 3);

add_filter('nav_menu_link_attributes', static function (array $atts, $item, $args): array {
    if (($args->theme_location ?? null) === PRIMARY_MENU) {
        $atts['class'] = trim(($atts['class'] ?? '') . ' nav-link' . ($item->current ? ' active' : ''));
    }

    return $atts;
}, 10, 3);
