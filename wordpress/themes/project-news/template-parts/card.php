<?php

use function ProjectNews\Theme\the_category_kicker;
use function ProjectNews\Theme\the_post_meta;

$heading = in_array($args['heading'] ?? null, ['h2', 'h3'], true) ? $args['heading'] : 'h3';

?>

<article <?php post_class('post-card card h-100'); ?>>
    <?php if (has_post_thumbnail()) : ?>
        <div class="post-card__media ratio ratio-16x9">
            <?php
            the_post_thumbnail('medium_large', [
                'class' => 'object-fit-cover',
                'alt' => '',
                'sizes' => '(min-width: 1200px) 390px, (min-width: 768px) 50vw, 100vw',
            ]);
            ?>
        </div>
    <?php endif; ?>

    <div class="card-body d-flex flex-column">
        <?php the_category_kicker(); ?>

        <<?php echo $heading; ?> class="post-card__title h5 mt-2">
            <a class="stretched-link" href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
        </<?php echo $heading; ?>>

        <p class="post-card__excerpt"><?php echo esc_html(get_the_excerpt()); ?></p>
        <p class="post-meta mt-auto mb-0"><?php the_post_meta(); ?></p>
    </div>
</article>
