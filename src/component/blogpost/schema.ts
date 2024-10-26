


/// util

import { type PaginationArgument } from "../pagination/schema.ts";
import { type User } from "src/component/user/schema.ts";



/// export

export interface BlogPost {
  author: User;
  content: string;
  isDraft: number;
  number: number;
  tags: string[];
  title: string;
  tldr: string;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface BlogPostCreate {
  params: {
    author: User;
    content: string;
    isDraft?: number;
    tags?: string[];
    title: string;
    tldr?: string;
  }
}

export interface BlogPostRequest {
  params: Partial<{
    id: string;
    number: number;
  }>;
}

export interface BlogPostsRequest {
  pagination: PaginationArgument;
  params: { author: User; };
}

export interface BlogPostUpdate {
  params: Partial<{
    id: string;
    slug: string;
  }>;
  updates: Partial<{
    content: string;
    isDraft: number;
    tags: string[];
    title: string;
    tldr: string;
  }>;
}



///
/// keep this file in sync
/// with `schema/blogpost.graphql`
///
