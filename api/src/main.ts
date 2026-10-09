import { Logger } from 'nestjs-pino'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { type NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type { Env } from './config/interfaces/env.interface.js'
import { AppModule } from './app.module.js'
import { setupQueueDashboard } from './queue/utils/setup-queue-dashboard.js'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bufferLogs: true,
    })

    const configService = app.get(ConfigService<Env, true>)
    app.useLogger(app.get(Logger))

    app.enableCors()
    app.setGlobalPrefix('api')
    app.enableShutdownHooks()

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )

    const swaggerConfig = new DocumentBuilder()
        .setTitle(configService.get('APP_NAME', { infer: true }))
        .setDescription('API para o Project News Dashboard')
        .setVersion('1.0')
        .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'Project News Dashboard — API Docs',
        swaggerOptions: {
            persistAuthorization: true,
        },
    })

    // O painel expõe os dados dos jobs e permite reprocessá-los ou apagá-los.
    if (configService.get('NODE_ENV', { infer: true }) !== 'production') {
        setupQueueDashboard(app)
    }

    const port = configService.get('PORT', { infer: true })

    await app.listen(port)
}

await bootstrap()
