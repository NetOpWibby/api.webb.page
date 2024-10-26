


/// import

import {
  green as shellGreen,
  magenta as shellMagenta,
  underline as shellUnderline,
  STATUS_CODE
} from "dep/std.ts";

import { cors, intercept } from "dep/x/interceptor.ts";
import { dedent } from "dep/x/dedent.ts";
import { GraphQLHTTP } from "dep/x/alpha.ts";
import { makeExecutableSchema } from "dep/x/graphql-tools.ts";

/// util

import { appPort, client, isDevelopment, log } from "src/utility/index.ts";
import { Mutation, Query } from "src/schema/resolver.ts";
import { default as schemaDefinitions } from "src/schema/index.ts";

const schema = makeExecutableSchema({
  resolvers: { Query, Mutation },
  typeDefs: schemaDefinitions
});



/// program

const version = await getVersion();

const server = Deno.serve({
  handler: intercept(async(req) => {
    const { pathname } = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: STATUS_CODE.NoContent
      });
    }

    return pathname === "/graphql" ?
      await GraphQLHTTP<Request>({
        context: request => ({
          request,
          "x-session": new Headers(req.headers).get("authorization")
        }),
        graphiql: isDevelopment,
        schema
      })(req) :
      Response.json({
        detail: "Please visit the documentation for information on how to use my API.",
        status: 406,
        title: "Not Acceptable",
        url: "https://developer.webb.page"
      });
  }, cors({ allowOrigin: isDevelopment ? "*" : "https://webb.page" })),
  hostname: "0.0.0.0",
  onListen({ port }) {
    console.log(
      dedent`\n
     ┌${repeatCharacter("─", 32)}┐
     │ ${fit("PERSONAL API")} │
     │ ${isDevelopment ? fit("→ development") : fit("→ production")} │
     │ ${shellGreen(fit(version))} │
     └${repeatCharacter("─", 32)}┘
      LOCAL ${shellMagenta(`${shellUnderline(`0.0.0.0:${port}`)}`)}
      \n`
    );
    log.debug("booted app");
  },
  port: appPort
}) as Deno.HttpServer;

Deno.addSignalListener("SIGINT", gracefulShutdown);
Deno.addSignalListener("SIGTERM", gracefulShutdown);



/// helper

async function getVersion() {
  let version = "";

  try {
    version = await Deno.readTextFile("./version.txt");
  } catch(_) {
    /// ignore
  }

  return version.trim();
}

async function gracefulShutdown() {
  log.debug("closing server");

  await server.shutdown();
  await client.close();
}

function fit(input: string) {
  const remainingSpace = 30 - input.length; /// 34 - 4 (border + one space each side)
  return input + " ".repeat(remainingSpace);
}

function repeatCharacter(input: string, repeatAmount: number): string {
  if (!repeatAmount || repeatAmount <= 0)
    return input;

  return input.repeat(repeatAmount);
}
