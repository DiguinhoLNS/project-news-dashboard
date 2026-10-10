<?php

declare(strict_types=1);

namespace ProjectNews\Receiver\Posts;

/**
 * Baixa a imagem da matéria original para a biblioteca de mídia e a define
 * como destaque. O download_url usa wp_safe_remote_get, que recusa endereços
 * internos. Se a imagem falhar, o post segue sem destaque.
 */
final class FeaturedImage
{
    private const DOWNLOAD_TIMEOUT_SECONDS = 15;

    private const EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'image/avif' => 'avif',
    ];

    public function attach(int $postId, ?string $url, string $title): ?int
    {
        if ($url === null) {
            return null;
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $tmpFile = download_url($url, self::DOWNLOAD_TIMEOUT_SECONDS);
        if (is_wp_error($tmpFile)) {
            $this->log($postId, $tmpFile->get_error_message());
            return null;
        }

        $fileName = $this->fileName($url, $tmpFile);
        if ($fileName === null) {
            wp_delete_file($tmpFile);
            $this->log($postId, 'o arquivo baixado não é uma imagem');
            return null;
        }

        $attachmentId = media_handle_sideload(['name' => $fileName, 'tmp_name' => $tmpFile], $postId, $title);
        if (is_wp_error($attachmentId)) {
            wp_delete_file($tmpFile);
            $this->log($postId, $attachmentId->get_error_message());
            return null;
        }

        update_post_meta($attachmentId, '_wp_attachment_image_alt', $title);
        set_post_thumbnail($postId, $attachmentId);

        return $attachmentId;
    }

    /** Muitos CDNs servem imagens sem extensão na URL; o nome sai do tipo real do arquivo. */
    private function fileName(string $url, string $tmpFile): ?string
    {
        $extension = self::EXTENSIONS[wp_get_image_mime($tmpFile) ?: ''] ?? null;
        if ($extension === null) {
            return null;
        }

        $baseName = sanitize_file_name(pathinfo((string) wp_parse_url($url, PHP_URL_PATH), PATHINFO_FILENAME));
        return ($baseName ?: 'imagem') . '.' . $extension;
    }

    private function log(int $postId, string $reason): void
    {
        error_log(sprintf('[project-news-receiver] post %d sem imagem de destaque: %s', $postId, $reason));
    }
}
