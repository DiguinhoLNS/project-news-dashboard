import { slugify } from './slugify.js'

const HEADING = /^##\s+/

const HTML_ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}

/**
 * Converte o Markdown que a própria API monta (parágrafos e subtítulos "##")
 * em HTML. Todo o texto é escapado: nenhum HTML vindo da IA chega ao WordPress.
 */
export function renderArticleHtml(markdown: string): string {
    const usedIds = new Set<string>()

    return markdown
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
            if (!HEADING.test(block)) {
                return `<p>${escapeHtml(block)}</p>`
            }
            const heading = block.replace(HEADING, '')
            const id = uniqueId(slugify(heading) || 'secao', usedIds)
            return `<h2 id="${id}">${escapeHtml(heading)}</h2>`
        })
        .join('\n')
}

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}

function uniqueId(base: string, usedIds: Set<string>): string {
    let id = base
    for (let suffix = 2; usedIds.has(id); suffix++) {
        id = `${base}-${suffix}`
    }
    usedIds.add(id)
    return id
}
