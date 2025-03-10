


/// util

const allowedAlgorithmsForKeys = {
  "ec": ["ES256", "ES384", "ES512"],
  "rsa": ["RS256", "PS256", "RS384", "PS384", "RS512", "PS512"],
  "rsa-pss": ["PS256", "PS384", "PS512"]
};

const allowedCurves = {
  ES256: ["prime256v1", "p256"],
  ES384: ["secp384r1", "s384"],
  ES512: ["secp521r1", "s521"]
};



/// export

export default (algorithm, key) => {
  if (!algorithm || !key)
    return;

  const keyType = key.asymmetricKeyType;

  if (!keyType)
    return;

  const allowedAlgorithms = allowedAlgorithmsForKeys[keyType];

  if (!allowedAlgorithms)
    throw new Error(`Unknown key type "${keyType}".`);

  if (!allowedAlgorithms.includes(algorithm))
    throw new Error(`"alg" parameter for "${keyType}" key type must be one of: ${allowedAlgorithms.join(", ")}.`)

  switch(keyType) {
    case "ec": {
      const keyCurve = key.asymmetricKeyDetails.namedCurve;
      const allowedCurve = allowedCurves[algorithm];

      if (!allowedCurve.includes(keyCurve))
        throw new Error(`"alg" parameter "${algorithm}" requires curve "${allowedCurve}".`);

      break;
    }

    case "rsa-pss": {
      const length = parseInt(algorithm.slice(-3), 10);
      const { hashAlgorithm, mgf1HashAlgorithm, saltLength } = key.asymmetricKeyDetails;

      if (hashAlgorithm !== `sha${length}` || mgf1HashAlgorithm !== hashAlgorithm)
        throw new Error(`Invalid key for this operation, its RSA-PSS parameters do not meet the requirements of "alg" ${algorithm}.`);

      if (saltLength !== undefined && saltLength > length >> 3)
        throw new Error(`Invalid key for this operation, its RSA-PSS parameter saltLength does not meet the requirements of "alg" ${algorithm}.`)

      break;
    }
  }
}
