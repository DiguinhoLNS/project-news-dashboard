export const CircuitState = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN',
} as const

export type CircuitState = (typeof CircuitState)[keyof typeof CircuitState]

export interface CircuitBreakerOptions {
    name: string
    failureThreshold: number
    openDurationMs: number
    isFailure: (error: unknown) => boolean
    onStateChange?: (from: CircuitState, to: CircuitState) => void
}

/**
 * O circuito está aberto: ou a chamada nem foi feita, ou foi ela que abriu o
 * circuito (nesse caso o erro original vem em `cause`). Quem recebe deve
 * esperar `retryAfterMs` sem tratar como falha do próprio pedido.
 */
export class CircuitOpenError extends Error {
    constructor(
        readonly circuit: string,
        readonly retryAfterMs: number,
        options?: ErrorOptions,
    ) {
        super(`${circuit} indisponível (circuito aberto)`, options)
        this.name = new.target.name
    }
}

/**
 * Circuit breaker em memória, um por processo.
 *
 * CLOSED: as chamadas passam e as falhas seguidas são contadas.
 * OPEN: as chamadas falham na hora com CircuitOpenError, sem tocar na
 * dependência, até passar `openDurationMs`.
 * HALF_OPEN: uma chamada de teste passa; se der certo, fecha; se falhar,
 * abre de novo.
 *
 * A falha que abre o circuito também sai como CircuitOpenError. Assim, numa
 * queda longa, o pedido que serviu de teste não é punido por ela.
 */
export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED
    private consecutiveFailures = 0
    private openedAt = 0
    private trialInFlight = false

    constructor(private readonly options: CircuitBreakerOptions) {}

    get currentState(): CircuitState {
        return this.state
    }

    async execute<T>(call: () => Promise<T>): Promise<T> {
        this.beforeCall()
        const isTrial = this.state === CircuitState.HALF_OPEN
        if (isTrial) {
            this.trialInFlight = true
        }

        try {
            const result = await call()
            this.onSuccess()
            return result
        } catch (error) {
            if (!this.options.isFailure(error)) {
                this.onSuccess()
                throw error
            }
            if (this.onFailure()) {
                throw new CircuitOpenError(
                    this.options.name,
                    this.options.openDurationMs,
                    { cause: error },
                )
            }
            throw error
        } finally {
            if (isTrial) {
                this.trialInFlight = false
            }
        }
    }

    private beforeCall(): void {
        if (this.state === CircuitState.OPEN) {
            const remainingMs =
                this.openedAt + this.options.openDurationMs - Date.now()
            if (remainingMs > 0) {
                throw new CircuitOpenError(this.options.name, remainingMs)
            }
            this.moveTo(CircuitState.HALF_OPEN)
        }
        // Só uma chamada de teste por vez; as outras esperam o resultado dela.
        if (this.state === CircuitState.HALF_OPEN && this.trialInFlight) {
            throw new CircuitOpenError(
                this.options.name,
                this.options.openDurationMs,
            )
        }
    }

    private onSuccess(): void {
        this.consecutiveFailures = 0
        if (this.state !== CircuitState.CLOSED) {
            this.moveTo(CircuitState.CLOSED)
        }
    }

    private onFailure(): boolean {
        this.consecutiveFailures++
        if (
            this.state === CircuitState.HALF_OPEN ||
            this.consecutiveFailures >= this.options.failureThreshold
        ) {
            this.openedAt = Date.now()
            this.moveTo(CircuitState.OPEN)
            return true
        }
        return false
    }

    private moveTo(state: CircuitState): void {
        const from = this.state
        if (from === state) {
            return
        }
        this.state = state
        this.options.onStateChange?.(from, state)
    }
}
