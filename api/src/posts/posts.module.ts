import { Module } from '@nestjs/common'
import { ExtractionModule } from '../extraction/extraction.module.js'
import { GenerationModule } from '../generation/generation.module.js'
import { JobsModule } from '../jobs/jobs.module.js'
import { GeneratePostController } from './controllers/generate-post.controller.js'
import { GeneratePostService } from './services/generate-post.service.js'

@Module({
    imports: [ExtractionModule, GenerationModule, JobsModule],
    controllers: [GeneratePostController],
    providers: [GeneratePostService],
})
export class PostsModule {}
