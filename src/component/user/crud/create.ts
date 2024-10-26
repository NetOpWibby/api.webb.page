


/// util

import {
  client,
  log,
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
  type UserCreate
} from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: UserCreate, _ctx, _info?): StandardResponse => {
  const { params } = args;
  const query: Partial<User> = {};

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

  Object.entries(params).forEach(([key, value]) => processParam(key as keyof User, value));

  /// vibe check
  if (query.email.length === 0 || !query.name || !query.username) {
    const message = "Missing required parameter(s).";
    log.warning(`[${thisFilePath}]› ${message}`);
    return { detail: null, error: { code: "TBA", message }};
  }

  /// email check
  const doesDocumentExist = await e.select(e.User, document => ({
    ...e.User["*"],
    filter_single: e.op(document.email, "=", query.email)
  })).run(client);

  if (doesDocumentExist) {
    log.warning(`[${thisFilePath}]› Existing document returned.`);
    return { detail: doesDocumentExist }; /// document exists, return it
  }

  /// username availability check
  const existingUsername = await e.select(e.User, document => ({
    filter: e.op(e.str_lower(document.username), "=", e.str_lower(query.username))
  })).run(client);

  if (existingUsername.length > 0) {
    const error = "Username taken.";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: null, error: { code: "TBA", message: error }};
  }

  /// name check
  if (query.name.length < 3)
    query.name = "Anon Mous";

  try {
    const newUser = await e.select(
      e.insert(e.User, query as User),
      _document => ({ ...e.User["*"] })
    ).run(client);

    return { detail: newUser };
  } catch(error) {
    log.error(`[${thisFilePath}]› Exception caught while creating document.`, error);
    return { detail: null };
  }
}
