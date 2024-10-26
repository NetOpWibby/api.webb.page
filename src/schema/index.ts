


/// import

import { importQL } from "dep/x/alpha.ts";
import { join } from "dep/std.ts";

/// util

const schema = importQL(join("schema", "schema.graphql"));



/// export

export default () => schema;

export type {
  BlogPost,
  BlogPostCreate,
  BlogPostRequest,
  BlogPostsRequest,
  BlogPostUpdate
} from "../component/blogpost/schema.ts";

export type {
  Login,
  LoginCreate,
  LoginRequest
} from "../component/login/schema.ts";

export type {
  Session,
  SessionCreate,
  SessionRequest,
  SessionsRequest,
  SessionUpdate
} from "../component/session/schema.ts";

export type {
  User,
  UserCreate,
  UserRequest,
  UsersRequest,
  UserUpdate
} from "../component/user/schema.ts";
