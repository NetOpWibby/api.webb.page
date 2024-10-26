


/// util

import { client } from "src/utility/index.ts";
import e from "dbschema";



/// export

export default async(username: string): Promise<string | null> => {
  const user = await e.select(e.User, document => ({
    filter_single: e.op(document.username, "=", username),
    id: true
  })).run(client);

  return user?.id ?? null;
}
