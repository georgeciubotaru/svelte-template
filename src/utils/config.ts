let config = {
    environment: process.env.VERCEL_ENV,
    apiUrl: process.env.VERCEL_API_URL,
    agoraAppId: process.env.VERCEL_AGORA_APP_ID
};

export let isDev: boolean = config.environment === "development";
// @ts-ignore
export let isClient: boolean = process.browser;

export default config;