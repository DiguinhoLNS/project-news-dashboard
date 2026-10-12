<?php

use function ProjectNews\Theme\latest_posts;

$latest = latest_posts();

get_header();
?>

<main id="conteudo" class="container py-4 py-lg-5">
    <div class="row mb-5">
        <div class="col-lg-8">
            <p class="post-kicker mb-2">Erro 404</p>
            <h1 class="display-5 mb-3">Página não encontrada</h1>
            <p class="lead text-body-secondary">O endereço pode estar errado, ou a matéria pode ter sido removida.</p>
            <a class="btn btn-primary" href="<?php echo esc_url(home_url('/')); ?>">Ir para a página inicial</a>
        </div>
    </div>

    <?php if ($latest->have_posts()) : ?>
        <section aria-labelledby="ultimas-materias">
            <h2 id="ultimas-materias" class="section-title">Últimas matérias</h2>

            <div class="row g-4">
                <?php while ($latest->have_posts()) : $latest->the_post(); ?>
                    <div class="col-md-6 col-lg-4">
                        <?php get_template_part('template-parts/card', null, ['heading' => 'h3']); ?>
                    </div>
                <?php endwhile; ?>
                <?php wp_reset_postdata(); ?>
            </div>
        </section>
    <?php endif; ?>
</main>

<?php get_footer(); ?>
