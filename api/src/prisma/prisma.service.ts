import {
    Injectable,
    type OnModuleDestroy,
    type OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import type { Env } from '../config/interfaces/env.interface.js'
import { PrismaClient } from '../generated/prisma/client.js'

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor(configService: ConfigService<Env, true>) {
        super({
            adapter: new PrismaPg({
                connectionString: configService.get('DATABASE_URL', {
                    infer: true,
                }),
            }),
        })
    }

    async onModuleInit(): Promise<void> {
        await this.$connect()
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect()
    }
}
