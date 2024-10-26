


/// util

import { client } from "src/utility/index.ts";
import e from "dbschema";



/// export

export default async(ctx) => {
  if (!ctx || !ctx["x-session"])
    return false;

  const bearerTokenParts = ctx["x-session"].split(" ");
  let sessionToken = "";

  if (bearerTokenParts.length === 2 && bearerTokenParts[0].toLowerCase() === "bearer")
    sessionToken = bearerTokenParts[1];
  else
    return false;

  const session = await e.select(e.Session, document => ({
    ...e.Session["*"],
    filter_single: e.op(document.token, "=", sessionToken),
    for: document.for["*"]
  })).run(client);

  if (!session)
    return false; /// session is nonexistent

  return {
    ...session.for
  };
}
