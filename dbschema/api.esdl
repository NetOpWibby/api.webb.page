module api {
  scalar type Scope extending enum<
    "BLOGPOST",
    "BLOGPOST_READ",
    "USER",
    "USER_READ"
  >;

  type PersonalKey {
    required created: datetime {
      default := datetime_of_transaction();
      readonly := true;
    };
    expires: datetime;
    required key: str;
    required owner: default::User;
    required scope: Scope;
  }
}
