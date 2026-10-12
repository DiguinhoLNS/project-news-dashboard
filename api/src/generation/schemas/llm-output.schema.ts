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
    lead: z
        .array(z.string())
        .describe(
            'Abertura da matéria: 1 ou 2 parágrafos, o primeiro resumindo o fato principal',
        ),
    sections: z
        .array(
            z.object({
                heading: z.string().describe('Subtítulo da seção'),
                paragraphs: z
                    .array(z.string())
                    .describe('Parágrafos da seção, um por item'),
            }),
        )
        .describe('De 2 a 4 seções que desenvolvem a matéria'),
    key_points: z
        .array(z.string())
        .describe('De 3 a 5 principais pontos da matéria, uma frase cada'),
    tags: z.array(z.string()).describe('De 3 a 6 tags curtas, em minúsculas'),
    category: z.enum(ARTICLE_CATEGORIES).describe('Editoria da matéria'),
    featured_image: z
        .int()
        .min(0)
        .describe(
            'Índice, em <imagens>, da imagem que melhor ilustra o novo título; 0 se não houver <imagens>',
        ),
    meta_description: z
        .string()
        .describe('Descrição para buscadores com até 155 caracteres'),
})

const text = (min: number, max: number) => z.string().trim().min(min).max(max)

/** Um parágrafo por item: quebras de linha e "#" soltos viram texto corrido. */
const paragraph = text(20, 3_000).transform((value) =>
    value.replace(/^#+\s*/, '').replace(/\s+/g, ' '),
)

export const articleContentSchema = z.object({
    title: text(10, 140),
    excerpt: text(40, 500),
    lead: z.array(paragraph).min(1).max(3),
    sections: z
        .array(
            z.object({
                heading: text(3, 120).transform((value) =>
                    value.replace(/^#+\s*/, ''),
                ),
                paragraphs: z.array(paragraph).min(1).max(6),
            }),
        )
        .min(2)
        .max(4),
    key_points: z.array(text(10, 300)).min(3).max(5),
    tags: z.array(text(2, 40)).min(3).max(6),
    category: z.enum(ARTICLE_CATEGORIES),
    meta_description: text(50, 200),
})
