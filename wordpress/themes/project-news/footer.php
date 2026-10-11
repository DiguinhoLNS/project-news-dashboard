<footer class="site-footer">
    <div class="container py-5">
        <div class="row g-4">
            <div class="col-lg-6">
                <a class="site-logo" href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a>
                <p class="site-footer__about mt-3 mb-0">
                    Matérias reescritas por inteligência artificial a partir de veículos jornalísticos.
                    Cada matéria traz o crédito e o link da publicação original.
                </p>
            </div>

            <div class="col-lg-3 offset-lg-3">
                <h2 class="site-footer__title">Editorias</h2>
                <ul class="site-footer__links list-unstyled mb-0">
                    <?php
                    wp_list_categories([
                        'title_li' => '',
                        'exclude' => (int) get_option('default_category'),
                        'hide_empty' => true,
                    ]);
                    ?>
                </ul>
            </div>
        </div>

        <p class="site-footer__copy">&copy; <?php echo esc_html(wp_date('Y')); ?> <?php bloginfo('name'); ?></p>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
