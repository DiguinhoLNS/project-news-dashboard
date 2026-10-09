const WORDS_PER_MINUTE = 200

export function readingTimeMinutes(text: string): number {
    const words = text.split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
