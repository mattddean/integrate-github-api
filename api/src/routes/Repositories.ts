import { Router } from "express";
// import { logIn, logOut } from "../auth";
import { catchAsyncRequest, InternalError } from "../middleware";
// import { validate, loginSchema } from "../validation";
import gql from "graphql-tag";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
import { FailedToGetAllReposError, InternalServerError } from "../errors";

class Repositories {
  #router = Router();

  constructor(apolloClient: ApolloClient<NormalizedCacheObject>) {
    this.addRoutes(apolloClient);
  }

  addRoutes(apolloClient: ApolloClient<NormalizedCacheObject>) {
    this.#router.get(
      "/v1/google/repositories",
      catchAsyncRequest(async (req, res) => {
        const query = gql`
          query Repostiories {
            search(
              query: "org:google created:>2007-10-29 is:public"
              type: REPOSITORY
              first: 100
            ) {
              nodes {
                ... on Repository {
                  name
                }
              }
              repositoryCount
              pageInfo {
                startCursor
                hasNextPage
                endCursor
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
            search(
              query: "org:google"
              type: REPOSITORY
              first: 100
              after: $afterCursor
            ) {
              nodes {
                ... on Repository {
                  name
                }
              }
              pageInfo {
                startCursor
                hasNextPage
                endCursor
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

        type Repo = {
          name: string;
        };

        // We'll fill this with the names of the repos we retrieve.
        const repos: Repo[] = [];

        const result = await apolloClient.query({
          query,
        });

        let hasNextPage = false;
        let afterCursor = "";

        console.log(result.data.search.pageInfo);

        const repositoryCount = result.data.search.repositoryCount;

        if (result.data.search.pageInfo.hasNextPage) {
          hasNextPage = true;
          afterCursor = result.data.search.pageInfo.endCursor;
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
          result.data.search.nodes.map((repo: Repo) => {
            repos.push({ name: repo.name });
          });
          hasNextPage = result.data.search.pageInfo.hasNextPage;
          console.log(result.data.search.pageInfo);

          if (hasNextPage) {
            // there are more pages left; move cursor forward to prepare for next iteration
            afterCursor = result.data.search.pageInfo.endCursor;

            console.log(result.data.rateLimit);
          }
        }

        // Throw an error if we got fewer repos than were specifeid by repositoryCount
        if (repos.length != repositoryCount) {
          throw new FailedToGetAllReposError(
            "google",
            repositoryCount,
            repos.length
          );
        }

        // Send back our finished array of repos.
        res.json(repos);
      })
    );

    this.#router.put(
      "/v1/google/repositories/to_file",
      catchAsyncRequest(async (req, res) => {
        res.json({});
      })
    );
  }

  getRouter() {
    return this.#router;
  }

  // const oldQuery = gql`organization(login:"Google") {
  //   repositories(first: 100, after:"Y3Vyc29yOjEwMA==") {
  //     edges {
  //       node {
  //         id
  //         name
  //       }
  //     }
  //     pageInfo {
  //       endCursor
  //       hasNextPage
  //     }
  //   }
  // }`;
}

export default Repositories;
