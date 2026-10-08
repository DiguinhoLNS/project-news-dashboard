import { lookup } from 'node:dns/promises'
import { BlockList } from 'node:net'
import {
    BlockedUrlError,
    SourceUnavailableError,
} from '../exceptions/extraction.exception.js'

/**
 * Faixas que não são internet pública. Sem este bloqueio, a API poderia ser
 * usada para acessar serviços internos (SSRF), como o WordPress ou o banco
 * na rede do Docker. Endereços IPv4 mapeados em IPv6 (::ffff:10.0.0.1)
 * caem nas regras IPv4 automaticamente.
 */
const PRIVATE_RANGES = new BlockList()
PRIVATE_RANGES.addSubnet('0.0.0.0', 8)
PRIVATE_RANGES.addSubnet('10.0.0.0', 8)
PRIVATE_RANGES.addSubnet('100.64.0.0', 10)
PRIVATE_RANGES.addSubnet('127.0.0.0', 8)
PRIVATE_RANGES.addSubnet('169.254.0.0', 16)
PRIVATE_RANGES.addSubnet('172.16.0.0', 12)
PRIVATE_RANGES.addSubnet('192.168.0.0', 16)
PRIVATE_RANGES.addSubnet('224.0.0.0', 3)
PRIVATE_RANGES.addSubnet('::', 128, 'ipv6')
PRIVATE_RANGES.addSubnet('::1', 128, 'ipv6')
PRIVATE_RANGES.addSubnet('fc00::', 7, 'ipv6')
PRIVATE_RANGES.addSubnet('fe80::', 10, 'ipv6')
PRIVATE_RANGES.addSubnet('ff00::', 8, 'ipv6')

/** Garante que a URL é http(s) e que todos os IPs do host são públicos. */
export async function assertPublicUrl(url: URL): Promise<void> {
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new BlockedUrlError('só são aceitas URLs http ou https')
    }

    const hostname = url.hostname.replace(/^\[|\]$/g, '')
    let addresses: { address: string; family: number }[]
    try {
        addresses = await lookup(hostname, { all: true })
    } catch (error) {
        throw new SourceUnavailableError(
            `o domínio ${hostname} não foi encontrado`,
            { cause: error },
        )
    }

    const blocked = addresses.some(({ address, family }) =>
        PRIVATE_RANGES.check(address, family === 6 ? 'ipv6' : 'ipv4'),
    )
    if (blocked) {
        throw new BlockedUrlError(
            `o endereço ${hostname} não é público e não pode ser acessado`,
        )
    }
}
