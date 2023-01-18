# Impact Evaluator Contracts

## Description

This project includes all contracts necessary for conducting an airdrop through Zodiac Reality, as well as tasks to facilitate contract interactions. The package can be used to deploy and configure a Zodiac reality module (found in `/tasks/reality`) and a Shrine contract (found in `tasks/shrine`).

## Table of Contents

- [Background](#background)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Setup Zodiac Reality and Shrine](#setup-zodiac-reality-and-shrine)
  - [Propose and Execute Airdrop](#propose-and-execute-airdrop)

## Background

When an round of rewards has been specified through an Impact Evaluator Function, the rewards need to be brought onchain. This happens in form of an Airdrop through the Shrine contract. The Shrine contract uses merkle proofs for gas-efficient token distributions. To minimize trust assumptions a Zodiac Reality module is used to initiate the Airdrop. Essentially, Zodiac Reality allows anyone to make a transaction on behalf of a Safe, if some real world state is true. To determine what the state of the real world is, an economic escalation game is put in place that incentivices participant to truthfully report the state of the world on the blockchain. In our case this means that a proposed airdrop corresponds to a legitimate rewards allocation based on a verfiable round of Impact Evalutation.

## Prerequisites

- Create a gnosis safe: https://app.safe.global/
  - => there is a test gnosis safe deployed on goerli at 0xa192aBe4667FC4d11e46385902309cd7421997ed

## Getting Started

### Rename the .env.example file

Rename the `.env.example` file in this package to `.env`. This file will contain the environment variable needed for deployment.

### Set your environment variables

Fill in your `SEEDPHRASE` in `.env` in the directory of this package as well as your `INFURA_KEY` and your `ETHERSCAN_API_KEY`

```sh
SEEDPHRASE=test test ....
INFURA_KEY=f37233fffc...
ETHERSCAN_API_KEY=MMP6J72...
```

## Usage

The usage section consists of two parts: the **first part** describes how a new Zodiac Reality & Shrine system can be set up for a DAO (this is something that happens per DAO). The **second part** describes how a user can propose and execute an airdrop through Zodiac Reality.

### Setup Zodiac Reality and Shrine

This section explains the process for setting up a new Zodiac Reality and Shrine system for a DAO. **Please Note:** this should be done for each individual DAO.

**1. Register Reality ETH Template**

Register the reality ETH template with the reality ETH oracle. This step is **only necessary** for the networks where this hasn't already been done.

```sh
npx hardhat --network <network_name> reality:createDaoTemplate --oracle <reality_address>
```

For the Goerli network this has already been done. The `templateId` can be reused at:

- `0x000000000000000000000000000000000000000000000000000000000000009e`

**Note:** If you wish to use the Impact Evaluator on a different network, you must register the template with the corresponding oracle on that network. The addresses of deployed RealityETH oracles can be found on the [RealityETH Github repository](https://github.com/RealityETH/reality-eth-monorepo/tree/main/packages/contracts/chains/deployments).

**2. Deploy a Reality Module**

To deploy a reality module, execute the following commands and ensure that the placeholders are filled in with the appropriate informat

```sh
npx hardhat --network <network_name> reality:setup --owner <safe_address> --avatar <safe_address> --target <safe_address> --oracle <reality_address> --template <id_from_step_1> --timeout <timeout_in_seconds> --cooldown <cooldown_in_seconds> --expiration <expiration_in_seconds> --bond <minimum_bond> --proxied false --iserc20 false
```

To verify on etherscan:

```sh
npx hardhat --network <network_name> reality:verifyEtherscan --module <address_of_module_from_prev_step> --owner <safe_address> --avatar <safe_address> --target <safe_address> --oracle <reality_address> --template <id_from_step_1> --timeout <timeout_in_seconds> --cooldown <cooldown_in_seconds> --expiration <expiration_in_seconds> --bond <minimum_bond> --proxied false --iserc20 false
```

**3. Enable Zodiac Reality Module**

Enable the newly deployed Zodiac Reality module from previous step on the safe

**4. Deploy and Setup Shrine**

To deploy and setup the Shrine contract, execute the following command:

```sh
npx hardhat --network <network_name> shrine:setup --avatar <safe_address>
```

### Propose and Execute Airdrop

The second part details the steps for a user to propose and carry out an airdrop using Zodiac Reality.

**1. Propose Airdrop**

To propose an airdrop, execute the following command:

```sh
npx hardhat --network <network_name> reality:propose --module <address_of_reality_module> --shrine <address_of_shrine> --ipfs <ipfs_hash_pointing_to_MERKLE_TREE_specification_from_IEF> --token <token_address_of_reward_erc20_token> --root <merkle_root> --amount <total_amount_of_token_to_be_dropped> --id <ipfs_hash_pointing_to_output_from_IEF>
```

**Please make note of the questionId displayed on the console as it will be needed as input later on.**

**2. Oracle Question**

Please respond to the oracle question with "Yes, it should be executed" (The question asked is "should this airdrop from the previous step be executed?")

```sh
npx hardhat --network <network_name> reality:answer --module <address_of_reality_module> --question <questionId_from_prev_step> --bond <bonded_ETH_amount_larger_than_zero>
```

**3. Execute Proposal**

To execute the proposal run the following command:

```sh
npx hardhat --network <network_name> reality:execute --module <address_of_reality_module> --shrine <address_of_shrine> --ipfs <ipfs_hash_pointing_to_MERKLE_TREE_specification_from_IEF> --token <token_address_of_reward_erc20_token> --root <merkle_root> --amount <total_amount_of_token_to_be_dropped> --id <ipfs_hash_pointing_to_output_from_IEF>
```
