export default function objToParams(obj: Record<string, unknown>) {
    const params = new URLSearchParams()

    for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
            const value = obj[key]
            if (value !== undefined && value !== null) {
                params.append(key, String(value))
            }
        }
    }

    return params.toString()
}
