import { InjectQueue } from '@nestjs/bullmq'
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { Queue } from 'bullmq'
import { ApiOkResponseData } from '../../common/decorators/api-response-data.decorator.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import { GENERATION_QUEUE_NAME } from '../../queue/constants/generation-queue.constants.js'
import { HealthStatusEntity } from '../entities/health-status.entity.js'
import { withTimeout } from '../utils/with-timeout.js'

const CHECK_TIMEOUT_MS = 3_000

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue(GENERATION_QUEUE_NAME) private readonly queue: Queue,
    ) {}

    /** Fora do rate limit: o healthcheck do Docker chama esta rota o tempo todo. */
    @SkipThrottle()
    @Get()
    @ApiOkResponseData(HealthStatusEntity)
    async check(): Promise<HealthStatusEntity> {
        try {
            await withTimeout(this.prisma.$queryRaw`SELECT 1`, CHECK_TIMEOUT_MS)
        } catch {
            throw new ServiceUnavailableException(
                'Banco de dados indisponível.',
            )
        }
        try {
            await withTimeout(this.queue.isPaused(), CHECK_TIMEOUT_MS)
        } catch {
            throw new ServiceUnavailableException('Redis indisponível.')
        }
        return { status: 'ok', timestamp: new Date().toISOString() }
    }
}
