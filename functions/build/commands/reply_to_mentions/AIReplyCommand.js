import { extractText } from '../../lib/util/html.js';
export default class AIReplyCommand {
    mastodon;
    openai;
    static SUFFIX = 'As @gpt, think carefully and respond with an ' +
        'engaging detailed genius response that adds dimensionality. ' +
        "Do not refer to 'us' or 'we' or '@gpt'. Do not put your answer in quotes. " +
        'The answer must be less than 350 chars. Do not reference to your own response ' +
        'and do not mention the tweet above.\n\n';
    constructor(mc, oc) {
        this.mastodon = mc;
        this.openai = oc;
    }
    async send() {
        const mentions = await this.mastodon.getMentions();
        console.log(`Loaded ${mentions?.json?.length ?? 0} mentions`);
        for (let mentionToot of mentions.json) {
            let originalToot, originalText;
            // Extract text content from the mention
            const mentionText = extractText(mentionToot.status.content);
            // Load original (if present)
            const { in_reply_to_id } = mentionToot.status;
            if (in_reply_to_id) {
                originalToot = await this.mastodon.getToot(in_reply_to_id);
                originalText = extractText(originalToot.json.content);
            }
            // Perform content moderation
            const flagged = await this.openai.isFlaggedByModeration(`${originalText} ${mentionText}`);
            if (flagged) {
                console.log('Content flagged. Skip.');
                continue;
            }
            // Moderation passed, form the completion request
            let prefix;
            if (originalToot) {
                prefix =
                    `Here is a tweet: '${originalText}'. ` +
                        `Here is the reply: '${mentionText}'. `;
            }
            else {
                prefix = `Here is a tweet: '${mentionText}'. `;
            }
            const completionRequest = prefix + AIReplyCommand.SUFFIX;
            console.log('Completion request', completionRequest);
            // Fetch completion from OpenAI
            const reply = await this.openai.getCompletion(completionRequest);
            console.log('Completion reply', reply);
            // Delete the mention from Mastodon
            await this.mastodon.deleteMention(mentionToot.id);
            // Post the reply to Mastodon
            if (reply) {
                try {
                    await this.mastodon.postReply(mentionToot.status.id, reply);
                }
                catch (e) {
                    console.error('Error', e);
                }
            }
        }
    }
}
