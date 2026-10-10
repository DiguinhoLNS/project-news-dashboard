<?php

declare(strict_types=1);

namespace ProjectNews\Receiver\Http;

use ProjectNews\Receiver\Posts\PostData;
use ProjectNews\Receiver\Posts\PostPublisher;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

final class PostsController
{
    public const NAMESPACE = 'project-news/v1';
    public const ROUTE = '/posts';

    public function __construct(
        private readonly SignatureVerifier $verifier,
        private readonly PostPublisher $publisher,
    ) {}

    public function register(): void
    {
        register_rest_route(self::NAMESPACE, self::ROUTE, [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [$this, 'create'],
            'permission_callback' => [$this->verifier, 'verify'],
            'args' => PostSchema::args(),
        ]);
    }

    public function create(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $result = $this->publisher->publish(PostData::fromRequest($request));
        if ($result instanceof WP_Error) {
            return $result;
        }

        return new WP_REST_Response($result->toArray(), $result->created ? 201 : 200);
    }
}
