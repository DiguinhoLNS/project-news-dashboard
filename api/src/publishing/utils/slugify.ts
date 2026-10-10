export function slugify(text: string, maxLength = 80): string {
    const slug = text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    if (slug.length <= maxLength) {
        return slug
    }

    const cut = slug.slice(0, maxLength + 1)
    const lastHyphen = cut.lastIndexOf('-')

    return (
        lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut.slice(0, maxLength)
    ).replace(/-+$/, '')
}
