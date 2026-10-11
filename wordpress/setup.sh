#!/bin/sh
set -eu

until [ -f /var/www/html/wp-config.php ]; do
    echo 'Aguardando os arquivos do WordPress...'
    sleep 2
done

if ! wp core is-installed 2>/dev/null; then
    wp core install \
        --url="$WORDPRESS_URL" \
        --title="$WORDPRESS_TITLE" \
        --admin_user="$WORDPRESS_ADMIN_USER" \
        --admin_password="$WORDPRESS_ADMIN_PASSWORD" \
        --admin_email="$WORDPRESS_ADMIN_EMAIL" \
        --skip-email

    wp post delete $(wp post list --post_type=post,page --format=ids) --force
    wp language core install pt_BR --activate || echo 'Aviso: não foi possível instalar o pt_BR.'
    wp option update timezone_string America/Sao_Paulo
    wp option update date_format 'j \d\e F \d\e Y'
    wp option update time_format 'H:i'
    wp rewrite structure '/%postname%/'
fi

if ! wp user get redacao >/dev/null 2>&1; then
    wp user create redacao redacao@example.com --role=author --display_name='Redação' --porcelain
fi

if ! wp plugin is-active project-news-receiver; then
    wp plugin activate project-news-receiver
fi

if ! wp theme is-active project-news; then
    wp theme activate project-news
fi

echo "WordPress pronto em $WORDPRESS_URL. Configuração concluída; este container encerra aqui."
