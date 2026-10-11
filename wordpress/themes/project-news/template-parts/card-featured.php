<?php

use function ProjectNews\Theme\the_category_kicker;
use function ProjectNews\Theme\the_post_meta;

?>

<article <?php post_class('post-featured position-relative'); ?>>
    <div class="row g-4 align-items-center">
        <?php if (has_post_thumbnail()) : ?>
            <div class="col-lg-7">
                <div class="post-featured__media ratio ratio-16x9">
                    <?php
                    the_post_thumbnail('large', [
                        'class' => 'object-fit-cover',
                        'alt' => '',
                        'sizes' => '(min-width: 1200px) 720px, (min-width: 992px) 58vw, 100vw',
                    ]);
                    ?>
                </div>
            </div>
        <?php endif; ?>

        <div class="<?php echo has_post_thumbnail() ? 'col-lg-5' : 'col-lg-8'; ?>">
            <?php the_category_kicker(); ?>

            <h2 class="post-featured__title mt-2">
                <a class="stretched-link" href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
            </h2>

            <p class="lead"><?php echo esc_html(get_the_excerpt()); ?></p>
            <p class="post-meta mb-0"><?php the_post_meta(); ?></p>
        </div>
    </div>
</article>
