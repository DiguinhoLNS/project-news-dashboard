<?php

use function ProjectNews\Theme\key_points;

$points = key_points();

if (!$points) {
    return;
}

?>

<section class="key-points" aria-labelledby="pontos-principais">
    <h2 id="pontos-principais" class="key-points__title">Pontos principais</h2>
    <ul class="key-points__list">
        <?php foreach ($points as $point) : ?>
            <li><?php echo esc_html($point); ?></li>
        <?php endforeach; ?>
    </ul>
</section>
