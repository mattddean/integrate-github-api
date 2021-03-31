import { Router } from "express";
// import { logIn, logOut } from "../auth";
import { catchAsyncRequest } from "../middleware";
// import { validate, loginSchema } from "../validation";
import { ApolloClient } from "@apollo/client/core";
import { NormalizedCacheObject } from "@apollo/client";
import { compressJsonToFile } from "../files";
import { REPO_FILE_OUTPUT_PATH } from "../config";
import { getRepos } from "../repos";

class Repositories {
  #router;
  #apolloClient;

  constructor(apolloClient: ApolloClient<NormalizedCacheObject>) {
    this.#router = Router();
    this.#apolloClient = apolloClient;

    this.addRoutes();
  }

  addRoutes() {
    this.#router.get(
      "/v1/google/repositories",
      catchAsyncRequest(async (req, res) => {
        const repos = await getRepos(this.#apolloClient);

        res.json(repos);
      })
    );

    this.#router.put(
      "/v1/google/repositories/to_file",
      catchAsyncRequest(async (req, res) => {
        const repos = await getRepos(this.#apolloClient);

        await compressJsonToFile(REPO_FILE_OUTPUT_PATH, repos);

        res.json({
          message: `Successfully wrote repos to  + ${REPO_FILE_OUTPUT_PATH}`,
        });
      })
    );
  }

  getRouter() {
    return this.#router;
  }
}

export default Repositories;
