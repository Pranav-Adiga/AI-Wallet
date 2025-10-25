# AI Agent Wallet

Author: Pranav-Adiga

This repository contains a minimal implementation of an autonomous **AI Agent Wallet**:
- `AgentWallet.sol` smart contract (meta-tx based wallet with whitelist and daily limit)
- Relayer (Node.js) that accepts signed intents and calls `execute(...)`
- Agent (Node.js) that signs intents and posts to relayer
- Optional Python backend demo logic

## Quickstart (Sepolia + Alchemy)

1. Install dependencies (root + subfolders)
   ```bash
   npm install
   cd relayer && npm install
   cd ../agent && npm install
   ```

2. Create `.env` files from `.env.example` and fill values.
   - Use Alchemy RPC URL like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY`
   - Provide private keys only for testnets (never commit them)

3. Compile & deploy contract
   ```bash
   npx hardhat compile
   # set HARDHAT_DEPLOYER_PRIVATE_KEY in env if you want to deploy via script
   node scripts/deploy.js
   ```

4. Start relayer
   ```bash
   cd relayer
   npm start
   ```

5. Run agent to create & submit a signed intent
   ```bash
   cd agent
   npm start
   ```

## Notes
- This project is for demo/hackathon purposes. Do not use real funds / mainnet without audits.
- Keep `.env` out of git. Use `.env.example` as template.
- For production, consider ERC-4337, paymaster integrations, and MPC for key safety.

## License
MIT
