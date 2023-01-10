import Config from '../../config/Config.js'
import MastodonClient from '../../clients/MastodonClient.js'
import OpenAIClient from '../../clients/OpenAIClient.js'
import AIReplyCommand from './AIReplyCommand.js'

export default async (_: {}, config: Config) => {
    const { RemoteContext } = await import('lambda-remote-context')
    const remotes = new RemoteContext()
    try {
        const oc = new OpenAIClient(config.getOpenAIConfig())
        const mc = new MastodonClient(config.getMastodonClientConfig())

        // Initialize remote clients
        await remotes.addClient(oc).addClient(mc).initialize()

        // Reply to mentions
        await new AIReplyCommand(mc, oc).send()

    } finally {
        await remotes.cleanUp()
    }
}
