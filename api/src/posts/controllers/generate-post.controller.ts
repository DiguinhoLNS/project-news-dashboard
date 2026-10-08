import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { GeneratePostDto } from '../dto/generate-post.dto.js'
import { GeneratedPostEntity } from '../entities/generated-post.entity.js'
import { GeneratePostService } from '../services/generate-post.service.js'
import { ApiOkResponseData } from '../../common/decorators/api-response-data.decorator.js'
import { GENERATE_POST_THROTTLE } from '../constants/generate-post.constants.js'

@ApiTags('posts')
@Controller('generate-post')
export class GeneratePostController {
    constructor(private readonly generatePostService: GeneratePostService) {}

    /**
     * Lê a matéria da URL, reescreve com a IA e devolve o post gerado.
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: GENERATE_POST_THROTTLE })
    @ApiOkResponseData(GeneratedPostEntity)
    async generate(@Body() dto: GeneratePostDto) {
        return {
            message: 'Post gerado com sucesso.',
            data: await this.generatePostService.execute(dto.url),
        }
    }
}
