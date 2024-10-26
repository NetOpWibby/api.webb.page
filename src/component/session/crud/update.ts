


/// import

import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  accessControl,
  client,
  objectIsEmpty,
  prettyFilePath,
  validateDate
} from "src/utility/index.ts";

import e from "dbschema";

import type { SessionUpdate } from "../schema.ts";
import type { DetailObject, LooseObject, StandardResponse } from "src/utility/index.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: SessionUpdate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params, updates } = args;
  let response: DetailObject | null = null;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warn(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: response };
  }

  const query: LooseObject = {};

  Object.entries(updates).forEach(([key, value]) => {
    switch(key) {
      case "expires": {
        query[key] = validateDate(String(value)) ?
          new Date(String(value)) :
          null;
        break;
      }

      case "nickname": {
        query[key] = String(value).length > 0 ?
          toASCII(String(value)) :
          "Some Device";
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (updates.expires && !query.expires) {
    log.warn(`[${thisFilePath}]› Vibe check failed.`);
    return { detail: response };
  }

  const doesDocumentExist = e.select(e.Session, document => ({
    filter_single: e.op(document.id, "=", e.uuid(String(params.id)))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warn(`[${thisFilePath}]› Cannot update nonexistent document.`);
    return { detail: response };
  }

  // TODO
  // : if `existenceResult.expires` has elapsed, delete document and return blank response

  // TODO
  // : add check to prevent updating `expires` to a time in the past
  //   if you want to invalidate a session, just delete it instead.

  try {
    const updateQuery = e.update(e.Session, document => ({
      filter_single: e.op(document.id, "=", e.uuid(existenceResult.id)),
      set: {
        ...query,
        updated: e.datetime_of_transaction()
      }
    }));

    response = await e.select(updateQuery, document => ({
      ...e.Session["*"],
      for: document.for["*"]
    })).run(client);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while updating document.`);
    return { detail: response };
  }
}
