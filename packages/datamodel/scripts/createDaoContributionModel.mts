import { writeFile } from "node:fs/promises";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ModelManager } from "@glazed/devtools";
import { DID } from "dids";
import * as dotenv from "dotenv";
dotenv.config();

import { getDidInstanceFromPK } from "../lib/utils/didHelpers.js"; // Not able to add .ts extension. I think because compiler first translates imports from ts => js
import { API_URL } from "../lib/config/config.js";

// get DID session instance from private key
const did: DID = await getDidInstanceFromPK(process.env.PK);

// // connect to Ceramic node
const ceramic: any = new CeramicClient(API_URL);

// // set did instance on HTTP Ceramic client
ceramic.did = did;

// // create Model Manager instance
const manager: ModelManager = new ModelManager({ ceramic });

console.log("Creating schemas");
// // create schema for the "hours per week" contribution streams
//@ts-ignore
const contributionEntryID = await manager.createSchema("ContributionEntry", {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Contribution Entry",
  type: "object",
  properties: {
    contributionId: {
      type: "string",
      title: "",
    },
    daoId: {
      type: "string",
      title: "",
    },
    contributionMetric: {
      type: "string",
      title: "",
    },
  },
});

const contributionsRegistryID = await manager.createSchema(
  "ContributionRegistry",
  //@ts-ignore
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Contribution Registry",
    type: "object",
    properties: {
      contributionEntries: {
        type: "array",
        title: "contribution entries",
        items: {
          type: "object",
          title: "contribution entries",
          properties: {
            id: {
              $comment: `cip88:ref:${manager.getSchemaURL(
                contributionEntryID
              )}`,
              type: "string",
              pattern: "^ceramic://.+(\\?version=.+)?",
              maxLength: 150,
            },
            title: {
              type: "string",
              title: "title",
              maxLength: 100,
            },
          },
        },
      },
    },
  }
);

console.log("Creating definition");

// add definition to model
await manager.createDefinition("contributionRegistry", {
  name: "contribution registry",
  description: "Contribution registry for contributions made to a DAO",
  schema: manager.getSchemaURL(contributionsRegistryID),
});

console.log("Deploying model");

// Deploy model to Ceramic node
const model = await manager.deploy();

// write managedModel to JSON file. This can be used to retrieve the model for read/write
// actions to streams
await writeFile(
  new URL("../models/model-daoContribution.json", import.meta.url),
  JSON.stringify(model)
);

// write encodedModel to JSON for updating the model
await writeFile(
  new URL("../models/model-daoContribution-encoded.json", import.meta.url),
  JSON.stringify(manager.toJSON())
);

console.log(
  "ManagedModel and EncodedModel written to ./packages/datamodel/models/"
);
