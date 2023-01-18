# Impact Evaluator UI

# Description

This package contains the code for a basic test user interface (UI) for the Impact Evaluator that serves three main purposes, spread out across three pages.

## Page 1: Claim Rewards

A page that is used by DAO contributors to claim their rewards based on contributions they have made and submitted to the DAO contribution model on Ceramic.

## Page 2: Add & View Contributions

A page that allows contributors to add and view past contributions to a DAO. Contributions are added by submitting contribution metrics for a given contribution ID and DAO ID.

## Page 3: Create Input for Impact Evaluator

A page that is used by the admin to create the input for the Impact Evaluator. This page takes the DAO ID and contribution ID, as well as a list of trusted addresses as input, filters through all contributions to match the input, and then pins the retrieved contribution data and the list of trusted addresses to IPFS to be referenced as input for the Impact Evaluator.

# Installation

To install the dependencies for this project, please run the command yarn install in your terminal. This command will install all the necessary packages required to run the application.

```
yarn
```

# Testing the UI Locally

To test the user interface locally, you will need to deploy the app and set up the contracts for testing, and configur Metamask to work with localhost. Follow these steps to set up the testing environment:

## Deploying the App Locally

To deploy the app locally, you'll need to run the command:

```
yarn next dev
```

in your terminal. This command will start the development server and you can see the application running on http://localhost:3000/ in your browser.

## Run a Hardhat Node

To test the contracts, you'll need to run a local Hardhat node. You can do this by opening a new terminal and going into the directory `./packages/on-chain/` to run the command:

```
yarn run compile && yarn run local:network
```

This command will compile the contracts and start the Hardhat node.

## Setup Contracts for Testing

To set up the contracts for testing, you'll need to deploy them to your local Hardhat node. You can do this by opening a new terminal and going into the directory `./packages/on-chain/` to run these two commands one after each other:

```
npx hardhat --network localhost test:setup

npx hardhat --network localhost test:v2 --shrine 0x5FbDB2315678afecb367f032d93F642f64180aa3 --token 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

This command will deploy the contracts to your local node, and you'll be able to interact with them through the user interface.

## Configuring Metamask Wallet

To test the user experience of the app, you'll need to configure your Metamask wallet to connect to the local host network. To do this,

- Create a new profile in Chrome and open the Metamask plugin.
- **Important:** in order to be elgible for an airdrop in this test setup you need to mport the test seed phrase `test test test test test test test test test test test junk`.
- Under Networks click "Show/hide test networks".
- Open Metamask Settings, Networks, and select "Localhost 8545".
- Set the chainId to 31337.
- Select Localhost 8545 network.
  Please note that when running a Localhost node, you may receive the error "Nonce too high. Expected nonce to be 1 but got N. Note that transactions can't be queued when automining." As a fix, go to Settings, Advanced, and click Reset Account.

# Testing the User Interface

To test the user interface of the app, you can now interact with the different functionalities.

## Claim rewards

To claim rewards:

1. connect wallet with correct network
2. enter shrine address into shrine input field
3. enter token address into token input field
4. press claim

## Add Contributions

To add contributions metrics to the model:

1. connect wallet with correct network
2. navigate to contribute page
3. fill in DAO ID
4. fill in contribution metric and contribution ID
5. add contribution to the model

## Create Impact Evaluator Input

To get the Impact Evaluator input:

1. connect wallet with correct network
2. navigate to Airdrop page
3. fill in DAO ID and Contribution ID
4. fill in trusted addresses
5. upload the contribution metric to IPFS
6. copy IPFS HASH for Impact Evaluator input
