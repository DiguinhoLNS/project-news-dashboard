<?php

declare(strict_types=1);

namespace ProjectNews\Receiver\Posts;

final readonly class PublishResult
{
    public function __construct(
        public int $postId,
        public bool $created,
    ) {}

    public function toArray(): array
    {
        return [
            'post_id' => $this->postId,
            'permalink' => get_permalink($this->postId) ?: null,
            'status' => get_post_status($this->postId),
            'featured_image_id' => get_post_thumbnail_id($this->postId) ?: null,
            'created' => $this->created,
        ];
    }
}
