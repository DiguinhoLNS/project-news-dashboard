import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Response } from 'express'
import { GeneratePostDto } from '../dto/generate-post.dto.js'
import { GeneratePostService } from '../services/generate-post.service.js'
import { GenerationJobEntity } from '../../jobs/entities/generation-job.entity.js'
import { ApiOkResponseData } from '../../common/decorators/api-response-data.decorator.js'
import { GENERATE_POST_THROTTLE } from '../constants/generate-post.constants.js'

@ApiTags('posts')
@Controller('generate-post')
export class GeneratePostController {
    constructor(private readonly generatePostService: GeneratePostService) {}

    /**
     * Envia a matéria da URL para a fila de geração e devolve o job.
     * Acompanhe o progresso em GET /api/jobs/:id.
     */
    @Post()
    @Throttle({ default: GENERATE_POST_THROTTLE })
    @ApiOkResponseData(GenerationJobEntity, {
        status: HttpStatus.ACCEPTED,
        description: 'Job criado e enviado para a fila.',
    })
    @ApiOkResponseData(GenerationJobEntity, {
        description: 'A URL já tinha um job em andamento ou concluído.',
    })
    async generate(
        @Body() dto: GeneratePostDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const { job, reused, processed } =
            await this.generatePostService.execute(dto.url)
        response.status(reused ? HttpStatus.OK : HttpStatus.ACCEPTED)

        return { message: describeResult(reused, processed), data: job }
    }
}

function describeResult(reused: boolean, processed: boolean): string {
    if (!reused) {
        return 'Matéria enviada para processamento.'
    }
    return processed
        ? 'Esta matéria já foi processada.'
        : 'Esta matéria já está sendo processada.'
}
