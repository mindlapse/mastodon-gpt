import { getJsonSecret } from '../lib/aws/ssm/ssm.js'
import { MastodonClientConfig } from './MastodonClientConfig.js'
import { DAVINCI_MODEL, OpenAIConfig } from './OpenAIConfig.js'

export type ConfigType = { [key: string]: string }

let config: Config

const KEY_MASTODON_API_URL = 'MASTODON_API_URL'
const KEY_MASTODON_ACCESS_TOKEN = 'MASTODON_ACCESS_TOKEN'
const KEY_OPEN_AI_API_KEY = 'OPEN_AI_API_KEY'

export default class Config {
    config: ConfigType

    private constructor(config?: any) {
        if (config) {
            this.config = config
        } else {
            throw new Error('Undefined config')
        }
    }

    getMastodonClientConfig(): MastodonClientConfig {
        return {
            apiUrl: this.config[KEY_MASTODON_API_URL],
            accessToken: this.config[KEY_MASTODON_ACCESS_TOKEN],
        }
    }

    getOpenAIConfig(): OpenAIConfig {
        return {
            api_key: this.config[KEY_OPEN_AI_API_KEY],
            model: DAVINCI_MODEL,
            best_of: 2,
            max_tokens: 200,
        }
    }

    static get = async () => {
        if (!config) {
            try {
                // fetches `/${env.PRODUCT}/${env.ENV}/config`
                config = new Config(await getJsonSecret('config'))
            } catch (e) {
                console.error('Error loading config', e)
                throw e
            }
        }
        return config
    }
}
