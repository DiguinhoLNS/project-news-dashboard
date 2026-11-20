import { Module } from '@nestjs/common'
import { JobsModule } from '../jobs/jobs.module.js'
import { GeneratePostController } from './controllers/generate-post.controller.js'
import { GeneratePostService } from './services/generate-post.service.js'

@Module({
    imports: [JobsModule],
    controllers: [GeneratePostController],
    providers: [GeneratePostService],
})
export class PostsModule {}
