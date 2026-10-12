export function absoluteHttpUrl(
    value: string | null | undefined,
    base?: URL,
): string | undefined {
    if (!value) {
        return undefined
    }
    try {
        const url = new URL(value, base)
        return url.protocol === 'http:' || url.protocol === 'https:'
            ? url.href
            : undefined
    } catch {
        return undefined
    }
}
