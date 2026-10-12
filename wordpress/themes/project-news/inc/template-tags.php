<?php

declare(strict_types=1);

namespace ProjectNews\Theme;

use WP_Query;
use WP_Term;

function primary_category(?int $postId = null): ?WP_Term
{
    $defaultCategory = (int) get_option('default_category');

    foreach (get_the_category($postId ?? get_the_ID()) as $category) {
        if ($category->term_id !== $defaultCategory) {
            return $category;
        }
    }

    return null;
}

function the_category_kicker(): void
{
    $category = primary_category();

    if ($category === null) {
        return;
    }

    printf(
        '<a class="post-kicker position-relative z-2" href="%s">%s</a>',
        esc_url(get_category_link($category)),
        esc_html($category->name),
    );
}

function the_post_meta(): void
{
    printf(
        '<time datetime="%s">%s</time>',
        esc_attr(get_the_date('c')),
        esc_html(get_the_date()),
    );

    $minutes = reading_time();

    if ($minutes !== null) {
        printf(' · %s', esc_html(sprintf('%d min de leitura', $minutes)));
    }
}

function the_pagination(): void
{
    $links = paginate_links([
        'type' => 'array',
        'prev_text' => '‹ Anterior',
        'next_text' => 'Próxima ›',
    ]);

    if (!$links) {
        return;
    }

    echo '<nav class="mt-5" aria-label="Paginação"><ul class="pagination justify-content-center">';

    foreach ($links as $link) {
        $state = match (true) {
            str_contains($link, 'current') => ' active',
            str_contains($link, 'dots') => ' disabled',
            default => '',
        };

        printf('<li class="page-item%s">%s</li>', $state, str_replace('page-numbers', 'page-link', $link));
    }
    
    echo '</ul></nav>';
}

/**
 * Índice da matéria a partir dos <h2 id="..."> que a API gera no conteúdo.
 *
 * @return list<array{id: string, title: string}>
 */
function table_of_contents(?int $postId = null): array
{
    $content = (string) get_post_field('post_content', $postId ?? get_the_ID());
    preg_match_all('/<h2\b[^>]*\bid="([^"]+)"[^>]*>(.*?)<\/h2>/is', $content, $matches, PREG_SET_ORDER);

    return array_map(static fn (array $match): array => [
        'id' => $match[1],
        // O título vem escapado no HTML (&amp;); volta a texto puro e é escapado na saída.
        'title' => html_entity_decode(wp_strip_all_tags($match[2]), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
    ], $matches);
}

/** "Imagem: Reprodução/G1": a imagem de destaque vem da matéria original. */
function image_credit(): ?string
{
    $source = article_source();

    return $source === null ? null : sprintf('Imagem: Reprodução/%s', $source['siteName']);
}

function latest_posts(int $count = 3): WP_Query
{
    return new WP_Query([
        'posts_per_page' => $count,
        'ignore_sticky_posts' => true,
        'no_found_rows' => true,
    ]);
}

/** Matérias da mesma editoria; se faltarem, completa com as mais recentes. */
function related_posts(int $count = 3): WP_Query
{
    $exclude = [get_the_ID()];
    $ids = [];

    $category = primary_category();
    if ($category !== null) {
        $ids = get_posts([
            'cat' => $category->term_id,
            'post__not_in' => $exclude,
            'numberposts' => $count,
            'fields' => 'ids',
        ]);
    }

    if (count($ids) < $count) {
        $ids = array_merge($ids, get_posts([
            'post__not_in' => array_merge($exclude, $ids),
            'numberposts' => $count - count($ids),
            'fields' => 'ids',
        ]));
    }

    return new WP_Query([
        // post__in vazio traria todos os posts; [0] garante uma lista vazia.
        'post__in' => $ids ?: [0],
        'orderby' => 'post__in',
        'posts_per_page' => $count,
        'ignore_sticky_posts' => true,
        'no_found_rows' => true,
    ]);
}
