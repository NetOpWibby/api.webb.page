


/// import

import { Buffer } from "dep/std.ts";

type BufferEncoding =
  | "ascii"
  | "base64"
  | "base64url"
  | "binary"
  | "hex"
  | "latin1"
  | "utf8"
  | "utf-8"
  | "utf16le"
  | "ucs2"
  | "ucs-2"; /// via https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/buffer.d.ts



/// export

export function decode(base64url: string, encoding: BufferEncoding = "utf8"): string {
  /// convert URL-safe base64 string to regular base64 string
  const base64 = base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  return Buffer.from(base64, "base64").toString(encoding);
}

export function encode(input: string | Buffer, encoding: BufferEncoding = "utf8"): string {
  if (Buffer.isBuffer(input))
    return fromBase64(input.toString("base64"));

  return fromBase64(Buffer.from(input as string, encoding).toString("base64"));
}

export function hexToBytes(hex: string) {
  const bytes = [];

  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return bytes;
}

export function randomPrivateKey() {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}



/// helper

function fromBase64(base64: string): string {
  return base64
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function toHex(msg) {
  let res = "";

  for (let i = 0; i < msg.length; i++)
    res += zero2(msg[i].toString(16));

  return res;
}

function zero2(word) {
  if (word.length === 1)
    return `0${word}`;
  else
    return word;
}



/// via https://github.com/brianloveswords/base64url
///     https://github.com/indutny/minimalistic-crypto-utils
