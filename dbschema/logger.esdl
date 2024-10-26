module logger {
  scalar type LogLevel extending enum<"DEBUG", "ERROR", "INFO", "PANIC", "WARNING">;

  type Log {
    context: bytes;
    level: LogLevel { default := LogLevel.INFO; };
    required message: str;
    time: datetime {
      default := datetime_of_transaction();
      readonly := true;
    };
  }
}
