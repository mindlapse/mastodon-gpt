import Config from './config/Config.js';
export const handler = async function (event) {
    let config = await Config.get();
    if (event.Records) {
        for (const rec of event.Records) {
            let msg = rec;
            if (rec.body) {
                const body = JSON.parse(rec.body);
                msg = JSON.parse(body.Message);
            }
            await route(msg, config);
        }
    }
    else {
        await route(event, config);
    }
    return {
        statusCode: 200,
        body: '',
    };
};
const route = async (payload, config) => {
    let commandId = process.env.COMMAND;
    console.log(`Received ${commandId} command with payload`, payload);
    if (commandId) {
        const commandImpl = await import(`./commands/${commandId}/handler.js`);
        await commandImpl.default(payload, config);
    }
    else {
        throw Error(`unrecognized command ${commandId}`);
    }
};
