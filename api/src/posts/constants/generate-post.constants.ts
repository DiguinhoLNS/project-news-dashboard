/**
 * Limite próprio da rota de geração, bem abaixo do global: cada chamada
 * consome a cota do Gemini (no plano gratuito, poucas requisições por minuto).
 */
export const GENERATE_POST_THROTTLE = { limit: 5, ttl: 60_000 }
