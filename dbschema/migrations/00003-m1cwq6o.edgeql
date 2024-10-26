CREATE MIGRATION m1cwq6oatuszrrwmrtvg2hqtctg52flyu55cbavvvcp5wi23mxhrnq
    ONTO m15vwloy4hruafkcxhzixfnraeqlhdlvemvtrim2yw7rjz4bc4z7ya
{
  CREATE MODULE logger IF NOT EXISTS;
  CREATE SCALAR TYPE logger::LogLevel EXTENDING enum<DEBUG, ERROR, INFO, PANIC, WARNING>;
  CREATE TYPE logger::Log {
      CREATE PROPERTY context: std::bytes;
      CREATE PROPERTY level: logger::LogLevel {
          SET default := (logger::LogLevel.INFO);
      };
      CREATE REQUIRED PROPERTY message: std::str;
      CREATE PROPERTY time: std::datetime {
          SET default := (std::datetime_of_transaction());
          SET readonly := true;
      };
  };
};
