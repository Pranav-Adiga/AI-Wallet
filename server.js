require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');

const app = express();
app.use(bodyParser.json());

const RELAYER_PK = process.env.RELAYER_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

if (!RELAYER_PK || !RPC_URL) {
  console.error('❌ Set RELAYER_PRIVATE_KEY and RPC_URL in .env');
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const relayerWallet = new ethers.Wallet(RELAYER_PK, provider);

const AGENT_WALLET_ABI = [
  "function execute(address to,uint256 value,bytes calldata data,uint256 deadline,bytes calldata signature) external returns (bytes memory)"
];

app.post('/submit', async (req, res) => {
  try {
    const { walletAddress, to, value, data, deadline, signature } = req.body;
    if (!walletAddress || !to || !value || !deadline || !signature)
      return res.status(400).json({ error: 'missing required fields' });

    const walletContract = new ethers.Contract(walletAddress, AGENT_WALLET_ABI, relayerWallet);

    const tx = await walletContract.execute(
      to,
      ethers.parseUnits(value, "wei"),
      data || "0x",
      deadline,
      signature,
      { gasLimit: 500_000 }
    );

    console.log(`✅ Relayer submitted tx ${tx.hash}`);
    await tx.wait(1);
    res.json({ txHash: tx.hash });

  } catch (err) {
    console.error('❌ Relayer error', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Relayer running on http://localhost:${PORT}`));
