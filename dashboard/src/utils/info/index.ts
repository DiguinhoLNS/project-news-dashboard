import env from '@/env'

function log(initiator: string, message: unknown) {
    if (!env.PRODUCTION) console.log(`LOG ${initiator} -`, message)
}

function dataLog(initiator: string, message: unknown) {
    if (!env.PRODUCTION) console.log(`DATA ${initiator} -`, message)
}

function warnLog(initiator: string, message: unknown) {
    if (!env.PRODUCTION) console.warn(`WARN ${initiator} -`, message)
}

function errorLog(initiator: string, message: unknown) {
    if (!env.PRODUCTION) console.log(`ERROR ${initiator} -`, message)
}

const info = {
    log,
    data: dataLog,
    warn: warnLog,
    error: errorLog
}

export default info
