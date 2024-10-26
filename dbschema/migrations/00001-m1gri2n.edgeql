CREATE MIGRATION m1gri2nsfugv6o254ayful7yn46pyc6olbm5hd2prym2c7nfp7wk3q
    ONTO initial
{
  CREATE ABSTRACT TYPE default::BaseRecord {
      CREATE REQUIRED PROPERTY created: std::datetime {
          SET default := (std::datetime_of_transaction());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY updated: std::datetime {
          SET default := (std::datetime_of_transaction());
      };
  };
  CREATE SCALAR TYPE default::BlogPostNumber EXTENDING std::sequence;
  CREATE TYPE default::BlogPost EXTENDING default::BaseRecord {
      CREATE REQUIRED PROPERTY content: std::str;
      CREATE PROPERTY isDraft: std::int64 {
          SET default := 0;
          CREATE CONSTRAINT std::one_of(0, 1);
      };
      CREATE PROPERTY number: default::BlogPostNumber;
      CREATE PROPERTY tags: array<std::str>;
      CREATE REQUIRED PROPERTY title: std::str;
      CREATE PROPERTY tldr: std::str;
  };
  CREATE TYPE default::Session EXTENDING default::BaseRecord {
      CREATE PROPERTY device: std::str;
      CREATE PROPERTY expires: std::datetime;
      CREATE PROPERTY ip: std::str;
      CREATE PROPERTY nickname: std::str;
      CREATE REQUIRED PROPERTY token: std::str;
  };
  CREATE SCALAR TYPE default::AccountLoginMethod EXTENDING enum<LINK, TOKEN>;
  CREATE SCALAR TYPE default::MonkSkinTone EXTENDING enum<MONK_01, MONK_02, MONK_03, MONK_04, MONK_05, MONK_06, MONK_07, MONK_08, MONK_09, MONK_10, UNSET>;
  CREATE SCALAR TYPE default::Pronoun EXTENDING enum<AE, E, EY, FAE, HE, PER, SHE, THEY, UNSET, VE, XE, ZE, ZIE>;
  CREATE TYPE default::User EXTENDING default::BaseRecord {
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY username: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON ((.email, .username));
      CREATE PROPERTY bio: std::str {
          SET default := 'm y s t e r i o u s';
      };
      CREATE PROPERTY homepage: std::str;
      CREATE PROPERTY location: std::str;
      CREATE PROPERTY loginMethod: default::AccountLoginMethod {
          SET default := (default::AccountLoginMethod.LINK);
      };
      CREATE REQUIRED PROPERTY name: std::str {
          SET default := 'Anon Mous';
      };
      CREATE PROPERTY pfp: std::str;
      CREATE PROPERTY pronoun: default::Pronoun {
          SET default := (default::Pronoun.UNSET);
      };
      CREATE PROPERTY skintone: default::MonkSkinTone {
          SET default := (default::MonkSkinTone.UNSET);
      };
  };
  ALTER TYPE default::BlogPost {
      CREATE REQUIRED LINK author: default::User;
  };
  ALTER TYPE default::User {
      CREATE PROPERTY counts := ((
          blogposts := std::count(.<author[IS default::BlogPost])
      ));
  };
  ALTER TYPE default::Session {
      CREATE REQUIRED LINK `for`: default::User;
  };
};
