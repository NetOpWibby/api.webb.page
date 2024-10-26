


/// import

import { elliptic } from "dep/x/elliptic.ts";
import { load } from "dep/std.ts";

/// util

import {
  decode as base64decode,
  encode as base64encode
} from "./helper.ts";

const { eddsa: EdDSA } = elliptic;
const ec = new EdDSA("ed25519");
const env = await load();
const jwtHeader = { alg: "EdDSA", typ: "JWT" };



/// export

export function decode(jwt) {
  /// split the jwt
  const jwtParts = String(jwt).split(".");

  /// jwt must have 3 parts, abort if not
  if (jwtParts.length !== 3) {
    return {
      header: null,
      payload: null,
      signature: null
    };
  }

  return {
    /// parse `header` and `payload` here, for convenience
    header: JSON.parse(base64decode(jwtParts[0])),
    payload: JSON.parse(base64decode(jwtParts[1])),
    signature: jwtParts[2] /// no need to decode, this is for verification
  };
}

export function sign(jwtPayload) {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const key = ec.keyFromSecret(env["KEY_SECRET"]); /// keypair from secret

  // TODO
  // : mention in README that this function should
  //   be supplied with an object that contains
  //   `exp` and `sub` params

  const basePayload = {
    aud: "webb.page",
    iat: currentTimeInSeconds,
    iss: "The Webb Page API",
    nbf: currentTimeInSeconds
  };

  /// message must be an array (buffer) or hex string
  const message =
    base64encode(JSON.stringify(jwtHeader)) +
    "." +
    base64encode(JSON.stringify({ ...basePayload, ...jwtPayload }));

  const signature = key.sign(message).toHex(); /// sign message with key
  const signedJwt = `${message}.${base64encode(signature)}`; /// create jwt

  return signedJwt;
}

export function verify(jwt) {
  const key = ec.keyFromSecret(env["KEY_SECRET"]); /// keypair from secret

  try {
    const decodedToken = decode(jwt);

    if (!decodedToken)
      return false;

    const { header, payload, signature } = decodedToken;
    const { exp, iat, nbf } = payload;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    switch(true) {
      case !exp:
      case !iat:
      case !nbf:
        return false;

      case iat > currentTimeInSeconds:
      case nbf > currentTimeInSeconds:
        return false; /// invalid

      case exp < currentTimeInSeconds:
        return false; /// expired

      default:
        break;
    }

    /// combine message parts (re-stringify and encode)
    const messageHash = `${base64encode(JSON.stringify(header))}.${base64encode(JSON.stringify(payload))}`;

    /// decode signature
    const decodedSignature = base64decode(String(signature));

    /// verify that signature signed message
    return key.verify(messageHash, decodedSignature);
  } catch(_) {
    return false;
  }
}
