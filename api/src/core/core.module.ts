import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { buildLoggerConfig } from '../common/logger/logger.config.js'
import { validateEnv } from '../config/env.validation.js'
import type { Env } from '../config/interfaces/env.interface.js'
import { PrismaModule } from '../prisma/prisma.module.js'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        LoggerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Env, true>) =>
                buildLoggerConfig(
                    configService.get('LOG_LEVEL', { infer: true }),
                    configService.get('NODE_ENV', { infer: true }) ===
                        'production',
                ),
        }),
        PrismaModule,
    ],
})
export class CoreModule {}
