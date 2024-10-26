


/// export enum

export enum LoginMethod {
  LINK = "LINK",
  TOKEN = "TOKEN"
}

export enum MonkSkinTone {
  MONK_01 = "MONK_01", // "#f6ede4"
  MONK_02 = "MONK_02", // "#f3e7db"
  MONK_03 = "MONK_03", // "#f7ead0"
  MONK_04 = "MONK_04", // "#eadaba"
  MONK_05 = "MONK_05", // "#d7bd96"
  MONK_06 = "MONK_06", // "#a07e56"
  MONK_07 = "MONK_07", // "#825c43"
  MONK_08 = "MONK_08", // "#604134"
  MONK_09 = "MONK_09", // "#3a312a"
  MONK_10 = "MONK_10", // "#292420"
  UNSET = "UNSET"      // "simpsons yellow"
}

export enum Pronoun {
  AE = "AE",
  E = "E",
  EY = "EY",
  FAE = "FAE",
  HE = "HE",
  PER = "PER",
  SHE = "SHE",
  THEY = "THEY",
  UNSET = "UNSET",
  VE = "VE",
  XE = "XE",
  ZE = "ZE",
  ZIE = "ZIE"
}



/// export interface

export interface User {
  bio: string;
  counts: {
    blogposts: number;
  };
  email: string;
  homepage: string;
  location: string;
  loginMethod: LoginMethod;
  name: string;
  pfp: string;
  pronoun: Pronoun;
  skintone: MonkSkinTone;
  username: string;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface UserCreate {
  params: {
    bio?: string;
    email: string;
    homepage?: string;
    location?: string;
    loginMethod?: LoginMethod;
    name: string;
    pfp?: string;
    pronoun?: Pronoun;
    skintone?: MonkSkinTone;
    username: string;
  }
}

export interface UserRequest {
  params: Partial<{
    email: string;
    id: string;
    username: string;
  }>;
}

export interface UserUpdate {
  params: Partial<{
    email: string;
    id: string;
    username: string;
  }>;
  updates: Partial<{
    bio: string;
    counts: {
      blogposts: number;
    };
    email: string;
    homepage: string;
    location: string;
    loginMethod: LoginMethod;
    name: string;
    pfp: string;
    pronoun: Pronoun;
    skintone: MonkSkinTone;
    username: string;
  }>;
}



///
/// keep this file in sync
/// with `schema/user.graphql`
///
