import { signL1Action } from "@nktkas/hyperliquid/signing";
import { BrowserProvider } from "ethers";

const signBtn = document.getElementById('signBtn');
const actionInput = document.getElementById('action');
const nonceInput = document.getElementById('nonce');
const nonceBtn = document.getElementById('nonceBtn');
const resultDiv = document.getElementById('result');
const accountDisplay = document.getElementById('accountDisplay');

let provider;
let signer;

nonceBtn.addEventListener('click', () => {
    nonceInput.value = Date.now();
});

async function updateAccount() {
    if (!window.ethereum) return;
    
    provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);
    
    if (accounts.length > 0) {
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        accountDisplay.textContent = `Account: ${address}`;
        signBtn.textContent = 'Sign Action';
    } else {
        signer = null;
        accountDisplay.textContent = 'Account: Not connected';
        signBtn.textContent = 'Connect MetaMask & Sign';
    }
}

// Listen for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Account changed:', accounts);
        updateAccount();
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

// Initial check
updateAccount();

signBtn.addEventListener('click', async () => {
    try {
        resultDiv.textContent = 'Connecting...';
        resultDiv.className = '';

        if (!window.ethereum) {
            throw new Error('MetaMask is not installed!');
        }

        provider = new BrowserProvider(window.ethereum);
        
        // Request/Connect account
        const accounts = await provider.send("eth_requestAccounts", []);
        await updateAccount();

        // Hyperliquid requires chainId 1337 for signing.
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 1337) {
            resultDiv.textContent = 'Switching network to Chain ID 1337...';
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x539' }], // 1337 in hex
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x539',
                            chainName: 'Hyperliquid Core Signing',
                            nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
                            rpcUrls: ['https://api.hyperliquid-testnet.xyz/evm'], 
                        }],
                    });
                } else {
                    throw switchError;
                }
            }
            // After switching, refresh provider and signer
            provider = new BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
        }
        
        const action = JSON.parse(actionInput.value);
        const nonce = parseInt(nonceInput.value);

        resultDiv.textContent = 'Signing...';

        const signature = await signL1Action({ 
            wallet: signer, 
            action, 
            nonce, 
            isTestnet: true 
        });

        const finalPayload = {
            action,
            nonce,
            signature
        };

        resultDiv.textContent = JSON.stringify(finalPayload, null, 2);
    } catch (error) {
        console.error(error);
        resultDiv.textContent = `Error: ${error.message}`;
        resultDiv.className = 'error';
    }
});
