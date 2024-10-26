


/// import

import { elliptic } from "dep/x/elliptic.ts";
import { load, v1 } from "dep/std.ts";

/// util

import { client } from "src/utility/index.ts";
import e from "dbschema";
import { encode as base64encode, hexToBytes } from "./helper.ts";

const { eddsa: EdDSA } = elliptic;
const ec = new EdDSA("ed25519");
const env = await load();



/// export

export async function accessControl(ctx) {
  if (!ctx || !ctx["x-session"])
    return false;

  const bearerTokenParts = ctx["x-session"].split(" ");
  let sessionToken = "";

  if (bearerTokenParts.length === 2 && bearerTokenParts[0].toLowerCase() === "bearer")
    sessionToken = bearerTokenParts[1];
  else
    return false;

  const session = await e.select(e.Session, document => ({
    ...e.Session["*"],
    filter_single: e.op(document.token, "=", sessionToken),
    for: document.for["*"]
  })).run(client);

  if (!session)
    return false; /// session is nonexistent

  if (new Date(Number(session.expires)).getTime() < new Date().getTime()) {
    /// session is expired, delete it
    await e.delete(e.Session, document => ({
      filter_single: e.op(document.id, "=", e.uuid(session.id))
    })).run(client);

    return false;
  }

  // TODO
  // : increase `expires` window by two weeks every time this is accessed?
  //   or, every n times this is accessed?

  return true;
}

export function createSessionToken(userId: string) {
  /// NOTE
  /// : this function does NOT verify `userId`
  const key = ec.keyFromSecret(env["KEY_SECRET"]); /// privateKey
  const uuid = v1.generate();

  const signature = key.sign(
    base64encode(`${userId}+${uuid}`)
  ).toHex();

  return `${uuid}:${signature}`;
}

export function verifySessionToken(token: string, userId: string) {
  const key = ec.keyFromSecret(env["KEY_SECRET"]); /// privateKey
  const publicKey = key.getPublic();

  /// split token to get UUID and signature
  const [uuid, signatureHex] = token.split(":");

  /// reconstruct signed string
  const base64SignedString = base64encode(`${userId}+${uuid}`);

  /// convert token from hex to byte array
  const signatureBytes = hexToBytes(signatureHex);

  /// verify signature
  return ec.verify(base64SignedString, signatureBytes, publicKey);
}
