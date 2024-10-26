


/// util

import {
  accessControl,
  client,
  log,
  prettyFilePath,
  type StandardBooleanResponse
} from "src/utility/index.ts";

import e from "dbschema";
import type { LoginRequest } from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: LoginRequest, ctx, _info?): StandardBooleanResponse => {
  if (!await accessControl(ctx))
    return { success: false };

  const { params } = args;

  const query = {
    email: params.email && stringTrim(String(params.email)),
    id: params.id && e.uuid(stringTrim(String(params.id)))
  };

  const foundLogin = await e.select(e.Login, document => ({
    filter_single: e.or(
      e.op(document.for.email, "=", query.email),
      e.op(document.id, "=", query.id)
    )
  })).run(client);

  if (!foundLogin) {
    log.warning(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  try {
    await e.delete(e.Login, document => ({
      filter_single: e.eq(document.id, e.uuid(foundLogin.id))
    })).run(client);

    log.info("deleted login", query);
    return { success: true };
  } catch(error) {
    log.error(`[${thisFilePath}]› Exception caught while deleting document.`, error);
    return { success: false };
  }
}
