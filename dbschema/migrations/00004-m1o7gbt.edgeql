CREATE MIGRATION m1o7gbt76w3su2bpk5zo6ffot4jfpvdabrufy3lvxgwjkf5lpa7ina
    ONTO m1cwq6oatuszrrwmrtvg2hqtctg52flyu55cbavvvcp5wi23mxhrnq
{
  CREATE MODULE api IF NOT EXISTS;
  CREATE SCALAR TYPE api::Scope EXTENDING enum<BLOGPOST, BLOGPOST_READ, USER, USER_READ>;
  CREATE TYPE api::PersonalKey {
      CREATE REQUIRED LINK owner: default::User;
      CREATE REQUIRED PROPERTY created: std::datetime {
          SET default := (std::datetime_of_transaction());
          SET readonly := true;
      };
      CREATE PROPERTY expires: std::datetime;
      CREATE REQUIRED PROPERTY key: std::str;
      CREATE REQUIRED PROPERTY scope: api::Scope;
  };
};
