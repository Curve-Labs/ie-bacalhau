# Impact Evaluator

## Description

## Table of Contents

- [Monorepo Architecture](#monorepo-architecture)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)

## Monorepo Architecture

This mono repo contains 5 packages that are used to create and deploy and use an Impact Evaluator.

```sh
project
├── packages
│   ├── bacalhau
│   │   ├── README.md
│   ├── datamodel
│   │   ├── README.md
│   ├── next
│   │   ├── README.md
│   ├── on-chain
│   │   ├── README.md
│   └── templates
│       └── hundredIE
│           ├── README.md
├── README.md
```

**Please Note:** Each package in this monorepo includes a dedicated `README.md` file which provides detailed instructions on how to interact with the code and the different steps involved.

The functions of the different packages can be summarized as follows:

### bacalhau

The [bacalhau package](./packages/bacalhau/) is used to create a parent Docker image for the Impact Evaluator. This parent image is linked to within the Impact Evaluator template repository.

### datamodel

The [datamodel package](./packages/datamodel/) is used to create and deploy the Ceramic data model to which DAO contributors store contribution metrics.

### next

The [next package](./packages/next/) contains all the code for the UI. The UI is built using the Next.js frontend framework. It includes all the necessary components and pages for the UI.

### on-chain

The [on-chain package](./packages/on-chain/)
contains all the Solidity contracts used for token distribution based on the output of the Impact Evaluator function. This includes the shrine.sol contract, the Zodiac RealityModule.sol contract, and other interfaces.

### templates

The [template package](./packages/templates/) contains a template for the final Impact Evaluator, however, it's recommended to fork the [template-impact-evaluator](https://github.com/Curve-Labs/template-impact-evaluator) repo to use it.

## Getting Started

Clone the repository

Using SSH

```
git clone git@github.com:Curve-Labs/ie-bacalhau.git
```

Using HTTPS

```
git clone https://github.com/Curve-Labs/ie-bacalhau.git
```

## Prerequisites

### Global

- NodeJS [(Install NodeJS)](https://nodejs.org/en/download/)
- Yarn [(Install Yarn)](https://classic.yarnpkg.com/en/docs/install)

### Package specific

For more information on what prerequisites are required for each package, please refer to the README.md file in the corresponding package.

## Installation

To install the dependencies for this project, please run the command yarn install in your terminal. This command will install all the necessary packages required to run the application.

```
yarn
```

## Usage

**For guidance on how to use the individual packages, please refer to the README.md file within each package.**

### Run any command from within root

```
yarn workspace <workspaceName> <commandName> ...
```

### List workplaces

```
yarn workspaces list
```

## Development

### Things to keep in mind

- When making code changes, it is important to consider the scope of the changes. Changes that are relevant to a specific workspace should be made within that workspace.
- If you want to add scripts, linting rules, or hooks that should apply to the entire repo, they should be added in the root directory.
- The `./package.json` file in the root directory manages the entire monorepo, whereas the `./packages/{WORKSPACE}/package.json` file manages only that specific workspace. Any changes made in this file will only affect that workspace.
- All dependencies are installed globally and there should not be any node_modules folder within the workspace directory.
- Linting rules and scripts should also be global, therefore added in the root directory.
- Environment variables are not shared across workspaces and are specific to each one.
- When importing files from different workspaces, be sure to use the proper path.
