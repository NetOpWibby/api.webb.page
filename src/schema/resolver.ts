


/// util

import {
  create as createBlogPost,
  del as deleteBlogPost,
  get as blogpost,
  getMore as blogposts,
  update as updateBlogPost
} from "../component/blogpost/index.ts";

import {
  create as createLogin,
  del as deleteLogin,
  get as login
} from "../component/login/index.ts";

import {
  create as createSession,
  del as deleteSession,
  get as session,
  getMore as sessions,
  update as updateSession
} from "../component/session/index.ts";

import {
  create as createUser,
  del as deleteUser,
  get as user,
  update as updateUser
} from "../component/user/index.ts";



/// export

export const Query = {
  blogpost,
  blogposts,
  login,
  session,
  sessions,
  user
};

export const Mutation = {
  createBlogPost,
  createLogin,
  createSession,
  createUser,
  deleteBlogPost,
  deleteLogin,
  deleteSession,
  deleteUser,
  updateBlogPost,
  updateSession,
  updateUser
};
