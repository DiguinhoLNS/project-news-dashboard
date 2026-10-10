import { createHmac } from 'node:crypto'

export function signWebhook(
    body: string,
    timestamp: string,
    secret: string,
): string {
    const digest = createHmac('sha256', secret)
        .update(`${timestamp}.${body}`)
        .digest('hex')
    return `sha256=${digest}`
}
