import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { ApiOkResponseData } from '../../common/decorators/api-response-data.decorator.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import { HealthStatusEntity } from '../entities/health-status.entity.js'

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) {}

    /** Fora do rate limit: o healthcheck do Docker chama esta rota o tempo todo. */
    @SkipThrottle()
    @Get()
    @ApiOkResponseData(HealthStatusEntity)
    async check(): Promise<HealthStatusEntity> {
        try {
            await this.prisma.$queryRaw`SELECT 1`
        } catch {
            throw new ServiceUnavailableException(
                'Banco de dados indisponível.',
            )
        }
        return { status: 'ok', timestamp: new Date().toISOString() }
    }
}
