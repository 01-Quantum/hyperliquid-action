import { signL1Action } from "@nktkas/hyperliquid/signing";
import { Wallet } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const nonce = 123;
const action = {
    "type": "cancel", "cancels":[]
}
const eth_account = new Wallet(process.env.PRIVATE_KEY);
const signature = await signL1Action({ wallet: eth_account, action, nonce, isTestnet: true });

const payload = {
    "action": action,
    "nonce": nonce,
    "signature": signature,
    "vaultAddress": null,
}
console.log(payload);
