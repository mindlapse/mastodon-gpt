
export const DAVINCI_MODEL = 'text-davinci-003'

export type SupportedModel = typeof DAVINCI_MODEL; 

export interface OpenAIConfig {

    // API key from OpenAI
    api_key: string

    // Text completion settings
    model: SupportedModel
    best_of: number
    max_tokens: number
}