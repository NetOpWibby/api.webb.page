


/// import

import { Buffer } from "node:buffer";



/// util

import { client } from "src/utility/index.ts";
import e from "dbschema";
import { encodeMessagePack } from "dep/std.ts";

enum Level {
  DEBUG = "DEBUG",
  ERROR = "ERROR",
  INFO = "INFO",
  PANIC = "PANIC",
  WARNING = "WARNING"
}



/// program

class Logger {
  private static formatMessage(level: Level, message: string, meta?: object): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : "";

    return `${timestamp} [${level}] ${message}${metaString}`;
  }

  private static async log(level: Level, message: string, meta?: object): Promise<void> {
    const formattedMessage = this.formatMessage(level, message, meta);
    const query: { context?: any; level: Level; message: string; } = { level, message };

    if (meta)
      query.context = encodeMessagePack(ensureMessagePackSafe(meta));

    try {
      await e.insert(e.logger.Log, query).run(client);
    } catch(error) {
      console.error("Unable to process log", error);
    }

    console.log(formattedMessage);
  }

  public static debug(message: string, meta?: object): void {
    this.log(Level.DEBUG, message, meta);
  }

  public static error(message: string, meta?: object): void {
    this.log(Level.ERROR, message, meta);
  }

  public static info(message: string, meta?: object): void {
    this.log(Level.INFO, message, meta);
  }

  public static panic(message: string, meta?: object): void {
    this.log(Level.PANIC, message, meta);
  }

  public static warning(message: string, meta?: object): void {
    this.log(Level.WARNING, message, meta);
  }
}



/// export

export const log = {
  debug: Logger.debug.bind(Logger),
  error: Logger.error.bind(Logger),
  info: Logger.info.bind(Logger),
  panic: Logger.panic.bind(Logger),
  warning: Logger.warning.bind(Logger)
};



/// helper

function ensureMessagePackSafe(content: any): any {
  if (content === null || content === undefined)
    return null;

  if (typeof content === "number" || typeof content === "string" || typeof content === "boolean")
    return content;

  if (content instanceof Date)
    return content.toISOString();

  if (ArrayBuffer.isView(content) || content instanceof ArrayBuffer)
    return Buffer.from(content);

  if (Array.isArray(content))
    return content.map(ensureMessagePackSafe);

  if (typeof content === 'object') {
    const safeObject: { [key: string]: any } = {};

    for (const [key, value] of Object.entries(content)) {
      safeObject[key] = ensureMessagePackSafe(value);
    }

    return safeObject;
  }

  return String(content);
}
