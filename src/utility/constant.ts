


/// util

import { PORT } from "./env.ts";



/// export

export const appPort = PORT && PORT.length ? PORT : 9999;
export const appURL = Deno.args.includes("development") ?
  `http://localhost:${appPort}` :
  "https://webb.page";
export const isDevelopment = Deno.args.includes("development");
export const maxPaginationLimit = 50;
