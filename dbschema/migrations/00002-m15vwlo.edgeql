CREATE MIGRATION m15vwloy4hruafkcxhzixfnraeqlhdlvemvtrim2yw7rjz4bc4z7ya
    ONTO m1gri2nsfugv6o254ayful7yn46pyc6olbm5hd2prym2c7nfp7wk3q
{
  CREATE TYPE default::Login EXTENDING default::BaseRecord {
      CREATE REQUIRED LINK `for`: default::User;
      CREATE REQUIRED PROPERTY token: std::str;
  };
};
