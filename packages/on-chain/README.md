# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

# Instructions

Test Gnosis Safe on Goerli: 0xa192aBe4667FC4d11e46385902309cd7421997ed
TemplateId for the Impact Evaluator Proposal on Goerli is: `0x000000000000000000000000000000000000000000000000000000000000009e`

## Setup

1. Fill in your `SEEDPHRASE` in `.env` in the root directory as well as your `INFURA_KEY` and your `ETHERSCAN_API_KEY`

2. create a gnosis safe: https://app.safe.global/

3. register reality eth template with reality eth oracle (only needs to happen once!):

   npx hardhat --network <network_name> reality:createDaoTemplate --oracle <reality_address>

   - for goerli this has been done already and the `templateId` is `0x000000000000000000000000000000000000000000000000000000000000009e`; can be reused
   - if you want to set up the Impact Evaluator for another network you need to register the template with the respective oracle on that network
   - the addresses of deployed reality oracles can be checked here: https://github.com/RealityETH/reality-eth-monorepo/tree/main/packages/contracts/chains/deployments

4. deploy a reality module:

   npx hardhat --network <network_name> reality:setup --owner <safe_address> --avatar <safe_address> --target <safe_address> --oracle <reality_address> --template <id_from_step_1> --timeout <timeout_in_seconds> --cooldown <cooldown_in_seconds> --expiration <expiration_in_seconds> --bond <minimum_bond> --proxied false --iserc20 false

   verify on etherscan:

   npx hardhat --network <network_name> reality:verifyEtherscan --module <address_of_module_from_prev_step> --owner <safe_address> --avatar <safe_address> --target <safe_address> --oracle <reality_address> --template <id_from_step_1> --timeout <timeout_in_seconds> --cooldown <cooldown_in_seconds> --expiration <expiration_in_seconds> --bond <minimum_bond> --proxied false --iserc20 false

5. enable the newly deployed Zodiac Reality module from previous step on the safe (`enableModule`)

6. deploy & configure a shrine contract:

   npx hardhat --network <network_name> shrine:setup --avatar <safe_address>

## As a user proposing an airdrop

1. propose a new airdrop:

   npx hardhat --network <network_name> reality:propose --module <address_of_reality_module> --shrine <address_of_shrine> --ipfs <ipfs_hash_pointing_to_airdrop_specification_from_IEF> --token <token_address_of_reward_erc20_token> --root <merkle_root> --amount <total_amount_of_token_to_be_dropped> --id <ipfs_hash_pointing_to_airdrop_specification_from_IEF>

   **note the questionId that is printed on the console, it is required as an input later on**

2. answer the oracle question (Q: should this airdrop from prv step be executed? -> A: yes it should be answered)

   npx hardhat --network <network_name> reality:answer --module <address_of_reality_module> --question <questionId_from_prev_step> --bond <bonded_ETH_amount_larger_than_zero>

3. executing the proposal

   npx hardhat --network <network_name> reality:execute --module <address_of_reality_module> --shrine <address_of_shrine> --ipfs <ipfs_hash_pointing_to_airdrop_specification_from_IEF> --token <token_address_of_reward_erc20_token> --root <merkle_root> --amount <total_amount_of_token_to_be_dropped> --id <ipfs_hash_pointing_to_airdrop_specification_from_IEF>
