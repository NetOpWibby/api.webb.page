


/// native

import { Buffer } from "node:buffer";
import { KeyObject, createSecretKey, createPrivateKey } from "node:crypto";

/// import

import jws from "npm:jws@4.0.0";

/// util

import timespan from "./lib/timespan.ts";
import validateAsymmetricKey from "./lib/validate-asymmetric-key.ts";

const OPTIONS_FOR_OBJECTS = [
  "audience",
  "expiresIn",
  "issuer",
  "jwtid",
  "notBefore",
  "noTimestamp",
  "subject"
];

const OPTIONS_TO_PAYLOAD = {
  "audience": "aud",
  "issuer": "iss",
  "jwtid": "jti",
  "subject": "sub"
};



/// export

export default (payload, secretOrPrivateKey, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  } else {
    options = options || {};
  }

  const isObjectPayload = typeof payload === "object" && !Buffer.isBuffer(payload);

  const header = Object.assign({
    alg: options.algorithm || "HS256",
    kid: options.keyid,
    typ: isObjectPayload ? "JWT" : undefined
  }, options.header);

  function failure(err) {
    if (callback)
      return callback(err);

    throw err;
  }

  if (!secretOrPrivateKey && options.algorithm !== "none")
    return failure(new Error("secretOrPrivateKey must have a value"));

  if (secretOrPrivateKey !== null && !(secretOrPrivateKey instanceof KeyObject)) {
    try {
      secretOrPrivateKey = createPrivateKey(secretOrPrivateKey)
    } catch(_) {
      try {
        secretOrPrivateKey = createSecretKey(
          typeof secretOrPrivateKey === "string" ?
            Buffer.from(secretOrPrivateKey) :
            secretOrPrivateKey
        )
      } catch(_) {
        return failure(new Error("secretOrPrivateKey is not valid key material"));
      }
    }
  }

  if (header.alg.startsWith("HS") && secretOrPrivateKey.type !== "secret") {
    return failure(new Error((`secretOrPrivateKey must be a symmetric key when using ${header.alg}`)));
  } else if (/^(?:RS|PS|ES)/.test(header.alg)) {
    if (secretOrPrivateKey.type !== "private")
      return failure(new Error((`secretOrPrivateKey must be an asymmetric key when using ${header.alg}`)));

    if (
      !options.allowInsecureKeySizes &&
      !header.alg.startsWith("ES") &&
      secretOrPrivateKey.asymmetricKeyDetails !== undefined && // KeyObject.asymmetricKeyDetails is supported in Node 15+
      secretOrPrivateKey.asymmetricKeyDetails.modulusLength < 2048
    ) return failure(new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`));
  }

  const invalid_options = OPTIONS_FOR_OBJECTS.filter(opt => typeof options[opt] !== "undefined");

  if (invalid_options.length > 0)
    return failure(new Error(`invalid ${invalid_options.join(",")} option for ${(typeof payload )} payload`));

  if (typeof payload.exp !== "undefined" && typeof options.expiresIn !== "undefined")
    return failure(new Error(`Bad "options.expiresIn" option the payload already has an "exp" property.`));

  if (typeof payload.nbf !== "undefined" && typeof options.notBefore !== "undefined")
    return failure(new Error(`Bad "options.notBefore" option the payload already has an "nbf" property.`));

  if (!options.allowInvalidAsymmetricKeyTypes) {
    try {
      validateAsymmetricKey(header.alg, secretOrPrivateKey);
    } catch(error) {
      return failure(error);
    }
  }

  const timestamp = payload.iat || Math.floor(Date.now() / 1000);

  if (options.noTimestamp)
    delete payload.iat;
  else if (isObjectPayload)
    payload.iat = timestamp;

  if (typeof options.notBefore !== "undefined") {
    try {
      payload.nbf = timespan(options.notBefore, timestamp);
    } catch(err) {
      return failure(err);
    }

    if (typeof payload.nbf === "undefined")
      return failure(new Error(`"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60.`));
  }

  if (typeof options.expiresIn !== "undefined" && typeof payload === "object") {
    try {
      payload.exp = timespan(options.expiresIn, timestamp);
    } catch(err) {
      return failure(err);
    }

    if (typeof payload.exp === "undefined")
      return failure(new Error(`"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60.`));
  }

  Object.keys(OPTIONS_TO_PAYLOAD).forEach(key => {
    const claim = OPTIONS_TO_PAYLOAD[key];

    if (typeof options[key] !== "undefined") {
      if (typeof payload[claim] !== "undefined")
        return failure(new Error(`Bad "options.${key}" option. The payload already has an "${claim}" property.`));

      payload[claim] = options[key];
    }
  });

  const encoding = options.encoding || "utf8";
  const signature = jws.sign({ encoding, header, payload, secret: secretOrPrivateKey });

  // TODO: Remove in favor of the modulus length check before signing once node 15+ is the minimum supported version
  if (!options.allowInsecureKeySizes && /^(?:RS|PS)/.test(header.alg) && signature.length < 256)
    throw new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`)

  return signature;
}
