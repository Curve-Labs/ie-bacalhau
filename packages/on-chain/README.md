# Impact Evaluator Contracts

This project contains all contracts that are required for executing an airdrop via Zodiac Reality and the tasks that facilitate contract interactions. Processes that can be done through this package involve deploying & configuring a Zodiac reality module (`/tasks/reality`) and deploying and configuring a Shrine contract (`tasks/shrine`).

## Background

When an round of rewards has been specified through an Impact Evaluator Function, the rewards need to be brought onchain. This happens in form of an Airdrop through the Shrine contract. The Shrine contract uses merkle proofs for gas-efficient token distributions. To minimize trust assumptions a Zodiac Reality module is used to initiate the Airdrop. Essentially, Zodiac Reality allows anyone to make a transaction on behalf of a Safe, if some real world state is true. To determine what the state of the real world is, an economic escalation game is put in place that incentivices participant to truthfully report the state of the world on the blockchain. In our case this means that a proposed airdrop corresponds to a legitimate rewards allocation based on a verfiable round of Impact Evalutation.

## Instructions

The instructions section consists of two parts: the first part describes how a new Zodiac Reality & Shrine system can be set up for a DAO (this is something that happens _per_ DAO). The second part describes how a user can propose and execute an airdrop through Zodiac Reality.

### 1. Setup the contracts

1. Fill in your `SEEDPHRASE` in `.env` in the directory of this package as well as your `INFURA_KEY` and your `ETHERSCAN_API_KEY`

2. create a gnosis safe: https://app.safe.global/

   => there is a test gnosis safe deployed on goerli at 0xa192aBe4667FC4d11e46385902309cd7421997ed

3. register reality eth template with reality eth oracle (only needs to happen once and if the template doesn't exist yet):

   npx hardhat --network <network_name> reality:createDaoTemplate --oracle <reality_address>

   - for goerli this has been done already and the `templateId` is `0x000000000000000000000000000000000000000000000000000000000000009e`; can be reused
   - if you want to set up the Impact Evaluator for another network you need to register the template with the respective oracle on that network
   - the addresses of deployed reality oracles can be checked here: https://github.com/RealityETH/reality-eth-monorepo/tree/main/packages/contracts/chains/deployments

4. deploy a reality module:

   npx hardhat --network <network_name> reality:setup --owner <safe_address> --avatar <safe_address> --target <safe_address> --oracle <reality_address> --template <id_from_step_1> --timeout <timeout_in_seconds> --cooldown <cooldown_in_seconds> --expiration <expiration_in_seconds> --bond <minimum_bond> --proxied false --iserc20 false

   verify on etherscan:

   npx hardhat --network <network_name> reality:verifyEtherscan --module <address_of_module_from_prev_step> --owner <safe_address> --avatar <safe_address> --target <safe_address> --oracle <reality_address> --template <id_from_step_1> --timeout <timeout_in_seconds> --cooldown <cooldown_in_seconds> --expiration <expiration_in_seconds> --bond <minimum_bond> --proxied false --iserc20 false

5. enable the newly deployed Zodiac Reality module from previous step on the safe

6. deploy & setup a shrine contract:

   npx hardhat --network <network_name> shrine:setup --avatar <safe_address>

### 2. As a user proposing an airdrop

1. propose a new airdrop:

   npx hardhat --network <network_name> reality:propose --module <address_of_reality_module> --shrine <address_of_shrine> --ipfs <ipfs_hash_pointing_to_MERKLE_TREE_specification_from_IEF> --token <token_address_of_reward_erc20_token> --root <merkle_root> --amount <total_amount_of_token_to_be_dropped> --id <ipfs_hash_pointing_to_output_from_IEF>

   **note the questionId that is printed on the console, it is required as an input later on**

2. answer the oracle question (Q: should this airdrop from prv step be executed? -> A: yes it should be answered)

   npx hardhat --network <network_name> reality:answer --module <address_of_reality_module> --question <questionId_from_prev_step> --bond <bonded_ETH_amount_larger_than_zero>

3. executing the proposal

   npx hardhat --network <network_name> reality:execute --module <address_of_reality_module> --shrine <address_of_shrine> --ipfs <ipfs_hash_pointing_to_MERKLE_TREE_specification_from_IEF> --token <token_address_of_reward_erc20_token> --root <merkle_root> --amount <total_amount_of_token_to_be_dropped> --id <ipfs_hash_pointing_to_output_from_IEF>
