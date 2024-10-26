


/// util

import {
  accessControl,
  client,
  log,
  objectIsEmpty,
  prettyFilePath,
  stringTrim,
  type StandardResponse
} from "src/utility/index.ts";

import e from "dbschema";

import {
  LoginMethod,
  MonkSkinTone,
  Pronoun,
  type User,
  type UserUpdate
} from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: UserUpdate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const { params, updates } = args;

  if (objectIsEmpty(params) || objectIsEmpty(updates)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`, args);
    return { detail: null };
  }

  const processParam = (key: keyof User, value: any): void => {
    switch(key) {
      case "bio":
      case "homepage":
      case "location":
      case "name":
      case "pfp":
      case "username": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "email": {
        query[key] = validateEmail(stringTrim(String(value))) ?
          stringTrim(String(value).toLowerCase()) :
          "";
        break;
      }

      case "loginMethod": {
        query[key] = LoginMethod[stringTrim(String(value).toUpperCase()) as keyof typeof LoginMethod] ||
          LoginMethod.LINK;
        break;
      }

      case "pronoun": {
        query[key] = Pronoun[stringTrim(String(value).toUpperCase()) as keyof typeof Pronoun] ||
          Pronoun.UNSET;
        break;
      }

      case "skintone": {
        query[key] = MonkSkinTone[stringTrim(String(value).toUpperCase()) as keyof typeof MonkSkinTone] ||
          MonkSkinTone.UNSET;
        break;
      }
    }
  };

  Object.entries(updates).forEach(([key, value]) => processParam(key as keyof User, value));

  /// vibe check
  if (updates.email && query.email.length === 0) {
    const message = "Vibe check failed.";
    log.warning(`[${thisFilePath}]› ${message}`);
    return { detail: null, error: { code: "TBA", message }};
  }

  /// email check
  if (updates.email) {
    const emailExists = await e.select(e.User, document => ({
      ...e.User["*"],
      filter_single: e.op(document.email, "=", query.email)
    })).run(client);

    if (emailExists) {
      const message = "Cannot update, email in use.";
      log.warning(`[${thisFilePath}]› ${message}`);
      return { detail: null, error: { code: "TBA", message }};
    }
  }

  /// username availability check
  const existingUsername = await e.select(e.User, document => ({
    filter: e.op(e.str_lower(document.username), "=", e.str_lower(query.username))
  })).run(client);

  if (existingUsername.length > 0) {
    const message = "Username taken.";
    log.warning(`[${thisFilePath}]› ${message}`);
    return { detail: null, error: { code: "TBA", message }};
  }

  /// name check
  if (query.name.length < 3)
    query.name = "Anon Mous";

  try {
    const updateQuery = await e.select(
      e.update(e.User, document => ({
        filter_single: e.op(document.id, "=", e.uuid(String(params.id))),
        set: {
          ...query,
          updated: e.datetime_of_transaction()
        }
      })),
      _document => ({ ...e.User["*"] })
    ).run(client);

    return { detail: updateQuery };
  } catch(error) {
    log.error(`[${thisFilePath}]› Exception caught while updating document.`, error);
    return { detail: null };
  }
}
