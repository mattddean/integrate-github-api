import express from "express";
import { createHttpLink } from "apollo-link-http";
import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
} from "@apollo/client/core";
import { relayStylePagination } from "@apollo/client/utilities";
import fetch from "cross-fetch";

import { InternalError, NotFoundError } from "./middleware";
import { Repositories } from "./routes";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  const link = createHttpLink({
    uri: "https://graphql.github.com/graphql",
    fetch: fetch,
  });
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          search: relayStylePagination(["query"]),
        },
      },
    },
  });
  const apolloClient = new ApolloClient<NormalizedCacheObject>({
    link: link as any,
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
