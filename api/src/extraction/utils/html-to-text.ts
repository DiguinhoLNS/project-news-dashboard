import { JSDOM } from 'jsdom'

const BLOCKS = 'h2, h3, h4, p, li, blockquote, pre'

/**
 * Converte o HTML limpo da matéria em texto, um bloco por parágrafo.
 * O `textContent` do Readability junta tudo numa linha só, e a separação
 * em parágrafos ajuda o modelo a entender a estrutura do original.
 */
export function htmlToText(html: string): string {
    const fragment = JSDOM.fragment(html)
    const paragraphs = [...fragment.querySelectorAll(BLOCKS)]
        .filter((element) => !element.parentElement?.closest(BLOCKS))
        .map((element) => normalize(element.textContent ?? ''))
        .filter(Boolean)

    return paragraphs.length > 0
        ? paragraphs.join('\n\n')
        : normalize(fragment.textContent ?? '')
}

function normalize(text: string): string {
    return text.replace(/\s+/g, ' ').trim()
}
