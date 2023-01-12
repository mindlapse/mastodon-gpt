import { Status } from "tsl-mastodon-api/lib/JSON";
import { extractText } from "../../lib/util/html.js";

export default class ThreadContext {

    private toots: Status[];
    private totalChars: number = 0;
    private maxChars: number;

    constructor(maxChars: number) {
        this.toots = [];
        this.maxChars = maxChars;
    }

    /**
     * Add a toot to the ThreadContext.
     * @param toot 
     * @returns False iff no more room is available.
     */
    add(toot: Status): boolean {
        const entryChars = this.getConvoEntry(toot).length;

        if (entryChars + this.totalChars < this.maxChars) {
            this.totalChars += entryChars;
            this.toots.unshift(toot);
            return true;
        }
        return false;
    }

    hasUserId(userId: string): boolean {
        return this.toots.
            map(toot => toot.account.id).
            filter((id) => id === userId).length > 0;
    }

    asConversation(): string {
        let wrapper = { convo : "" }
        this.toots.forEach(toot => wrapper.convo += this.getConvoEntry(toot))
        return wrapper.convo;
    }

    private getConvoEntry(toot: Status) {
        return `${toot.account.acct}: "${extractText(toot.content)}"\n\n`
    }
}

export interface TootInfo {
    acct: string
    content: string
}