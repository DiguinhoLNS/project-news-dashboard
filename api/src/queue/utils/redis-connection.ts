import type { ConnectionOptions } from 'bullmq'

export function buildRedisConnection(redisUrl: string): ConnectionOptions {
    const url = new URL(redisUrl)
    return {
        host: url.hostname,
        port: Number(url.port || 6379),
        username: url.username || undefined,
        password: url.password || undefined,
        db: Number(url.pathname.slice(1) || 0),
    }
}
