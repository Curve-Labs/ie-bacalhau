This repo is based on https://github.com/wk0/boilerplate-next

# How to test

**Important:**
In order to be eligible for an airdrop, you need to use the default hardhat seed in your metamask `test test test test test test test test test test test junk`

1. Install dependencies: `yarn`
2. Run app locally: `yarn next dev`
3. Run local network from hardhat directory `npx hardhat node`
4. Run tasks to setup contracts:
   a) First task: `npx hardhat --network localhost test:setup`
   b) Second task: `npx hardhat --network localhost test:v2 --shrine 0x5FbDB2315678afecb367f032d93F642f64180aa3 --token 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
5. In Metamask connect to localhost network (should be configured to have chainId 31337)
6. App:
   a) connect wallet w/ correct network
   b) enter shrine address into shrine input field
   c) enter token address into token input field
   d) press claim
