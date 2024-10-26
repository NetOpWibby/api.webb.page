module default {
  scalar type AccountLoginMethod extending enum<"LINK", "TOKEN">;
  scalar type BlogPostNumber extending sequence;

  scalar type MonkSkinTone extending enum<
    "MONK_01",
    "MONK_02",
    "MONK_03",
    "MONK_04",
    "MONK_05",
    "MONK_06",
    "MONK_07",
    "MONK_08",
    "MONK_09",
    "MONK_10",
    "UNSET"
  >;

  scalar type Pronoun extending enum<
    "AE",
    "E",
    "EY",
    "FAE",
    "HE",
    "PER",
    "SHE",
    "THEY",
    "UNSET",
    "VE",
    "XE",
    "ZE",
    "ZIE"
  >;

  abstract type BaseRecord {
    required created: datetime {
      default := datetime_of_transaction();
      readonly := true;
    };
    required updated: datetime {
      default := datetime_of_transaction();
    };
  }

  type BlogPost extending BaseRecord {
    required author: User;
    required content: str;
    isDraft: int64 {
      constraint one_of (0, 1);
      default := 0;
    };
    number: BlogPostNumber;
    tags: array<str>;
    required title: str;
    tldr: str;
  }

  type Login extending BaseRecord {
    required link `for` -> User;
    required property token -> str;
  }

  type Session extending BaseRecord {
    expires -> datetime;
    device -> str;
    required link `for` -> User;
    ip -> str;
    nickname -> str;
    required token -> str;
  }

  type User extending BaseRecord {
    bio: str { default := "m y s t e r i o u s"; };
    property counts := (
      blogposts := count(.<author[is BlogPost])
    );
    required email: str { constraint exclusive; };
    homepage: str;
    location: str;
    loginMethod: AccountLoginMethod { default := AccountLoginMethod.LINK; };
    required name: str { default := "Anon Mous"; };
    pfp: str;
    pronoun: Pronoun { default := Pronoun.UNSET; };
    skintone: MonkSkinTone { default := MonkSkinTone.UNSET; };
    required username: str { constraint exclusive; };
    index on ((.email, .username));
  }
}
