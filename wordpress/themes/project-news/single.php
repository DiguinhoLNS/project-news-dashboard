<?php

use function ProjectNews\Theme\article_source;
use function ProjectNews\Theme\image_credit;
use function ProjectNews\Theme\table_of_contents;
use function ProjectNews\Theme\the_category_kicker;
use function ProjectNews\Theme\the_post_meta;

get_header();
?>

<main id="conteudo">
    <?php while (have_posts()) : the_post(); ?>
        <article <?php post_class('article'); ?>>
            <header class="article-header container">
                <div class="article-column">
                    <?php the_category_kicker(); ?>
                    <h1 class="article-header__title"><?php the_title(); ?></h1>

                    <?php if (has_excerpt()) : ?>
                        <p class="article-header__lead"><?php echo esc_html(get_the_excerpt()); ?></p>
                    <?php endif; ?>

                    <div class="article-header__meta">
                        <span>Por <strong><?php the_author(); ?></strong></span>
                        <span class="post-meta"><?php the_post_meta(); ?></span>
                        <?php if (article_source() !== null) : ?>
                            <span class="badge rounded-pill text-bg-light">Reescrita com IA</span>
                        <?php endif; ?>
                    </div>
                </div>
            </header>

            <?php if (has_post_thumbnail()) : ?>
                <div class="container">
                    <figure class="article-figure article-column">
                        <div class="article-figure__media ratio ratio-16x9">
                            <?php
                            the_post_thumbnail('full', [
                                'class' => 'object-fit-cover',
                                'sizes' => '(min-width: 768px) 704px, 100vw',
                            ]);
                            ?>
                        </div>
                        <?php if ($credit = image_credit()) : ?>
                            <figcaption class="article-figure__caption"><?php echo esc_html($credit); ?></figcaption>
                        <?php endif; ?>
                    </figure>
                </div>
            <?php endif; ?>

            <div class="container">
                <div class="article-column">
                    <?php get_template_part('template-parts/key-points'); ?>

                    <div class="article-content">
                        <?php the_content(); ?>
                    </div>

                    <?php get_template_part('template-parts/article-source'); ?>

                    <?php if ($tags = get_the_tags()) : ?>
                        <ul class="article-tags list-unstyled" aria-label="Assuntos">
                            <?php foreach ($tags as $tag) : ?>
                                <li>
                                    <a class="article-tags__link" href="<?php echo esc_url(get_tag_link($tag)); ?>">
                                        #<?php echo esc_html($tag->name); ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </div>
            </div>
        </article>

        <?php get_template_part('template-parts/related'); ?>
    <?php endwhile; ?>
</main>

<?php get_footer(); ?>
