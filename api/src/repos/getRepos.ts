import gql from "graphql-tag";
import { FailedToGetAllReposError } from "../errors";
import { ApolloClient } from "@apollo/client/core";
import { NormalizedCacheObject } from "@apollo/client";

type Repo = {
  name: string;
};

export const getRepos = async (
  apolloClient: ApolloClient<NormalizedCacheObject>
): Promise<Repo[]> => {
  const query = gql`
    query Repostiories {
      organization(login: "Google") {
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
    query MoreRepositories($afterCursor: String) {
      organization(login: "Google") {
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

  const result = await apolloClient.query({
    query,
  });

  result.data.organization.repositories.edges.map((edge: any) => {
    repos.push({ name: edge.node.name });
  });

  let hasNextPage = false;
  let afterCursor = "";

  console.log(result.data.organization.repositories.pageInfo);

  const repositoryCount = result.data.organization.repositories.totalCount;

  if (result.data.organization.repositories.pageInfo.hasNextPage) {
    hasNextPage = true;
    afterCursor = result.data.organization.repositories.pageInfo.endCursor;
    console.log(afterCursor);
  }

  // Append repositories to our repos array until we've paginated through all of the repositories that match our search.
  // We'll break out of this loop with a break statement.
  // eslint-disable-next-line no-constant-condition
  while (hasNextPage) {
    const result = await apolloClient.query({
      query: moreRepositoriesQuery,
      variables: { afterCursor },
    });
    result.data.organization.repositories.edges.map((edge: any) => {
      repos.push({ name: edge.node.name });
    });
    hasNextPage = result.data.organization.repositories.pageInfo.hasNextPage;
    console.log(result.data.organization.repositories.pageInfo);

    if (hasNextPage) {
      // there are more pages left; move cursor forward to prepare for next iteration
      afterCursor = result.data.organization.repositories.pageInfo.endCursor;

      console.log(result.data.rateLimit);
    }
  }

  // Throw an error if we got fewer repos than were specified by repositoryCount.
  if (repos.length != repositoryCount) {
    throw new FailedToGetAllReposError("google", repositoryCount, repos.length);
  }

  // Return our finished array of repos.
  return repos;
};
