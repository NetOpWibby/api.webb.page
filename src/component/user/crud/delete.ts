


/// util

import {
  accessControl,
  client,
  log,
  prettyFilePath,
  stringTrim,
  type StandardBooleanResponse
} from "src/utility/index.ts";

import e from "dbschema";
import type { UserRequest } from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: UserRequest, ctx, _info?): StandardBooleanResponse => {
  if (!await accessControl(ctx))
    return { success: false };

  const { params } = args;

  const query = {
    email: params.email && e.uuid(stringTrim(params.email)),
    id: params.id && stringTrim(params.id),
    username: params.username && stringTrim(params.username)
  };

  const user = await e.select(e.User, document => ({
    filter_single: e.or(
      e.op(document.id, "=", query.id),
      e.op(document.email, "=", query.email),
      e.op(document.username, "=", query.username)
    )
  })).run(client);

  if (!user) {
    log.warning(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  try {
    await e.delete(e.User, document => ({
      filter_single: e.eq(document.id, e.uuid(user.id))
    })).run(client);

    log.info("deleted user", query);
    return { success: true };
  } catch(error) {
    log.error(`[${thisFilePath}]› Exception caught while deleting document.`, error);
    return { success: false };
  }
}
