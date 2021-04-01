import gql from "graphql-tag";

const CORE_REPOSITORIES_FIELDS = gql`
  fragment CoreRepositoriesFields on RepositoryConnection {
    edges {
      node {
        name
      }
    }
    totalCount
    pageInfo {
      startCursor
      hasNextPage
      endCursor
    }
  }
`;

const RATE_LIMIT_FIELDS = gql`
  fragment RateLimit on Query {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }
`;

export const repositoriesQuery = gql`
  ${CORE_REPOSITORIES_FIELDS}
  ${RATE_LIMIT_FIELDS}
  query Repositories($organization: String!) {
    organization(login: $organization) {
      repositories(first: 100) {
        ...CoreRepositoriesFields
      }
    }
    ...RateLimit
  }
`;

export const moreRepositoriesQuery = gql`
  ${CORE_REPOSITORIES_FIELDS}
  ${RATE_LIMIT_FIELDS}
  query MoreRepositories($afterCursor: String!, $organization: String!) {
    organization(login: $organization) {
      repositories(first: 100, after: $afterCursor) {
        ...CoreRepositoriesFields
      }
    }
    ...RateLimit
  }
`;
