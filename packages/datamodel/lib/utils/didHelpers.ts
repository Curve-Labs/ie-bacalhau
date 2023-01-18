import { fromString } from "uint8arrays";
import { getResolver } from "key-did-resolver";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { DID } from "dids";

/**
 * @description This function authenticates a DID instance
 *
 * @param did New DID instance
 * @returns Authenticated DID instance
 */
async function authenticateDid(did: DID): Promise<DID> {
  await did.authenticate();
  return did;
}

/**
 * @description This function creates a DID instance based on a private key stored within a .env file,
 * and returns the authenticated DID instance.
 * For details see: https://developers.ceramic.network/docs/advanced/standards/accounts/key-did/
 *
 * @param privateKey Private key to base the DID on
 * @returns DID instance
 */
export async function getDidInstanceFromPK(privateKey: string): Promise<DID> {
  const formatedPrivateKey: Uint8Array = fromString(privateKey!, "base16");
  const did = new DID({
    provider: new Ed25519Provider(formatedPrivateKey!),
    resolver: getResolver(),
  });
  return await authenticateDid(did);
}

// Other DID instance creation methods should be added below
