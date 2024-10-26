


/// export

export interface PaginationArgument {
  after: string;
  first: number;
}

export interface PaginationResponse {
  pageInfo: {
    cursor: string;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}



///
/// keep this file in sync
/// with `schema/pagination.graphql`
///
