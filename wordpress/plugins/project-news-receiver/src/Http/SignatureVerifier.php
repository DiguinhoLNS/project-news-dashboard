<?php

declare(strict_types=1);

namespace ProjectNews\Receiver\Http;

use ProjectNews\Receiver\Config;
use WP_Error;
use WP_REST_Request;

/**
 * Confere a assinatura HMAC-SHA256 de "timestamp.corpo" enviada pela API.
 * A janela de tempo impede que uma requisição capturada seja reenviada depois.
 */
final class SignatureVerifier
{
    private const TOLERANCE_SECONDS = 300;
    private const SIGNATURE_PREFIX = 'sha256=';

    public function verify(WP_REST_Request $request): bool|WP_Error
    {
        $secret = Config::webhookSecret();
        if ($secret === '') {
            return new WP_Error(
                'project_news_not_configured',
                'O segredo do webhook não está configurado no WordPress.',
                ['status' => 500],
            );
        }

        $timestamp = (string) $request->get_header('x-project-news-timestamp');
        if (!ctype_digit($timestamp) || abs(time() - (int) $timestamp) > self::TOLERANCE_SECONDS) {
            return $this->unauthorized('Requisição sem data de envio ou fora da janela de 5 minutos.');
        }

        $signature = (string) $request->get_header('x-project-news-signature');
        $expected = self::SIGNATURE_PREFIX
            . hash_hmac('sha256', $timestamp . '.' . $request->get_body(), $secret);

        if (!hash_equals($expected, $signature)) {
            return $this->unauthorized('Assinatura inválida.');
        }

        return true;
    }

    private function unauthorized(string $message): WP_Error
    {
        return new WP_Error('project_news_invalid_signature', $message, ['status' => 401]);
    }
}
