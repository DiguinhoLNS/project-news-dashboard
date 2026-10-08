import { Readability } from '@mozilla/readability'
import { Injectable } from '@nestjs/common'
import { JSDOM } from 'jsdom'
import type { SourceArticle } from '../../generation/interfaces/source-article.interface.js'
import { MIN_ARTICLE_TEXT_CHARS } from '../constants/extraction.constants.js'
import { NotReadableError } from '../exceptions/extraction.exception.js'
import type { FetchedPage } from '../interfaces/fetched-page.interface.js'
import { fetchPage } from '../utils/fetch-page.js'
import { htmlToText } from '../utils/html-to-text.js'

@Injectable()
export class ArticleExtractorService {
    async extract(url: string): Promise<SourceArticle> {
        return parseArticle(await fetchPage(url))
    }
}

function parseArticle(page: FetchedPage): SourceArticle {
    const dom = new JSDOM(page.html, {
        url: page.url.href,
        contentType: htmlContentType(page.contentType),
    })
    const { document } = dom.window

    try {
        const attr = (selector: string, attribute = 'content') =>
            document.querySelector(selector)?.getAttribute(attribute)?.trim() ||
            undefined
        const authorName = document.querySelector(
            '[itemprop="author"] [itemprop="name"]',
        )

        // O Readability altera o documento: os metadados são lidos antes.
        // Open Graph primeiro; schema.org (itemprop) cobre portais como o G1.
        const metadata = {
            title: attr('meta[property="og:title"]') ?? document.title,
            siteName: attr('meta[property="og:site_name"]'),
            author:
                attr('meta[name="author"]') ??
                (
                    authorName?.getAttribute('content') ??
                    authorName?.textContent
                )?.trim() ??
                undefined,
            publishedAt:
                attr('meta[property="article:published_time"]') ??
                attr('meta[itemprop="datePublished"]') ??
                attr('time[itemprop="datePublished"]', 'datetime'),
            imageUrl:
                attr('meta[property="og:image"]') ??
                attr('meta[name="twitter:image"]'),
        }

        const article = new Readability(document).parse()
        const text = article?.content ? htmlToText(article.content) : ''

        if (text.length < MIN_ARTICLE_TEXT_CHARS) {
            throw new NotReadableError(
                'não foi encontrado texto de matéria suficiente na página',
            )
        }

        const siteName =
            article?.siteName?.trim() || metadata.siteName || page.url.hostname

        return {
            url: page.url.href,
            title: withoutSiteName(
                article?.title?.trim() || metadata.title.trim(),
                siteName,
            ),
            text,
            siteName,
            author: article?.byline?.trim() || metadata.author || undefined,
            publishedAt: article?.publishedTime?.trim() || metadata.publishedAt,
            imageUrl: absoluteHttpUrl(metadata.imageUrl, page.url),
        }
    } finally {
        dom.window.close()
    }
}

/** Força o parser HTML (XHTML malformado quebraria o parser XML) mantendo o charset. */
function htmlContentType(contentType: string): string {
    const charset = /charset=([^;]+)/i.exec(contentType)?.[1]?.trim()
    return charset ? `text/html; charset=${charset}` : 'text/html'
}

/** "Título da matéria | G1" → "Título da matéria" */
function withoutSiteName(title: string, siteName: string): string {
    const escaped = siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return title.replace(new RegExp(`\\s+[|–—-]\\s+${escaped}\\s*$`, 'i'), '')
}

function absoluteHttpUrl(value: string | undefined, base: URL) {
    if (!value) {
        return undefined
    }
    try {
        const url = new URL(value, base)
        return url.protocol === 'http:' || url.protocol === 'https:'
            ? url.href
            : undefined
    } catch {
        return undefined
    }
}
