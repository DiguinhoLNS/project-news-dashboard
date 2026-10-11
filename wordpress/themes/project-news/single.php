<?php get_header(); ?>

<main id="conteudo">
    <?php while (have_posts()) : the_post(); ?>
        <article <?php post_class(); ?>>
            <h1><?php the_title(); ?></h1>
            <p><?php echo esc_html(get_the_date()); ?> · <?php the_author(); ?></p>

            <?php the_content(); ?>
        </article>
    <?php endwhile; ?>
</main>

<?php get_footer(); ?>
