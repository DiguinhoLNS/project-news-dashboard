<?php

/**
 * Plugin Name: Project News Receiver
 * Description: Recebe as matérias reescritas pela API e cria os posts no WordPress.
 * Version: 1.0.0
 * Requires at least: 7.0
 * Requires PHP: 8.2
 * Author: Rodrigo Santos
 * License: GPL-2.0-or-later
 * Text Domain: project-news-receiver
 */

declare(strict_types=1);

namespace ProjectNews\Receiver;

defined('ABSPATH') || exit;

spl_autoload_register(static function (string $class): void {
    $prefix = __NAMESPACE__ . '\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $path = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_readable($path)) {
        require_once $path;
    }
});

add_action('plugins_loaded', [Plugin::class, 'boot']);
