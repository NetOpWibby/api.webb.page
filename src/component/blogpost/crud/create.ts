


/// util

import {
  accessControl,
  client,
  log,
  personFromSession,
  prettyFilePath,
  stringTrim,
  type StandardResponse
} from "src/utility/index.ts";

import e from "dbschema";
import processStringArray from "../utility/process-string-array.ts";
import { type BlogPost, type BlogPostCreate } from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: BlogPostCreate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params } = args;
  const query: Partial<BlogPost> = {};

  const processParam = (key: keyof BlogPost, value: any): void => {
    switch(key) {
      case "content":
      case "title":
      case "tldr": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "isDraft": {
        query[key] = Number(value);
        break;
      }

      case "tags": {
        query[key] = processStringArray(value);
        break;
      }
    }
  };

  Object.entries(params).forEach(([key, value]) => processParam(key as keyof BlogPost, value));

  /// vibe check
  if (!query.content || !query.title) {
    const message = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${message}`);
    return { detail: null, error: { code: "TBA", message }};
  }

  /// set author
  query.author = e.uuid((await personFromSession(ctx)).id);

  // TODO
  // : cleanse `content`

  try {
    const newDocument = await e.select(
      e.insert(e.BlogPost, {
        ...query,
        /// linked documents have to be queried like this
        author: e.select(e.User, document => ({
          filter_single: e.op(document.id, "=", query.author)
        }))
      }),
      document => ({
        ...e.BlogPost["*"],
        author: document.author["*"]
      })
    ).run(client);

    return { detail: newDocument };
  } catch(error) {
    console.log(error);
    log.error(`[${thisFilePath}]› Exception caught while creating document.`, error);
    return { detail: null };
  }
}
