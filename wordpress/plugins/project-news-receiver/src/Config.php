<?php

declare(strict_types=1);

namespace ProjectNews\Receiver;

final class Config
{
    private const DEFAULT_AUTHOR_LOGIN = 'redacao';

    public static function webhookSecret(): string
    {
        return self::read('PROJECT_NEWS_WEBHOOK_SECRET');
    }

    public static function authorLogin(): string
    {
        return self::read('PROJECT_NEWS_AUTHOR_LOGIN') ?: self::DEFAULT_AUTHOR_LOGIN;
    }

    private static function read(string $name): string
    {
        if (defined($name)) {
            return (string) constant($name);
        }

        $value = getenv($name);
        return $value === false ? '' : $value;
    }
}
