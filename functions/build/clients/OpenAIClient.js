import { RemoteClient } from 'lambda-remote-context';
import { Configuration, OpenAIApi } from 'openai';
export default class OpenAIClient extends RemoteClient {
    config;
    /**
     * Construct an OpenAI client
     */
    constructor(config) {
        super({
            init: async () => {
                return new OpenAIApi(new Configuration({
                    apiKey: config.api_key,
                }));
            },
            cleanUp: async () => { },
        });
        this.config = config;
    }
    /**
     * Get a completion to a prompt
     *
     * @param prompt
     * @returns The first received choice
     */
    async getCompletion(prompt) {
        const { model, best_of, max_tokens } = this.config;
        const response = await this.getClient().createCompletion({
            model,
            best_of,
            max_tokens,
            prompt,
        });
        return response?.data?.choices?.[0]?.text?.trim();
    }
    /**
     * Check if a piece of text passes moderation from OpenAI.
     *
     * @param text The text to check
     * @returns true if the content is flagged
     */
    async isFlaggedByModeration(text) {
        const response = await this.getClient().createModeration({
            input: text,
        });
        return response?.data?.results?.[0]?.flagged ?? true;
    }
}
