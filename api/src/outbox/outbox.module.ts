import { Module } from '@nestjs/common'
import { QueueModule } from '../queue/queue.module.js'
import { OUTBOX_REPOSITORY } from './interfaces/outbox-repository.interface.js'
import { OutboxRepository } from './repositories/outbox.repository.js'
import { OutboxRelayService } from './services/outbox-relay.service.js'

@Module({
    imports: [QueueModule],
    providers: [
        { provide: OUTBOX_REPOSITORY, useClass: OutboxRepository },
        OutboxRelayService,
    ],
})
export class OutboxModule {}
