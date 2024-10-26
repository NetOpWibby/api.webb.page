


/// util

import { type PaginationArgument } from "../pagination/schema.ts";



/// export

export interface Session {
  device: string;
  expires: Date;
  for: string; // user ID
  ip: string;
  nickname: string;
  token: string;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface SessionCreate {
  params: {
    device?: string;
    for: string; // user ID
    ip?: string;
    nickname?: string;
    token: string; // login token
  }
}

export interface SessionRequest {
  params: {
    id: string;
  }
}

export interface SessionsRequest {
  pagination: PaginationArgument;
  params: Partial<{
    for: string; // user ID
    wildcard: string;
  }>;
}

export interface SessionUpdate {
  params: {
    id: string;
  }
  updates: {
    expires?: Date;
    nickname?: string;
  }
}



///
/// keep this file in sync
/// with `schema/session.graphql`
///
