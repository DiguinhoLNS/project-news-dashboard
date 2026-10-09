import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import type { Env } from './config/interfaces/env.interface.js'
import { CoreModule } from './core/core.module.js'
import { HealthModule } from './health/health.module.js'
import { JobsModule } from './jobs/jobs.module.js'
import { PostsModule } from './posts/posts.module.js'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js'
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js'

@Module({
    imports: [
        CoreModule,
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
