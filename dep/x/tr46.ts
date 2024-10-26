


/// import

import * as tr46 from "npm:idna-uts46-hx@5.0.7";



/// export

export const toASCII = (str: string) => tr46.toAscii(
  String(str).trim(), {
    transitional: true,
    useStd3ASCII: false,
    verifyDnsLength: false
  }
);

export const toUnicode = (str: string) => tr46.toUnicode(String(str).trim());
