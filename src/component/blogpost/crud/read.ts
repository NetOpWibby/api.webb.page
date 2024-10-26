


/// util

import {
  accessControl,
  client,
  log,
  maxPaginationLimit,
  prettyFilePath,
  stringTrim,
  type StandardResponse
} from "src/utility/index.ts";

import e from "dbschema";
import { type BlogPostRequest, type BlogPostsRequest } from "../schema.ts";

const thisFilePath = prettyFilePath(String(import.meta.filename));



/// export

export const get = async(_root, args: BlogPostRequest, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { success: false };

  const { params } = args;

  const query = {
    id: params.id && e.uuid(stringTrim(params.id)),
    number: params.number && Number(params.number)
  };

  const post = await e.select(e.BlogPost, document => ({
    ...e.BlogPost["*"],
    filter_single: e.or(
      e.eq(document.id, query.id),
      e.eq(document.number, query.number)
    )
  })).run(client);

  return { detail: post };
};

export const getMore = async(_root, args: BlogPostsRequest, ctx, _info?): StandardPlentyResponse => {
  if (!await accessControl(ctx)) {
    return {
      detail: null,
      pageInfo: {
        cursor: null,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }

  const { pagination, params } = args;

  if (objectIsEmpty(params)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);

    return {
      detail: null,
      pageInfo: {
        cursor: null,
        hasNextPage,
        hasPreviousPage
      }
    };
  }

  const cursor = pagination?.after ? String(pagination.after) : null;
  const limit = Math.min(pagination?.first || 20, maxPaginationLimit);

  const query = {
    author: params.author && e.uuid(stringTrim(String(params.author)))
  };

  const baseShape = e.shape(e.BlogPost, document => ({
    ...e.BlogPost["*"],
    order_by: document.created
  }));

  const createFilter = (document: any) => e.op(e.eq(document.owner, query.owner));

  const allDocuments = await e.select(e.BlogPost, document => ({
    ...baseShape(document),
    filter: createFilter(document)
  })).run(client);

  const offset = cursor ?
    allDocuments.findIndex(doc => doc.id === atob(cursor)) + 1 :
    0;

  const response = await e.select(e.BlogPost, document => ({
    ...baseShape(document),
    filter: createFilter(document),
    limit,
    offset
  })).run(client);

  const newCursor = response?.length ?
    btoa(response[response.length - 1].id) :
    null;

  const hasNextPage = offset + limit < allDocuments.length;
  const hasPreviousPage = offset > 0;

  return {
    detail: response,
    pageInfo: {
      cursor: newCursor,
      hasNextPage,
      hasPreviousPage
    }
  };
};
