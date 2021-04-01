import { ApolloClient, ApolloError } from "@apollo/client/core";
import { NormalizedCacheObject } from "@apollo/client";

import { THIRD_PARTY_NAME } from "../config";
import { repositoriesQuery, moreRepositoriesQuery } from "../graphql/queries";
import {
  FailedToGetAllReposError,
  HitRateLimitError,
  ThirdPartyApiError,
} from "../errors";

type Repo = {
  name: string;
};

/**
 * Try to get the error message from third party, but if not possible, simply report "Unknown error"
 */
const handleThirdPartyError = (e: ApolloError): Repo[] => {
  let errorMessage = "";
  e.graphQLErrors.map(({ message }) => {
    errorMessage += message += ",";
  });

  throw new ThirdPartyApiError(errorMessage, e);
};

export const getRepos = async (
  apolloClient: ApolloClient<NormalizedCacheObject>,
  organization: string
): Promise<Repo[]> => {
  // We'll fill this with the names of the repos we retrieve.
  const repos: Repo[] = [];

  let result;

  try {
    result = await apolloClient.query({
      query: repositoriesQuery,
      variables: { organization },
    });
  } catch (e) {
    return handleThirdPartyError(e);
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

  let supplementalResult;

  while (hasNextPage) {
    try {
      supplementalResult = await apolloClient.query({
        query: moreRepositoriesQuery,
        variables: { afterCursor, organization: organization },
      });
    } catch (e) {
      return handleThirdPartyError(e);
    }
    supplementalResult.data.organization.repositories.edges.map((edge: any) => {
      repos.push({ name: edge.node.name });
    });
    hasNextPage =
      supplementalResult.data.organization.repositories.pageInfo.hasNextPage;

    if (hasNextPage) {
      // there are more pages left; move cursor forward to prepare for next iteration
      afterCursor =
        supplementalResult.data.organization.repositories.pageInfo.endCursor;

      // check for remaining requests in our rate limit
      const { rateLimit } = supplementalResult.data;
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
