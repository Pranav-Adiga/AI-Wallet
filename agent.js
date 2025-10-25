require('dotenv').config();
const { ethers } = require('ethers');
const fetch = require('node-fetch');

const AGENT_PK = process.env.AGENT_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const RELAYER_URL = process.env.RELAYER_URL || 'http://localhost:3000/submit';
const AGENT_WALLET_ADDRESS = process.env.AGENT_WALLET_ADDRESS;

if (!AGENT_PK || !RPC_URL || !AGENT_WALLET_ADDRESS) {
  console.error('❌ Set AGENT_PRIVATE_KEY, RPC_URL, AGENT_WALLET_ADDRESS in .env');
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const agentWallet = new ethers.Wallet(AGENT_PK, provider);

const AGENT_WALLET_ABI = ["function nonce() view returns (uint256)"];

async function main() {
  const walletContract = new ethers.Contract(AGENT_WALLET_ADDRESS, AGENT_WALLET_ABI, provider);

  const to = process.env.TO_ADDRESS || "0x0000000000000000000000000000000000000000";
  const valueEth = process.env.VALUE_ETH || "0.001";
  const value = ethers.parseEther(valueEth).toString();
  const data = process.env.DATA || "0x";
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  const nonce = (await walletContract.nonce()).toString();

  const packed = ethers.solidityPackedKeccak256(
    ["address","uint256","address","uint256","bytes","uint256"],
    [AGENT_WALLET_ADDRESS, nonce, to, value, data, deadline]
  );

  const signature = await agentWallet.signMessage(ethers.getBytes(packed));

  const payload = { walletAddress: AGENT_WALLET_ADDRESS, to, value, data, deadline, signature };

  console.log("📤 Sending intent to relayer:", payload);

  const resp = await fetch(RELAYER_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });

  console.log("✅ Relayer response:", await resp.json());
}

main().catch(console.error);
