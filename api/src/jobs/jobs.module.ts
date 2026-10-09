import { Module } from '@nestjs/common'
import { JobsController } from './controllers/jobs.controller.js'
import { GENERATION_JOB_REPOSITORY } from './interfaces/generation-job-repository.interface.js'
import { GenerationJobRepository } from './repositories/generation-job.repository.js'
import { GetJobService } from './services/get-job.service.js'
import { ListJobsService } from './services/list-jobs.service.js'

@Module({
    controllers: [JobsController],
    providers: [
        {
            provide: GENERATION_JOB_REPOSITORY,
            useClass: GenerationJobRepository,
        },
        ListJobsService,
        GetJobService,
    ],
    exports: [GENERATION_JOB_REPOSITORY],
})
export class JobsModule {}
