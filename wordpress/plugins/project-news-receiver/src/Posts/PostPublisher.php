<?php

declare(strict_types=1);

namespace ProjectNews\Receiver\Posts;

use ProjectNews\Receiver\Config;
use ProjectNews\Receiver\PostMeta;
use Throwable;
use WP_Error;

final class PostPublisher
{
    public function __construct(
        private readonly FeaturedImage $featuredImage,
        private readonly PublishLock $lock,
    ) {}

    public function publish(PostData $data): PublishResult|WP_Error
    {
        if (!$this->lock->acquire($data->idempotencyKey)) {
            return new WP_Error(
                'project_news_publish_in_progress',
                'Esta matéria já está sendo publicada. Tente novamente em instantes.',
                ['status' => 409],
            );
        }

        try {
            $existingId = $this->findByIdempotencyKey($data->idempotencyKey);
            if ($existingId !== null) {
                return new PublishResult($existingId, created: false);
            }

            return $this->create($data);
        } catch (Throwable $error) {
            error_log('[project-news-receiver] falha ao criar post: ' . $error->getMessage());
            return new WP_Error('project_news_publish_failed', 'Não foi possível criar o post.', ['status' => 500]);
        } finally {
            $this->lock->release($data->idempotencyKey);
        }
    }

    private function create(PostData $data): PublishResult|WP_Error
    {
        // wp_insert_post e update_post_meta removem barras; wp_slash preserva o texto original.
        $postId = wp_insert_post(wp_slash([
            'post_type' => 'post',
            'post_status' => $data->status,
            'post_title' => $data->title,
            'post_name' => $data->slug,
            'post_excerpt' => $data->excerpt,
            'post_content' => $data->contentHtml,
            'post_author' => $this->authorId(),
            'post_category' => [$this->categoryId($data->category)],
            'tags_input' => $data->tags,
            'meta_input' => [
                PostMeta::IDEMPOTENCY_KEY => $data->idempotencyKey,
                PostMeta::KEY_POINTS => $data->keyPoints,
                PostMeta::META_DESCRIPTION => $data->metaDescription,
                PostMeta::READING_TIME_MINUTES => $data->readingTimeMinutes,
                PostMeta::SOURCE_URL => $data->sourceUrl,
                PostMeta::SOURCE_SITE_NAME => $data->sourceSiteName,
                PostMeta::SOURCE_AUTHOR => $data->sourceAuthor,
                PostMeta::SOURCE_PUBLISHED_AT => $data->sourcePublishedAt,
            ],
        ]), true);

        if (is_wp_error($postId)) {
            error_log('[project-news-receiver] wp_insert_post: ' . $postId->get_error_message());
            return new WP_Error('project_news_publish_failed', 'Não foi possível criar o post.', ['status' => 500]);
        }

        $this->featuredImage->attach($postId, $data->featuredImageUrl, $data->title);

        return new PublishResult($postId, created: true);
    }

    private function findByIdempotencyKey(string $key): ?int
    {
        $ids = get_posts([
            'post_type' => 'post',
            'post_status' => 'any',
            'meta_key' => PostMeta::IDEMPOTENCY_KEY,
            'meta_value' => $key,
            'fields' => 'ids',
            'numberposts' => 1,
            'no_found_rows' => true,
        ]);

        return $ids ? (int) $ids[0] : null;
    }

    private function categoryId(string $name): int
    {
        $term = term_exists($name, 'category');
        if (is_array($term)) {
            return (int) $term['term_id'];
        }

        $created = wp_insert_term($name, 'category');
        if (is_wp_error($created)) {
            return (int) get_option('default_category');
        }

        return (int) $created['term_id'];
    }

    /** O endpoint não tem usuário logado; os posts saem no nome da "Redação". */
    private function authorId(): int
    {
        $author = get_user_by('login', Config::authorLogin());
        if ($author) {
            return $author->ID;
        }

        $admins = get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ID']);
        return $admins ? (int) $admins[0] : 0;
    }
}
