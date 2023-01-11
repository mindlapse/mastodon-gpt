import { RemoteClient } from 'lambda-remote-context';
import * as Mastodon from 'tsl-mastodon-api';
export default class MastodonClient extends RemoteClient {
    userId;
    /**
     * Construct a new user-specific Mastodon Client
     *
     * @param config
     * accessToken and apiUrl
     */
    constructor(config) {
        super({
            init: async () => {
                return new Mastodon.API({
                    access_token: config.accessToken,
                    api_url: config.apiUrl,
                });
            },
            cleanUp: async () => { },
        });
        this.userId = config.userId;
    }
    /**
     * Load mentions for this user.
     *
     * @returns Promise<API.Success<Array<JSON.Notification>>>;
     */
    async getMentions() {
        return await this.getClient().getNotifications(['mention']);
    }
    /**
     * Delete a mention from this user.
     *
     * @param id
     */
    async deleteMention(id) {
        await this.getClient().deleteNotification(id);
    }
    /**
     * Fetch a toot
     *
     * @param id
     * @throws Error if the toot could not be loaded.
     * @returns Promise<Mastodon.JSON.Status>
     */
    async getToot(id) {
        const toot = await this.getClient().getStatus(id);
        if (toot.failed) {
            const err = `Failed to load toot ${id}`;
            console.error(err, toot);
            throw new Error(err);
        }
        return toot.json;
    }
    /**
     * Post a reply
     *
     * @param replyToId Id of the message to reply to
     * @param content The content of the post
     */
    async postReply(replyToId, content) {
        await this.getClient().postStatus({
            status: content,
            in_reply_to_id: replyToId,
        });
    }
    /**
     * Get the current user ID
     */
    getUserId() {
        return this.userId;
    }
}
