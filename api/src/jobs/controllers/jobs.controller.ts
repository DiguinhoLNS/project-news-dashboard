import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { ApiOkResponseData } from '../../common/decorators/api-response-data.decorator.js'
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js'
import { RETRY_JOB_THROTTLE } from '../constants/retry-job.constants.js'
import { GenerationJobPageEntity } from '../entities/generation-job-page.entity.js'
import { GenerationJobEntity } from '../entities/generation-job.entity.js'
import { GetJobService } from '../services/get-job.service.js'
import { ListJobsService } from '../services/list-jobs.service.js'
import { RetryJobService } from '../services/retry-job.service.js'

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
    constructor(
        private readonly listJobsService: ListJobsService,
        private readonly getJobService: GetJobService,
        private readonly retryJobService: RetryJobService,
    ) {}

    /** Histórico de gerações, das mais recentes para as mais antigas. */
    @Get()
    @ApiOkResponseData(GenerationJobPageEntity)
    list(@Query() query: PaginationQueryDto) {
        return this.listJobsService.execute(query)
    }

    @Get(':id')
    @ApiOkResponseData(GenerationJobEntity)
    get(@Param('id', ParseUUIDPipe) id: string) {
        return this.getJobService.execute(id)
    }

    /**
     * Reenvia para a fila um job que falhou. Se o conteúdo já tinha sido
     * gerado, só o envio ao WordPress é refeito, sem nova chamada à IA.
     */
    @Post(':id/retry')
    @HttpCode(HttpStatus.ACCEPTED)
    @Throttle({ default: RETRY_JOB_THROTTLE })
    @ApiOkResponseData(GenerationJobEntity, {
        status: HttpStatus.ACCEPTED,
        description: 'Job de volta na fila.',
    })
    async retry(@Param('id', ParseUUIDPipe) id: string) {
        const job = await this.retryJobService.execute(id)
        return { message: 'Job reenviado para processamento.', data: job }
    }
}
