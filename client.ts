import { CloudSDK } from "https://deno-mcp-demo.deno.dev/sdk.ts";

const sdk = new CloudSDK();
console.log(await sdk.discoverResources());
