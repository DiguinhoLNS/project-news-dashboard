<?php

use function ProjectNews\Theme\the_pagination;

$isFrontPage = is_home() && !is_paged();

$emptyMessage = match (true) {
    is_search() => 'Nenhuma matéria encontrada. Tente buscar com outras palavras.',
    is_archive() => 'Nenhuma matéria publicada nesta seção ainda.',
    default => 'Nenhuma matéria publicada ainda.',
};

get_header();
?>

<main id="conteudo" class="container py-4 py-lg-5">
    <?php if (is_search()) : ?>
        <h1 class="mb-4">Resultados para “<?php echo esc_html(get_search_query(false)); ?>”</h1>
    <?php elseif (is_archive()) : ?>
        <h1 class="mb-4"><?php the_archive_title(); ?></h1>
    <?php endif; ?>

    <?php if (have_posts()) : ?>
        <?php if ($isFrontPage) : ?>
            <?php the_post(); ?>
            <?php get_template_part('template-parts/card', 'featured'); ?>
        <?php endif; ?>

        <?php if (have_posts()) : ?>
            <?php if ($isFrontPage) : ?>
                <h2 class="section-title">Últimas matérias</h2>
            <?php endif; ?>

            <div class="row g-4">
                <?php while (have_posts()) : the_post(); ?>
                    <div class="col-md-6 col-lg-4">
                        <?php get_template_part('template-parts/card', null, ['heading' => $isFrontPage ? 'h3' : 'h2']); ?>
                    </div>
                <?php endwhile; ?>
            </div>
        <?php endif; ?>

        <?php the_pagination(); ?>
    <?php else : ?>
        <p class="lead text-body-secondary"><?php echo esc_html($emptyMessage); ?></p>
    <?php endif; ?>
</main>

<?php get_footer(); ?>
