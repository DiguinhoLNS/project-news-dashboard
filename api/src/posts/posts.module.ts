import { Module } from '@nestjs/common'
import { JobsModule } from '../jobs/jobs.module.js'
import { QueueModule } from '../queue/queue.module.js'
import { GeneratePostController } from './controllers/generate-post.controller.js'
import { GeneratePostService } from './services/generate-post.service.js'

@Module({
    imports: [JobsModule, QueueModule],
    controllers: [GeneratePostController],
    providers: [GeneratePostService],
})
export class PostsModule {}
