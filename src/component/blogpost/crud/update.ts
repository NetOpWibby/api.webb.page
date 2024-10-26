


/// util

import {
  accessControl,
  client,
  log,
  objectIsEmpty,
  personFromSession,
  prettyFilePath,
  stringTrim,
  type StandardResponse
} from "src/utility/index.ts";

import e from "dbschema";
import processStringArray from "../utility/process-string-array.ts";
import { type BlogPost, type BlogPostUpdate } from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: BlogPostUpdate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`, args);
    return { detail: null };
  }

  const query = {};

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

  Object.entries(updates).forEach(([key, value]) => processParam(key as keyof BlogPost, value));

  // TODO
  // : cleanse `content`

  const post = await e.select(e.BlogPost, document => ({
    ...e.BlogPost["*"],
    author: e.User["*"],
    filter_single: params.id ?
      e.op(document.id, "=", e.uuid(String(params.id))) :
      e.op(document.number, "=", params.number)
  })).run(client);

  const authorId = (await personFromSession(ctx)).id;

  /// vibe check
  if (!post) {
    const message = "BlogPost does not exist.";
    log.warning(`[${thisFilePath}]› ${message}`);
    return { detail: null, error: { code: "DOCUMENT_DOES_NOT_EXIST", message }};
  }

  if (authorId !== post.author.id) {
    const message = "Sus activity.";
    log.warning(`[${thisFilePath}]› ${message}`);
    return { detail: null, error: { code: "SUS_ACTIVITY", message }};
  }

  /// isDraft check
  if (updates.isDraft) {
    if (post.isDraft === 1)
      query.isDraft = Number(updates.isDraft);
    else
      query.isDraft = 0;
  }

  try {
    const updatedDocument = await e.select(
      e.update(e.BlogPost, document => ({
        filter_single: e.op(document.id, "=", e.uuid(String(post.id))),
        set: {
          ...query,
          updated: e.datetime_of_transaction()
        }
      })),
      document => ({
        ...e.BlogPost["*"],
        author: document.author["*"]
      })
    ).run(client);

    return { detail: updatedDocument };
  } catch(error) {
    log.error(`[${thisFilePath}]› Exception caught while updating document.`, error);
    console.error(error);
    return { detail: null };
  }
}
