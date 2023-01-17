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
npx hardhat --network localhost test:v2 --shrine
```

This command will deploy the contracts to your local node, and you'll be able to interact with them through the user interface.

## Configuring Metamask Wallet

To test the user experience of the app, you'll need to configure your Metamask wallet to connect to the local host network. To do this, open Metamask and click on the network dropdown. Select "Custom RPC" and enter http://localhost:8545/ as the new RPC URL.
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

Write a description for a Readme file github repo. Inside the repo is the code for a UI which purpose three fold and spread out across three pages. The pages are as following:

1. A page that is used by DAO contributors to claim their reward. The reward is based on contributions they have made and submitted to the specific dao contribution model on Ceramic
2. A page to add contributions to a DAO, by submitting contribution metric for a given DAO. This page also can be used by the contributor to retrieve a list with past contributions.
3. A page that is used by the admin to create the input for the Impact Evaluator. This pages takes the `daoId` and `contriubtionId`, as well as a list of trusted addresses as input and filters through all contributions to match the input. It then pins the the retrieved contribution data, and the list of trusted addresses to IPFS, to be referenced as input for the Impact Evaluator.

- Run the app locally with the command `yarn next dev`
- A step describing that a hardhat node is needed to deploy the test contract agains. This is done by going to the package ./packages/on-chain/ and running the command `npx hardhat node`
- In a new terminal window, from within the on-chain package run two commands to setup the contracts for testing:

1. `npx hardhat --network localhost test:setup`
2. `npx hardhat --network localhost test:v2 --shrine 0x5FbDB2315678afecb367f032d93F642f64180aa3 --token 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
