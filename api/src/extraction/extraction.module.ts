import { Module } from '@nestjs/common'
import { ArticleExtractorService } from './services/article-extractor.service.js'

@Module({
    providers: [ArticleExtractorService],
    exports: [ArticleExtractorService],
})
export class ExtractionModule {}
