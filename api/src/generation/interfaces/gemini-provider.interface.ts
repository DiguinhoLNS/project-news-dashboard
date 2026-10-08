import type { GoogleGenAI } from '@google/genai'

export type GeminiModels = Pick<GoogleGenAI['models'], 'generateContent'>

export interface GeminiProviderOptions {
    model: string
    timeoutMs: number
}
