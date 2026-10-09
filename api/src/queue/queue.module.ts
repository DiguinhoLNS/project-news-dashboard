import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Env } from '../config/interfaces/env.interface.js'
import { GENERATION_QUEUE_NAME } from './constants/generation-queue.constants.js'
import { GENERATION_QUEUE } from './interfaces/generation-queue.interface.js'
import { BullMqGenerationQueue } from './providers/bullmq-generation.queue.js'
import { buildRedisConnection } from './utils/redis-connection.js'

@Module({
    imports: [
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Env, true>) => ({
                connection: buildRedisConnection(
                    configService.get('REDIS_URL', { infer: true }),
                ),
            }),
        }),
        BullModule.registerQueue({ name: GENERATION_QUEUE_NAME }),
    ],
    providers: [{ provide: GENERATION_QUEUE, useClass: BullMqGenerationQueue }],
    exports: [BullModule, GENERATION_QUEUE],
})
export class QueueModule {}
