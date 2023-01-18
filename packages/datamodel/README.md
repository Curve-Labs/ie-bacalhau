# datamodel

## Setting up a Private Key for a Ceramic session

In order to use a decentralized identifier (DID) to authenticate a Ceramic session, a private key needs to be stored in a `.env` file. This file should not be pushed to any public repository.

### Rename the .env.example file

Rename the `.env.example` file in the package to `.env`. This file will contain the private key (PK) environment variable for the DID.

### Set your Private Key

Set your private key in the `.env` file at the predifined variables like so:

```
PK=8f40d9de9...
```

## Ceramic Node

To connect to a Ceramic node, the `API_URL` of the node must be configured in the file located at `/lib/config/config.ts`. The `API_URL` for the 3Box node is set as the default, but a different endpoint can be used by modifying the `API_URL` value in the `config.ts` file.

## Deploying the Dao Contribution Model using yarn

To deploy the daoContribution model to Ceramics and export it in .JSON format, the following command must be executed

```
yarn run deploy:mode:daoContribution
```
