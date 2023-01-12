import { Status } from 'tsl-mastodon-api/lib/JSON/index.js'
import Notification from 'tsl-mastodon-api/lib/JSON/Notification.js'
import MastodonClient from '../../clients/MastodonClient.js'
import OpenAIClient from '../../clients/OpenAIClient.js'
import { extractText } from '../../lib/util/html.js'
import ThreadContext from './ThreadContext.js'

enum NextAction {
    DELETE_MENTION,
    RETRY,
    CONTINUE,
}

export default class AIReplyCommand {
    private mastodon: MastodonClient
    private openai: OpenAIClient
    private maxRetries: number
    private maxPostLength: number
    private maxThreadChars: number

    constructor(mc: MastodonClient, oc: OpenAIClient) {
        this.mastodon = mc
        this.openai = oc
        this.maxRetries = 2
        this.maxPostLength = 500
        this.maxThreadChars = 3072;
    }

    createCompletionRequest(conversation: string, length: number) {
        
        const prefix = `Here is a tweet conversation: <start>${conversation}<end>. `

        return `${prefix}As @gpt, think carefully and respond with an ` +
            'engaging detailed genius response that adds dimensionality. ' +
            "Do not refer to 'us' or 'we' or '@gpt'. Do not put your answer in quotes. " +
            `Answer must be <= ${length} words. Do not reference to your own response ` +
            'and do not mention the tweet above.\n\n';
    }


    async send() {
        const mentions = await this.mastodon.getMentions()
        console.log(`Loaded ${mentions?.json?.length ?? 0} mentions`)

        for (let mentionToot of mentions.json) {
            let retries = 0, nextAction;
            let maxLength = 60;
            do {
                nextAction = await this.handleMention(mentionToot, retries > 0, maxLength)

                switch (nextAction) {
                    case NextAction.DELETE_MENTION:
                        await this.mastodon.deleteMention(mentionToot.id)
                        break;
                    case NextAction.RETRY:
                        retries++;
                        break;
                }
                maxLength -= 20;
            } while (nextAction === NextAction.RETRY && retries <= this.maxRetries)
        }
    }

    async buildThreadContext(toot: Status, ctx?: ThreadContext): Promise<ThreadContext> {
        if (!ctx) ctx = new ThreadContext(this.maxThreadChars);
        let priorToot: Status;

        const roomStillAvailable = ctx.add(toot);
        const { in_reply_to_id } = toot
        if (in_reply_to_id) {
            priorToot = await this.mastodon.getToot(in_reply_to_id)
            return !roomStillAvailable ? ctx : this.buildThreadContext(priorToot, ctx)
        }
        return ctx;
    }

    async handleMention(mention: Notification, isRetry: boolean, maxLength: number) {

        // Extract text content from the mention
        const mentionText = extractText(mention.status.content)

        // Load the conversation into a thread context
        const threadContext = await this.buildThreadContext(mention.status)
        const conversation = threadContext.asConversation();
        console.log("Loaded conversation", conversation);

        // If the mention does not include a question, and GPT
        // is already in the thread, then ignore.
        if (threadContext.hasUserId(this.mastodon.getUserId()) &&
            !mentionText.includes("?")) {

            console.log("Ignoring follow-up mention: a '?' must be present to respond.")
            return NextAction.DELETE_MENTION
        }

        // Perform content moderation
        const flagged = await this.openai.isFlaggedByModeration(conversation);
        if (flagged) {
            console.log('Content flagged. Skip.')
            return NextAction.DELETE_MENTION
        }

        // Moderation passed, form the completion request
        const completionRequest = this.createCompletionRequest(conversation, maxLength);
        console.log('Completion request', completionRequest)

        // Fetch completion from OpenAI
        const reply = await this.openai.getCompletion(completionRequest)
        console.log('Completion reply', reply)

        // Delete the mention from Mastodon
        if (!isRetry) {
            await this.mastodon.deleteMention(mention.id)
        }

        // Post the reply to Mastodon
        if (reply) {
            if (reply.length > this.maxPostLength) {
                console.log("Too long, retrying")
                return NextAction.RETRY
            }
            try {
                await this.mastodon.postReply(mention.status.id, reply)
                console.log("Reply posted")
            } catch (e) {
                console.error('Error', e)
                return NextAction.RETRY
            }
        }
        return NextAction.CONTINUE;
    }
}
