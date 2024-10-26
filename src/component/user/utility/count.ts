


/// util

import { client, log, prettyFilePath } from "src/utility/index.ts";
import e from "dbschema";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(): Promise<number> => {
  let documentCount = 0;

  try {
    const allDocuments = await e.select(e.User, () => ({ id: true })).run(client);
    documentCount = allDocuments.length;
  } catch(_) {
    log.warning(`[${thisFilePath}]› Error retrieving document count.`);
  }

  return documentCount;
}
