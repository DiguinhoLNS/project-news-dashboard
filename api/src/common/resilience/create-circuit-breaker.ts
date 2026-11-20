import { Logger } from '@nestjs/common'
import {
    CircuitBreaker,
    type CircuitBreakerOptions,
    CircuitState,
} from './circuit-breaker.js'

export function createCircuitBreaker(
    options: Omit<CircuitBreakerOptions, 'onStateChange'>,
): CircuitBreaker {
    const logger = new Logger(`CircuitBreaker:${options.name}`)
    return new CircuitBreaker({
        ...options,
        onStateChange: (from, to) => {
            const message = `Circuito ${options.name}: ${from} → ${to}`
            if (to === CircuitState.OPEN) {
                logger.warn(
                    `${message}. Chamadas suspensas por ${options.openDurationMs / 1000} s.`,
                )
            } else {
                logger.log(message)
            }
        },
    })
}
