/** Depois de 3 falhas seguidas, o WordPress fica 30 s sem chamadas. */
export const WORDPRESS_CIRCUIT_BREAKER = {
    failureThreshold: 3,
    openDurationMs: 30_000,
}
