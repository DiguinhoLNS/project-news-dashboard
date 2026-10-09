import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiOkResponseData } from '../../common/decorators/api-response-data.decorator.js'
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js'
import { GenerationJobPageEntity } from '../entities/generation-job-page.entity.js'
import { GenerationJobEntity } from '../entities/generation-job.entity.js'
import { GetJobService } from '../services/get-job.service.js'
import { ListJobsService } from '../services/list-jobs.service.js'

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
    constructor(
        private readonly listJobsService: ListJobsService,
        private readonly getJobService: GetJobService,
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
}
