<?php

use function ProjectNews\Theme\article_source;

$source = article_source();

if ($source === null) {
    return;
}

$details = array_filter([
    $source['author'] ? sprintf('Reportagem de %s', $source['author']) : null,
    $source['publishedAt'] ? wp_date(get_option('date_format'), $source['publishedAt']) : null,
]);

?>

<aside class="article-source" aria-labelledby="fonte-original">
    <div class="article-source__body">
        <p id="fonte-original" class="article-source__label">Fonte original</p>
        <p class="article-source__name"><?php echo esc_html($source['siteName']); ?></p>

        <?php if ($details) : ?>
            <p class="article-source__details"><?php echo esc_html(implode(' · ', $details)); ?></p>
        <?php endif; ?>
        
        <p class="article-source__note">
            Este texto foi reescrito com inteligência artificial a partir da publicação original.
        </p>
    </div>

    <a class="btn btn-primary" href="<?php echo esc_url($source['url']); ?>" target="_blank" rel="noopener">
        Ler a matéria original <span aria-hidden="true">↗</span>
        <span class="visually-hidden">(abre em nova aba)</span>
    </a>
</aside>
