<?php

use function ProjectNews\Theme\related_posts;

$related = related_posts();

if (!$related->have_posts()) {
    return;
}

?>

<section class="related" aria-labelledby="leia-tambem">
    <div class="container">
        <h2 id="leia-tambem" class="section-title">Leia também</h2>

        <div class="row g-4">
            <?php while ($related->have_posts()) : $related->the_post(); ?>
                <div class="col-md-6 col-lg-4">
                    <?php get_template_part('template-parts/card', null, ['heading' => 'h3']); ?>
                </div>
            <?php endwhile; ?>
            <?php

            wp_reset_postdata();
            ?>
        </div>
    </div>
</section>
