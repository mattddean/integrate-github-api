import gql from "graphql-tag";
import {
  FailedToGetAllReposError,
  HitRateLimitError,
  ThirdPartyApiError,
} from "../errors";
import { ApolloClient, ApolloError } from "@apollo/client/core";
import { NormalizedCacheObject } from "@apollo/client";
import { THIRD_PARTY_NAME } from "../config";

type Repo = {
  name: string;
};

/**
 * Try to get the error message from third party, but if not possible, simply report "Unknown error"
 */
const handleThirdPartyError = (e: ApolloError) => {
  let errorMessage = "";
  e.graphQLErrors.map(({ message }) => {
    errorMessage += message += ",";
  });

  throw new ThirdPartyApiError(errorMessage, THIRD_PARTY_NAME, e);
};

export const getRepos = async (
  apolloClient: ApolloClient<NormalizedCacheObject>,
  organization: string
): Promise<Repo[]> => {
  const query = gql`
    query Repositories($organization: String!) {
      organization(login: $organization) {
        repositories(first: 100) {
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
      }
      rateLimit {
        limit
        cost
        remaining
        resetAt
      }
    }
  `;

  const moreRepositoriesQuery = gql`
    query MoreRepositories($afterCursor: String!, $organization: String!) {
      organization(login: $organization) {
        repositories(first: 100, after: $afterCursor) {
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
      }
      rateLimit {
        limit
        cost
        remaining
        resetAt
      }
    }
  `;

  // We'll fill this with the names of the repos we retrieve.
  const repos: Repo[] = [];

  let result;

  try {
    result = await apolloClient.query({
      query,
      variables: { organization },
    });
  } catch (e) {
    handleThirdPartyError(e);

    // We throw from handleThirdPartyError, but the rest of this code does not know that,
    // so we need to tell TypeScript that we won't continue this function
    // so it doesn't complain about result being possibly undefined
    return [{ name: "" }];
  }

  result.data.organization.repositories.edges.map((edge: any) => {
    repos.push({ name: edge.node.name });
  });

  let hasNextPage = false;
  let afterCursor = "";

  const repositoryCount = result.data.organization.repositories.totalCount;

  if (result.data.organization.repositories.pageInfo.hasNextPage) {
    hasNextPage = true;
    afterCursor = result.data.organization.repositories.pageInfo.endCursor;
  }

  // Append repositories to our repos array until we've paginated through all of the repositories that match our search.
  // We'll break out of this loop with a break statement.
  // eslint-disable-next-line no-constant-condition

  let secondResult;

  while (hasNextPage) {
    try {
      secondResult = await apolloClient.query({
        query: moreRepositoriesQuery,
        variables: { afterCursor, organization: organization },
      });
    } catch (e) {
      handleThirdPartyError(e);

      // We throw from handleThirdPartyError, but the rest of this code does not know that,
      // so we need to tell TypeScript that we won't continue this function
      // so it doesn't complain about secondResult being possibly undefined
      return [{ name: "" }];
    }
    secondResult.data.organization.repositories.edges.map((edge: any) => {
      repos.push({ name: edge.node.name });
    });
    hasNextPage =
      secondResult.data.organization.repositories.pageInfo.hasNextPage;

    if (hasNextPage) {
      // there are more pages left; move cursor forward to prepare for next iteration
      afterCursor =
        secondResult.data.organization.repositories.pageInfo.endCursor;

      // check for remaining requests in our rate limit
      const { rateLimit } = secondResult.data;
      if (rateLimit.remaining < 1) {
        throw new HitRateLimitError(rateLimit.resetAt, THIRD_PARTY_NAME);
      }
    }
  }

  // Throw an error if we got fewer repos than were specified by repositoryCount.
  if (repos.length != repositoryCount) {
    throw new FailedToGetAllReposError(
      organization,
      repositoryCount,
      repos.length
    );
  }

  // Return our finished array of repos.
  return repos;
};
