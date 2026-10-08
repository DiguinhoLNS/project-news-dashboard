import { z } from 'zod'
import {
    InvalidLlmOutputError,
    NotAnArticleError,
} from '../exceptions/generation.exception.js'
import type { GeneratedArticle } from '../interfaces/generated-article.interface.js'
import {
    articleContentSchema,
    llmOutputSchema,
} from '../schemas/llm-output.schema.js'

/**
 * Valida a resposta bruta do modelo. É aqui, e não no provedor, que o
 * contrato é garantido: qualquer provedor passa pelas mesmas regras.
 */
export function parseLlmOutput(raw: string): GeneratedArticle {
    let json: unknown
    try {
        json = JSON.parse(raw)
    } catch {
        throw new InvalidLlmOutputError('a resposta não é um JSON válido')
    }

    const output = llmOutputSchema.safeParse(json)
    if (!output.success) {
        throw new InvalidLlmOutputError(z.prettifyError(output.error))
    }
    if (!output.data.is_article) {
        throw new NotAnArticleError(
            output.data.rejection_reason.trim() || 'motivo não informado',
        )
    }

    const content = articleContentSchema.safeParse(output.data)
    if (!content.success) {
        throw new InvalidLlmOutputError(z.prettifyError(content.error))
    }

    const article = content.data
    // O Markdown é montado aqui, a partir da estrutura: o modelo não tem como
    // errar a formatação (subtítulo grudado no texto, parágrafos sem quebra).
    const bodyMarkdown = [
        ...article.lead,
        ...article.sections.flatMap((section) => [
            `## ${section.heading}`,
            ...section.paragraphs,
        ]),
    ].join('\n\n')

    return {
        title: article.title,
        excerpt: article.excerpt,
        bodyMarkdown,
        keyPoints: article.key_points,
        tags: [...new Set(article.tags.map((tag) => tag.toLowerCase()))],
        category: article.category,
        metaDescription: article.meta_description,
    }
}
