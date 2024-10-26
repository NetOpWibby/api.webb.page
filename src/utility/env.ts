


/// import

import { load } from "dep/std.ts";

/// util

import { default as sortObject } from "./sort-object.ts";
import { type LooseObject } from "./interface.ts";



/// export

export const {
  PORT,
  RESEND
} = sortObject(await load()) as LooseObject;
