


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
import type { BlogPostRequest } from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: BlogPostRequest, ctx, _info?): StandardBooleanResponse => {
  if (!await accessControl(ctx))
    return { success: false };

  const { params } = args;

  const query = {
    id: params.id && e.uuid(stringTrim(params.id)),
    number: params.number && Number(params.number)
  };

  const post = await e.select(e.BlogPost, document => ({
    filter_single: e.or(
      e.eq(document.id, query.id),
      e.eq(document.number, query.number)
    )
  })).run(client);

  if (!post) {
    log.warning(`[${thisFilePath}]› Cannot delete nonexistent document.`);
    return { success: true };
  }

  try {
    await e.delete(e.BlogPost, document => ({
      filter_single: e.eq(document.id, e.uuid(post.id))
    })).run(client);

    log.info("deleted post", query);
    return { success: true };
  } catch(error) {
    log.error(`[${thisFilePath}]› Exception caught while deleting document.`, error);
    return { success: false };
  }
}
