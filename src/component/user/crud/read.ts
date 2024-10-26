


/// util

import {
  accessControl,
  client,
  stringTrim,
  type StandardResponse
} from "src/utility/index.ts";

import e from "dbschema";
import { type UserRequest } from "../schema.ts";



/// export

export const get = async(_root, args: UserRequest, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { success: false };

  const { params } = args;

  const query = {
    email: params.email && e.uuid(stringTrim(params.email)),
    id: params.id && e.uuid(stringTrim(params.id)),
    username: params.username && stringTrim(params.username)
  };

  const user = await e.select(e.User, document => ({
    ...e.User["*"],
    filter_single: e.or(
      e.op(document.id, "=", query.id),
      e.op(document.email, "=", query.email),
      e.op(document.username, "=", query.username)
    )
  })).run(client);

  return { detail: user };
};
