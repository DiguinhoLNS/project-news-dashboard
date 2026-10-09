import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { getQueueToken } from '@nestjs/bullmq'
import type { INestApplication } from '@nestjs/common'
import type { Queue } from 'bullmq'
import { GENERATION_QUEUE_NAME } from '../constants/generation-queue.constants.js'

const DASHBOARD_PATH = '/queues'

export function setupQueueDashboard(app: INestApplication): void {
    const serverAdapter = new ExpressAdapter()
    serverAdapter.setBasePath(DASHBOARD_PATH)

    createBullBoard({
        queues: [
            new BullMQAdapter(
                app.get<Queue>(getQueueToken(GENERATION_QUEUE_NAME)),
            ),
        ],
        serverAdapter,
    })

    app.use(DASHBOARD_PATH, serverAdapter.getRouter())
}
