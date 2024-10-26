


/// import

import { log } from "dep/std.ts";

/// util

import { accessControl, client, prettyFilePath } from "src/utility/index.ts";
import e from "dbschema";

import type { LooseObject, StandardBooleanResponse } from "src/utility/index.ts";
import type { SessionRequest } from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: SessionRequest, ctx, _info?): StandardBooleanResponse => {
  if (!await accessControl(ctx))
    return { success: false };

  const { params } = args;
  const query: LooseObject = {};

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "id": {
        query[key] = String(value);
        break;
      }

      default: {
        break;
      }
    }
  });

  const doesDocumentExist = e.select(e.Session, document => ({
    filter_single: e.op(document.id, "=", e.uuid(query.id))
  }));

  const existenceResult = await doesDocumentExist.run(client);

  if (!existenceResult) {
    log.warn(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  /// document exists, so grab ID to locate for deletion
  const documentId = e.uuid(existenceResult.id);

  try {
    const deleteQuery = e.delete(e.Session, document => ({
      filter_single: e.op(document.id, "=", documentId)
    }));

    await deleteQuery.run(client);
    return { success: true };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while deleting document.`);
    return { success: false };
  }
}
