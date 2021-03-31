import express from "express";
import { createHttpLink } from "apollo-link-http";
import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import fetch from "cross-fetch";

import { InternalError, NotFoundError } from "./middleware";
import { Repositories } from "./routes";
import { THIRD_PARTY_TOKEN, THIRD_PARTY_API_URL } from "./config";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  const httpLink = createHttpLink({
    uri: THIRD_PARTY_API_URL,
    fetch: fetch,
  });
  const cache = new InMemoryCache();
  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = THIRD_PARTY_TOKEN;
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
