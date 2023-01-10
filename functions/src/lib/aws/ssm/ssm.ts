import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'

const client = new SSMClient({})

/*
    Fetch a secret from AWS Parameter Store and decode with JSON.parse
*/
export const getJsonSecret = async (key: string) => {
    const keyPath = createKeyPath(key)

    const secret = await client
        .send(
            new GetParameterCommand({
                Name: keyPath,
                WithDecryption: true,
            })
        )
        .then((output) => output.Parameter?.Value)

    console.log(
        `ssm:getSecret(): Loaded ${keyPath}.  Secret length: ${secret?.length}`
    )
    return secret ? JSON.parse(secret) : undefined
}

/*
    Returns a path scoped to the current product & environment: /<env.PRODUCT>/<env.ENV>/<key>
*/
export const createKeyPath = (key: string) => {
    return `/${process.env.PRODUCT}/${process.env.ENV}/${key}`
}