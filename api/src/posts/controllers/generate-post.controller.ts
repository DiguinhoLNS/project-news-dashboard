import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
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
     * Lê a matéria da URL, reescreve com a IA e devolve o job com o post gerado.
     * Se a URL já tiver um job em andamento ou concluído, devolve esse job.
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: GENERATE_POST_THROTTLE })
    @ApiOkResponseData(GenerationJobEntity)
    async generate(@Body() dto: GeneratePostDto) {
        const { job, reused } = await this.generatePostService.execute(dto.url)
        return {
            message: reused
                ? 'Esta matéria já foi processada.'
                : 'Post gerado com sucesso.',
            data: job,
        }
    }
}
