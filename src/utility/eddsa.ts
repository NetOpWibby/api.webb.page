


/// import

import base64url from "base64url";
import { Buffer } from "node:buffer";
import ed25519 from "ed25519";

/// util

import type { LooseObject } from "./interface";

const header = {
  alg: "EdDSA",
  typ: "JWT"
};



/// export

export default (payload: LooseObject|string, privateKey: string) => {
  const privateKeySignature = ed25519.MakeKeypair(Buffer.from(privateKey, "base64"));
  const body = base64url.encode(JSON.stringify(header)) +
    "." +
    base64url.encode(JSON.stringify(payload));
  const signature = ed25519.Sign(Buffer.from(body), privateKeySignature);

  return `${body}.${base64url.encode(signature)}`;
};



/// via https://github.com/ngti/jwt-ed25519
/// eddsa(payload, privateKey)
