import { z } from 'zod'
import { ARTICLE_CATEGORIES } from '../constants/article-categories.constants.js'

/**
 * Contrato enviado ao modelo (vira o JSON Schema da resposta). Só tipos e
 * descrições: as regras de tamanho ficam em `articleContentSchema` e só são
 * aplicadas depois de confirmar que o texto de origem era uma matéria.
 */
export const llmOutputSchema = z.object({
    is_article: z
        .boolean()
        .describe(
            'false quando o texto não é uma matéria jornalística (página inicial, lista de links, vídeo sem texto, página de erro ou paywall)',
        ),
    rejection_reason: z
        .string()
        .describe(
            'Motivo quando is_article é false; string vazia caso contrário',
        ),
    title: z
        .string()
        .describe('Título novo e informativo, com até 100 caracteres'),
    excerpt: z.string().describe('Resumo da matéria em 1 ou 2 frases'),
    body_markdown: z
        .string()
        .describe(
            'Corpo em Markdown com parágrafos separados por linha em branco: lide sem subtítulo seguido de 2 a 4 seções, cada uma iniciada por "## Subtítulo" em linha própria',
        ),
    key_points: z
        .array(z.string())
        .describe('De 3 a 5 principais pontos da matéria, uma frase cada'),
    tags: z.array(z.string()).describe('De 3 a 6 tags curtas, em minúsculas'),
    category: z.enum(ARTICLE_CATEGORIES).describe('Editoria da matéria'),
    meta_description: z
        .string()
        .describe('Descrição para buscadores com até 155 caracteres'),
})

const text = (min: number, max: number) => z.string().trim().min(min).max(max)

/** Subtítulos "##" em linha própria; grudados no parágrafo, o Markdown não os reconhece. */
const SUBHEADING = /^##\s+\S/gm

export const articleContentSchema = z.object({
    title: text(10, 140),
    excerpt: text(40, 500),
    body_markdown: text(400, 30_000).refine(
        (body) => (body.match(SUBHEADING) ?? []).length >= 2,
        'o corpo precisa de ao menos 2 subtítulos "##" em linha própria',
    ),
    key_points: z.array(text(10, 300)).min(3).max(5),
    tags: z.array(text(2, 40)).min(3).max(6),
    category: z.enum(ARTICLE_CATEGORIES),
    meta_description: text(50, 200),
})
