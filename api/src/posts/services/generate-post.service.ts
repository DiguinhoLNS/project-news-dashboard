import { Injectable, Logger } from '@nestjs/common'
import { ArticleExtractorService } from '../../extraction/services/article-extractor.service.js'
import { ArticleGeneratorService } from '../../generation/services/article-generator.service.js'
import type { GeneratedPost } from '../interfaces/generated-post.interface.js'
import { toHttpException } from '../utils/to-http-exception.js'

@Injectable()
export class GeneratePostService {
    private readonly logger = new Logger(GeneratePostService.name)

    constructor(
        private readonly extractor: ArticleExtractorService,
        private readonly generator: ArticleGeneratorService,
    ) {}

    async execute(url: string): Promise<GeneratedPost> {
        try {
            const source = await this.extractor.extract(url)
            const generation = await this.generator.generate(source)
            const { text: _text, ...metadata } = source

            return { source: metadata, ...generation }
        } catch (error) {
            this.logger.warn(
                `Falha ao gerar post de ${url}: ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`,
            )
            throw toHttpException(error)
        }
    }
}
