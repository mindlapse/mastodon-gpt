import { extractText } from "../../lib/util/html.js";
export default class ThreadContext {
    toots;
    totalChars = 0;
    maxChars;
    constructor(maxChars) {
        this.toots = [];
        this.maxChars = maxChars;
    }
    /**
     * Add a toot to the ThreadContext.
     * @param toot
     * @returns False iff no more room is available.
     */
    add(toot) {
        const entryChars = this.getConvoEntry(toot).length;
        if (entryChars + this.totalChars < this.maxChars) {
            this.totalChars += entryChars;
            this.toots.unshift(toot);
            return true;
        }
        return false;
    }
    hasUserId(userId) {
        return this.toots.
            map(toot => toot.account.id).
            filter((id) => id === userId).length > 0;
    }
    asConversation() {
        let wrapper = { convo: "" };
        this.toots.forEach(toot => wrapper.convo += this.getConvoEntry(toot));
        return wrapper.convo;
    }
    getConvoEntry(toot) {
        return `${toot.account.acct}: "${extractText(toot.content)}"\n\n`;
    }
}
