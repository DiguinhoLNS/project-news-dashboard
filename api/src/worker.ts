import { NestFactory } from '@nestjs/core'
import { Logger } from 'nestjs-pino'
import { WorkerModule } from './worker/worker.module.js'

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(WorkerModule, {
        bufferLogs: true,
    })
    app.useLogger(app.get(Logger))
    // Ao parar o container, termina o job em andamento antes de sair.
    app.enableShutdownHooks()
}

await bootstrap()
