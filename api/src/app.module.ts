import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js'
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js'
import { buildLoggerConfig } from './common/logger/logger.config.js'
import { validateEnv } from './config/env.validation.js'
import type { Env } from './config/interfaces/env.interface.js'
import { GenerationModule } from './generation/generation.module.js'
import { HealthModule } from './health/health.module.js'

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
            useFactory: (configService: ConfigService<Env, true>) => [
                {
                    ttl:
                        configService.get('THROTTLE_TTL', { infer: true }) *
                        1000,
                    limit: configService.get('THROTTLE_LIMIT', { infer: true }),
                },
            ],
        }),
        GenerationModule,
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
