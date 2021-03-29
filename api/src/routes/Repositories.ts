import { Router } from "express";
// import { logIn, logOut } from "../auth";
import { catchAsyncRequest } from "../middleware";
// import { validate, loginSchema } from "../validation";
import gql from "graphql-tag";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";

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
          {
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
                endCursor
              }
            }
          }
        `;

        type Repo = {
          name: string;
        };

        let afterCursor = "";

        // We'll fill this with the names of the repos we retrieve.
        const repos: string[] = [];

        // Append repositories to our repos array until we've paginated through all of the repositories that match our search.
        // We'll break out of this loop with a break statement.
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const result = await apolloClient.query({
            query,
            variables: { afterCursor },
          });
          result.data.search.nodes.map((repo: Repo) => {
            repos.concat(repo.name);
          });
          if (result.data.search.pageInfo.hasNextPage) {
            // there are more pages left; move cursor forward
            afterCursor = result.data.search.pageInfo.endCursor;
          } else {
            // finished paginating; break out of loop
            break;
          }
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
