<?php

use function ProjectNews\Theme\the_primary_menu;

?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="visually-hidden-focusable" href="#conteudo">Pular para o conteúdo</a>

<header class="site-header sticky-top">
    <nav class="navbar navbar-expand-lg" aria-label="Editorias">
        <div class="container">
            <a class="navbar-brand site-logo" href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a>

            <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#menu-principal"
                aria-controls="menu-principal"
                aria-expanded="false"
                aria-label="Abrir menu"
            >
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="menu-principal">
                <?php the_primary_menu(); ?>
            </div>
        </div>
    </nav>
</header>
