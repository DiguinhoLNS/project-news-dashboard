<?php

declare(strict_types=1);

namespace ProjectNews\Receiver\Posts;

/**
 * Trava por chave de idempotência usando GET_LOCK do MySQL. Se a API reenviar
 * enquanto o primeiro envio ainda baixa a imagem, o segundo espera e encontra
 * o post pronto. O MySQL solta a trava sozinho se o PHP morrer no meio.
 */
final class PublishLock
{
    private const WAIT_SECONDS = 20;

    public function acquire(string $key): bool
    {
        global $wpdb;

        $acquired = $wpdb->get_var(
            $wpdb->prepare('SELECT GET_LOCK(%s, %d)', $this->name($key), self::WAIT_SECONDS),
        );

        return $acquired === '1';
    }

    public function release(string $key): void
    {
        global $wpdb;

        $wpdb->query($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $this->name($key)));
    }

    private function name(string $key): string
    {
        return 'project_news_' . md5($key);
    }
}
