export const GENERATION_WORKER_CONCURRENCY = 2

/** Cada job faz 1 ou 2 chamadas ao Gemini; o limite segura a cota do plano gratuito. */
export const GENERATION_RATE_LIMIT = { max: 8, duration: 60_000 }
