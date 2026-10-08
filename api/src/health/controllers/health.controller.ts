import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { ApiOkResponseData } from '../../common/decorators/api-response-data.decorator.js'
import { HealthStatusEntity } from '../entities/health-status.entity.js'

@ApiTags('health')
@Controller('health')
export class HealthController {
    /** Fora do rate limit: o healthcheck do Docker chama esta rota o tempo todo. */
    @SkipThrottle()
    @Get()
    @ApiOkResponseData(HealthStatusEntity)
    check(): HealthStatusEntity {
        return { status: 'ok', timestamp: new Date().toISOString() }
    }
}
