import express from "express";
import { createHttpLink } from "apollo-link-http";
import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { relayStylePagination } from "@apollo/client/utilities";
import fetch from "cross-fetch";

import { InternalError, NotFoundError } from "./middleware";
import { Repositories } from "./routes";
import { GITHUB_TOKEN } from "./config";

export const createApp = () => {
  const app = express();

  console.log(GITHUB_TOKEN);

  app.use(express.json());

  const httpLink = createHttpLink({
    uri: "https://api.github.com/graphql",
    fetch: fetch,
  });
  const cache = new InMemoryCache();
  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = GITHUB_TOKEN;
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `bearer ${token}` : "",
      },
    };
  });
  const apolloClient = new ApolloClient<NormalizedCacheObject>({
    link: authLink.concat(httpLink as any),
    cache,
  });

  // routes
  const repositories = new Repositories(apolloClient);
  app.use(repositories.getRouter());

  // catch and report lingering errors
  app.use(NotFoundError);
  app.use(InternalError);

  return app;
};
