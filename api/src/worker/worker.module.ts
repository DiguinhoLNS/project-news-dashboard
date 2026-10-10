import { Module } from '@nestjs/common'
import { CoreModule } from '../core/core.module.js'
import { ExtractionModule } from '../extraction/extraction.module.js'
import { GenerationModule } from '../generation/generation.module.js'
import { JobsModule } from '../jobs/jobs.module.js'
import { PublishingModule } from '../publishing/publishing.module.js'
import { QueueModule } from '../queue/queue.module.js'
import { GenerationProcessor } from './processors/generation.processor.js'
import { ProcessGenerationJobService } from './services/process-generation-job.service.js'

@Module({
    imports: [
        CoreModule,
        QueueModule,
        ExtractionModule,
        GenerationModule,
        JobsModule,
        PublishingModule,
    ],
    providers: [ProcessGenerationJobService, GenerationProcessor],
})
export class WorkerModule {}
