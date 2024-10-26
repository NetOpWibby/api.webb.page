


/// util

import {
  client,
  stringTrim,
  type StandardResponse
} from "src/utility/index.ts";

import e from "dbschema";
import { type LoginRequest } from "../schema.ts";



/// export

export async function get(_root, args: LoginRequest, _ctx?, _info?): StandardResponse {
  const { params } = args;

  const query = {
    email: params.email && stringTrim(String(params.email)),
    id: params.id && stringTrim(String(params.id))
  };

  const login = await e.select(e.Login, document => ({
    ...e.Login["*"],
    filter_single: e.or(
      e.op(document.for.email, "=", query.email),
      e.op(document.id, "=", e.uuid(query.id))
    ),
    for: document.for["*"]
  })).run(client);

  return { detail: login };
}
