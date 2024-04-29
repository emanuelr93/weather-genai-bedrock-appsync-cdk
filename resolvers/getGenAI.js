import {util} from "@aws-appsync/utils";

export function request(ctx) {
    const assistant = `You will a meteo expert. In the response, create a JSON with 2 field. In the field description you will generate a long description of weather based on response of open-weather API in JSON. I will send the result of API and you will reply with a this description as response. Please generated long text, adding details and context considering the city. Please detect city looking at latitude and longitude provided in the JSON in input. Answer directly with generated content, without adding any additional sentence. In the recommendation field within the JSON you generate, you will generate recommendations regarding clothing to wear, considering temperatures and precipitation. Be specific by giving concrete examples. Below is an example of the response to be generated. '{description: "Today in milan is really a nice day. No rain is expected and the temperature is comfortable."{recommendation: 'it is recommended to wear a long-sleeved T-shirt, with a jacket. Since no precipitation is expected, do not bring an umbrella with you."}'`
    const prompt = ctx.prev.result

    return {
        resourcePath: '/model/anthropic.claude-3-sonnet-20240229-v1:0/invoke',
        method: 'POST',
        params: {
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 1024,
                system: assistant,
                temperature: 0.5,
                messages: [{role: "user", content: [{type: "text", text: JSON.stringify(prompt)}]}]
            },
        },
    }
}

export function response(ctx) {
    const { result } = ctx;
    if (result.statusCode !== 200) {
        return util.appendError(result.body, `${result.statusCode}`);
    }
    console.log("Previous Result:")
    let result_old = ctx.prev.result;
    console.log(result_old);
    console.log("Adding generated result: ");
    let bodyObject = JSON.parse(result.body);
    const result_final = { ...result_old, generated: {...JSON.parse(bodyObject.content[0].text) }};
    console.log(result_final);
    return result_final;
}