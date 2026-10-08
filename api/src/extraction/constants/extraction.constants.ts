/** Tempo máximo para baixar a página, somando todos os redirects. */
export const FETCH_TIMEOUT_MS = 15_000

export const MAX_REDIRECTS = 5

/** Páginas de notícia raramente passam de 2 MB; acima disso é outra coisa. */
export const MAX_HTML_BYTES = 5 * 1024 * 1024

/** Menos texto que isso não sustenta uma reescrita (paywall, página vazia). */
export const MIN_ARTICLE_TEXT_CHARS = 400

/** Vários portais bloqueiam user agents desconhecidos. */
export const FETCH_USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
