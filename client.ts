import { CloudSDK } from "./sdk.ts";

const sdk = new CloudSDK();
console.log(await sdk.discoverResources());
