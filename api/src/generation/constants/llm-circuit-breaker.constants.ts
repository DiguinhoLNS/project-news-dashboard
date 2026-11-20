/**
 * O 429 do plano gratuito costuma valer pelo minuto corrente: depois de 3
 * falhas seguidas, o Gemini fica 1 min sem chamadas.
 */
export const LLM_CIRCUIT_BREAKER = {
    failureThreshold: 3,
    openDurationMs: 60_000,
}
