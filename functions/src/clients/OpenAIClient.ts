import { RemoteClient } from 'lambda-remote-context'
import { Configuration, OpenAIApi } from 'openai'
import { OpenAIConfig } from '../config/OpenAIConfig.js'

export default class OpenAIClient extends RemoteClient<OpenAIApi> {
    private config: OpenAIConfig

    /**
     * Construct an OpenAI client
     */
    constructor(config: OpenAIConfig) {
        super({
            init: async () => {
                return new OpenAIApi(
                    new Configuration({
                        apiKey: config.api_key,
                    })
                )
            },
            cleanUp: async () => {},
        })
        this.config = config
    }

    /**
     * Get a completion to a prompt
     *
     * @param prompt
     * @returns The first received choice
     */
    async getCompletion(prompt: string): Promise<string | undefined> {
        const { model, best_of, max_tokens } = this.config
        const response = await this.getClient().createCompletion({
            model,
            best_of,
            max_tokens,
            prompt,
        })

        return response?.data?.choices?.[0]?.text?.trim()
    }

    /**
     * Check if a piece of text passes moderation from OpenAI.
     *
     * @param text The text to check
     * @returns true if the content is flagged
     */
    async isFlaggedByModeration(text: string): Promise<boolean> {
        const response = await this.getClient().createModeration({
            input: text,
        })
        return response?.data?.results?.[0]?.flagged ?? true
    }
}
