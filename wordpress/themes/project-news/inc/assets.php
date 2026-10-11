<?php

declare(strict_types=1);

namespace ProjectNews\Theme;

const ASSETS_DIR = 'assets/dist';

/**
 * Carrega o CSS e o JS compilados pelo Vite. A versão é a data do arquivo:
 * a cada build a URL muda (?ver=...) e o navegador não reaproveita cache velho.
 */
add_action('wp_enqueue_scripts', static function (): void {
    $css = asset('main.css');
    if ($css !== null) {
        wp_enqueue_style('project-news', $css['url'], [], $css['version']);
    }

    $js = asset('main.js');
    if ($js !== null) {
        wp_enqueue_script_module('project-news', $js['url'], [], $js['version']);
    }
});

/** @return array{url: string, version: string}|null */
function asset(string $file): ?array
{
    $path = get_theme_file_path(ASSETS_DIR . '/' . $file);
    if (!is_file($path)) {
        return null;
    }

    return [
        'url' => get_theme_file_uri(ASSETS_DIR . '/' . $file),
        'version' => (string) filemtime($path),
    ];
}
