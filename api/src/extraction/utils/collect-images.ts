import { JSDOM } from 'jsdom'
import type { SourceImage } from '../../generation/interfaces/source-image.interface.js'
import {
    MAX_IMAGE_CANDIDATES,
    MAX_IMAGE_CAPTION_CHARS,
    MIN_IMAGE_WIDTH,
} from '../constants/extraction.constants.js'
import { absoluteHttpUrl } from './absolute-http-url.js'

export function normalizeImages(document: Document): void {
    for (const ampImg of document.querySelectorAll('amp-img')) {
        const img = document.createElement('img')

        for (const attribute of ['src', 'srcset', 'alt', 'width', 'height']) {
            const value = ampImg.getAttribute(attribute)

            if (value) {
                img.setAttribute(attribute, value)
            }
        }

        ampImg.replaceWith(img)
    }

    for (const thumbnail of document.querySelectorAll('[itemtype*="VideoObject"] img')) {
        thumbnail.remove()
    }
}

export function collectImages(
    contentHtml: string,
    cover: SourceImage | undefined,
): SourceImage[] {
    const images: SourceImage[] = cover ? [{ url: cover.url, caption: toCaption(cover.caption) }] : []

    for (const img of JSDOM.fragment(contentHtml).querySelectorAll('img')) {
        if (images.length >= MAX_IMAGE_CANDIDATES) {
            break
        }

        const source = largestSource(img)
        const url = absoluteHttpUrl(source.url)
        const caption = toCaption(
            img.closest('figure')?.querySelector('figcaption')?.textContent ??
                img.getAttribute('alt'),
        )

        if (
            !url ||
            !caption ||
            (source.width && source.width < MIN_IMAGE_WIDTH)
        ) {
            continue
        }

        const duplicate = images.find(
            (image) => imageKey(image.url) === imageKey(url),
        )

        if (duplicate) {
            duplicate.caption ??= caption
            continue
        }

        images.push({ url, caption })
    }

    return images
}

function largestSource(img: Element): { url?: string; width: number } {
    const [largest] = (img.getAttribute('srcset') ?? '')
        .split(/,\s+/)
        .map((candidate) => {
            const [url, descriptor = ''] = candidate.trim().split(/\s+/)
            return { url, width: Number(/^(\d+)w$/.exec(descriptor)?.[1] ?? 0) }
        })
        .filter((candidate) => candidate.url && candidate.width > 0)
        .sort((a, b) => b.width - a.width)

    return (
        largest ?? {
            url: img.getAttribute('src') ?? undefined,
            width: Number(img.getAttribute('width')) || 0,
        }
    )
}

function toCaption(text: string | null | undefined): string | undefined {
    return (
        text?.replace(/\s+/g, ' ').trim().slice(0, MAX_IMAGE_CAPTION_CHARS) ||
        undefined
    )
}

function imageKey(url: string): string {
    const fileName = new URL(url).pathname.split('/').pop() || url
    return fileName.toLowerCase().replace(/-\d+x\d+(?=\.\w+$)/, '')
}
