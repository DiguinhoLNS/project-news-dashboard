/** Intervalo entre leituras do outbox quando ele está vazio. */
export const OUTBOX_POLL_INTERVAL_MS = 1_000

/** Mensagens reservadas por leitura. */
export const OUTBOX_BATCH_SIZE = 20

/**
 * Tempo de reserva de uma mensagem. Se o relay cair no meio do envio, outra
 * instância a pega depois disso; como o envio é idempotente, repetir é seguro.
 */
export const OUTBOX_LEASE_MS = 30_000

/** Tempo máximo de um envio à fila antes de contar como falha. */
export const OUTBOX_DISPATCH_TIMEOUT_MS = 5_000

/** Backoff exponencial entre tentativas: 1 s, 2 s, 4 s... até 1 min. */
export const OUTBOX_RETRY_BASE_MS = 1_000
export const OUTBOX_RETRY_MAX_MS = 60_000
