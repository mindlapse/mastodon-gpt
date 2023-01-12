import { extractText } from '../../lib/util/html.js';
var NextAction;
(function (NextAction) {
    NextAction[NextAction["DELETE_MENTION"] = 0] = "DELETE_MENTION";
    NextAction[NextAction["RETRY"] = 1] = "RETRY";
    NextAction[NextAction["CONTINUE"] = 2] = "CONTINUE";
})(NextAction || (NextAction = {}));
export default class AIReplyCommand {
    mastodon;
    openai;
    maxRetries;
    maxLength;
    constructor(mc, oc) {
        this.mastodon = mc;
        this.openai = oc;
        this.maxRetries = 2;
        this.maxLength = 500;
    }
    createCompletionRequest(mentionText, originalText, shorten) {
        let prefix;
        if (originalText) {
            prefix =
                `Here is a tweet: '${originalText}'. ` +
                    `Here is the reply: '${mentionText}'. `;
        }
        else {
            prefix = `Here is a tweet: '${mentionText}'. `;
        }
        return prefix + 'As @gpt, think carefully and respond with an ' +
            'engaging detailed genius response that adds dimensionality. ' +
            "Do not refer to 'us' or 'we' or '@gpt'. Do not put your answer in quotes. " +
            `Answer must be <= ${shorten ? 60 : 80} words. Do not reference to your own response ` +
            'and do not mention the tweet above.\n\n';
    }
    async send() {
        const mentions = await this.mastodon.getMentions();
        console.log(`Loaded ${mentions?.json?.length ?? 0} mentions`);
        for (let mentionToot of mentions.json) {
            let retries = 0, nextAction;
            do {
                nextAction = await this.handleMention(mentionToot, retries > 0);
                switch (nextAction) {
                    case NextAction.DELETE_MENTION:
                        await this.mastodon.deleteMention(mentionToot.id);
                        break;
                    case NextAction.RETRY:
                        retries++;
                        break;
                }
            } while (nextAction === NextAction.RETRY && retries <= this.maxRetries);
        }
    }
    async handleMention(mentionToot, isRetry) {
        let originalToot, originalText;
        // Extract text content from the mention
        const mentionText = extractText(mentionToot.status.content);
        // Load original (if present)
        const { in_reply_to_id } = mentionToot.status;
        if (in_reply_to_id) {
            originalToot = await this.mastodon.getToot(in_reply_to_id);
            originalText = extractText(originalToot.content);
            // If the original post was from this bot, then only reply if
            // the mention included a question mark in it. (less annoying)
            if (originalToot.account.id === this.mastodon.getUserId() &&
                !originalText.includes("?")) {
                console.log("Ignoring follow-up mention: a '?' must be present to respond.");
                return NextAction.DELETE_MENTION;
            }
        }
        // Perform content moderation
        const flagged = await this.openai.isFlaggedByModeration(`${originalText} ${mentionText}`);
        if (flagged) {
            console.log('Content flagged. Skip.');
            return NextAction.DELETE_MENTION;
        }
        // Moderation passed, form the completion request
        const completionRequest = this.createCompletionRequest(mentionText, originalText, isRetry);
        console.log('Completion request', completionRequest);
        // Fetch completion from OpenAI
        const reply = await this.openai.getCompletion(completionRequest);
        console.log('Completion reply', reply);
        // Delete the mention from Mastodon
        if (!isRetry) {
            await this.mastodon.deleteMention(mentionToot.id);
        }
        // Post the reply to Mastodon
        if (reply) {
            if (reply.length > this.maxLength) {
                console.log("Too long, retrying");
                return NextAction.RETRY;
            }
            try {
                await this.mastodon.postReply(mentionToot.status.id, reply);
                console.log("Reply posted");
            }
            catch (e) {
                console.error('Error', e);
                return NextAction.RETRY;
            }
        }
        return NextAction.CONTINUE;
    }
}
