import { Module } from '@nestjs/common'
import { LoggerModule } from 'nestjs-pino'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import type { Env } from './config/interfaces/env.interface.js'
import { validateEnv } from './config/env.validation.js'
import { HealthModule } from './health/health.module.js'
import { JobsModule } from './jobs/jobs.module.js'
import { PostsModule } from './posts/posts.module.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { buildLoggerConfig } from './common/logger/logger.config.js'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js'
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js'

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
        ThrottlerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Env, true>) => ({
                errorMessage:
                    'Muitas requisições em pouco tempo. Tente novamente em instantes.',
                throttlers: [
                    {
                        ttl:
                            configService.get('THROTTLE_TTL', {
                                infer: true,
                            }) * 1000,
                        limit: configService.get('THROTTLE_LIMIT', {
                            infer: true,
                        }),
                    },
                ],
            }),
        }),
        PrismaModule,
        PostsModule,
        JobsModule,
        HealthModule,
    ],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        // Registrados via DI (não instanciados no main.ts) porque o
        // AllExceptionsFilter depende do PinoLogger, um provider
        // transient-scoped que só o container do Nest sabe resolver.
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    ],
})
export class AppModule {}
