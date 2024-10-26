


/// export

export interface Login {
  for: string; /// user ID
  link: string;
  token: string;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface LoginCreate {
  params: {
    email: string;
  }
}

export interface LoginRequest {
  params: Partial<{
    email: string;
    id: string;
  }>;
}



///
/// keep this file in sync
/// with `schema/login.graphql`
///
