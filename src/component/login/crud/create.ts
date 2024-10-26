


/// util

import {
  appURL,
  client,
  log,
  resend,
  prettyFilePath,
  sign,
  stringTrim,
  validateEmail,
  type StandardResponse
} from "src/utility/index.ts";

import e from "dbschema";
import { type LoginCreate } from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export default async(_root, args: LoginCreate, _ctx?, _info?): StandardResponse => {
  /// this function needs to be accessible to non-authenticated folks
  const { params } = args;

  const query = {
    email: validateEmail(stringTrim(String(params.email))) ?
      stringTrim(String(params.email)) :
      null
  };

  /// vibe check
  if (!query.email) {
    const message = "Missing required parameter(s).";
    log.warn(`[${thisFilePath}]› ${message}`);
    return { detail: null, error: { code: "TBA", message }};
  }

  let user = await e.select(e.User, document => ({
    ...e.User["*"],
    filter_single: e.op(document.email, "=", query.email)
  })).run(client);

  if (!user) {
    /// if user does not exist, create them.
    const newUserDetails = {
      email: query.email,
      name: "Anon Mous",
      username: createUsername(query.email)
    };

    try {
      user = await e.insert(e.User, newUserDetails as User).run(client);
      log.info(`[${thisFilePath}]› Created new user.`);
    } catch(_) {
      const message = "New user creation failed";
      log.error(`[${thisFilePath}]› Exception caught while creating new user.`);
      return { detail: null, error: { code: "TBA", message }};
    }
  }

  try {
    const jwt = sign({
      exp: Math.floor(
        new Date(
          new Date(Date.now()).getTime() + /// currentTime
          15 * 60 * 1000                   /// add 15 minutes
        ).getTime() / 1000                 /// from now (in seconds)
      ),
      sub: `id|${user.id}` /// unique id of user
    });

    const databaseQuery = await e.select(
      e.insert(e.Login, {
        token: jwt,
        for: e.select(e.User, document => ({
          filter: e.op(document.id, "=", e.uuid(user!.id))
        }))
      }), login => ({
        ...e.Login["*"],
        for: login.for["*"]
      })
    ).run(client);

    const loginLink = `${appURL}/access?${databaseQuery.token}`;

    const emailBody = `
      <p>Hey!</p>
      <p><a href="${loginLink}">Sign-in to your site</a></p>
      <p><a href="https://webb.page">https://webb.page</a></p>
    `;
    const emailBodyPlain = `
      Hey!

      Sign-in to your site:
      ${loginLink}

      https://webb.page
    `;

    resend.emails.send({
      from: "The Webb Page <onboarding@webb.page>",
      html: emailBody,
      subject: "Your login link",
      text: emailBodyPlain,
      to: [databaseQuery.for.email]
    });

    return { detail: databaseQuery };
  } catch(error) {
    console.log(error);
    log.error(`[${thisFilePath}]› Exception caught while creating document.`, error);
    return { detail: null };
  }
}



/// helper

function createUsername(suppliedEmail: string): string {
  // TODO
  // : use something like nanoid instead of `Math.random`

  return String(suppliedEmail)
    .split("@")[0]
    .replace(/\+/g, "") + String(Math.random())
    .split(".")[1]
    .slice(0, 5);
}
