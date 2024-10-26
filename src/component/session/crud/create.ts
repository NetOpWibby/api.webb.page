


/// import

import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  createSessionToken,
  client,
  decode,
  prettyFilePath,
  stringTrim,
  verify
} from "src/utility/index.ts";

import e from "dbschema";

import { type StandardResponse } from "src/utility/index.ts";
import { type Session, type SessionCreate } from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: SessionCreate, _ctx?, _info?): StandardResponse => {
  /// this function needs to be accessible to non-authenticated folks
  const { params } = args;
  const query: Partial<Session> = {};

  /// after clicking login link, the jwt is passing through `token`
  /// if legit, discard token and proceed to create session

  const processParam = (key: keyof Session, value: any): void => {
    switch(key) {
      case "device":
      case "for":
      case "ip":
      case "token": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "nickname": {
        query[key] = String(value).length > 0 ?
          toASCII(String(value)) :
          "Some Device";
        break;
      }
    }
  };

  Object.entries(params).forEach(([key, value]) => processParam(key as keyof Session, value));

  /// vibe check
  if (!query.for || !query.token) {
    const message = "Missing required parameter(s).";
    log.warn(`[${thisFilePath}]› ${message}`);
    return { detail: null, error: { code: "TBA", message }};
  }

  /// validate token
  if (!verify(query.token)) {
    const message = "Token is invalid.";
    log.warn(`[${thisFilePath}]› ${message}`);
    return { detail: null, error: { code: "TBA", message }};
  }

  /// ensure focus of session exists
  const user = await e.select(e.User, document => ({
    filter_single: e.op(document.id, "=", e.uuid(query.for))
  })).run(client);

  if (!user) {
    log.warn(`[${thisFilePath}]› User does not exist.`);
    return { detail: null };
  }

  /// ensure token subject and session focus from previous step matches
  const { payload: { sub: jwtSubject }} = decode(query.token);

  if (user.id !== jwtSubject.split("id|")[1]) {
    log.warn(`[${thisFilePath}]› Token subject does not match user.`);
    return { detail: null };
  }

  try {
    const databaseQuery = await e.select(
      e.insert(e.Session, {
        expires: new Date(
          new Date().getTime() + /// currentTime
          20160 * 60 * 1000      /// add 20,160 minutes (two weeks)
        ),
        /// linked properties require subqueries...kind of a waste of resources
        for: e.select(e.User, document => ({
          filter: e.op(document.id, "=", e.uuid(user.id))
        })),
        token: createSessionToken(user.id)
      }), session => ({
        ...e.Session["*"],
        for: session.for["*"]
      })
    ).run(client);

    return { detail: databaseQuery };
  } catch(error) {
    log.error(`[${thisFilePath}]› Exception caught while creating document.`, error);
    console.log(error);
    return { detail: null };
  }
}
