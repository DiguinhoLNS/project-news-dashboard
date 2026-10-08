import type { JsonSchema } from '../interfaces/json-schema.interface.js'

/** Palavras-chave de JSON Schema aceitas em `responseJsonSchema` (documentação do SDK). */
const SUPPORTED_KEYWORDS = new Set([
    '$id',
    '$defs',
    '$ref',
    '$anchor',
    'type',
    'format',
    'title',
    'description',
    'enum',
    'items',
    'prefixItems',
    'minItems',
    'maxItems',
    'minimum',
    'maximum',
    'anyOf',
    'oneOf',
    'properties',
    'additionalProperties',
    'required',
])

/**
 * Remove do schema o que o Gemini não suporta (ex.: $schema, minLength,
 * maxLength). Essas regras continuam valendo na validação com Zod.
 */
export function toGeminiJsonSchema(schema: JsonSchema): JsonSchema {
    const result: JsonSchema = {}
    for (const [keyword, value] of Object.entries(schema)) {
        if (SUPPORTED_KEYWORDS.has(keyword)) {
            result[keyword] = sanitizeValue(keyword, value)
        }
    }
    return result
}

function sanitizeValue(keyword: string, value: unknown): unknown {
    switch (keyword) {
        case 'properties':
        case '$defs':
            return Object.fromEntries(
                Object.entries(value as Record<string, JsonSchema>).map(
                    ([name, child]) => [name, toGeminiJsonSchema(child)],
                ),
            )
        case 'anyOf':
        case 'oneOf':
        case 'prefixItems':
            return (value as JsonSchema[]).map(toGeminiJsonSchema)
        case 'items':
        case 'additionalProperties':
            return isSchema(value) ? toGeminiJsonSchema(value) : value
        default:
            return value
    }
}

function isSchema(value: unknown): value is JsonSchema {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}
