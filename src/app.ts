import express from "express";
import { createHttpLink } from "apollo-link-http";
import { ApolloClient } from "@apollo/client/core";
import { InMemoryCache } from "apollo-cache-inmemory";
import fetch from "node-fetch";

import { InternalServerError, NotFoundError } from "./middleware";
import { repositories } from "./routes";

export const createApp = () => {
  const app = express();

  const httpLink = createHttpLink({
    uri: "https://insights.opentok.com/graphql",
    fetch: fetch,
  });

  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });

  // routes
  app.use(repositories);

  // middleware
  app.use(NotFoundError);
  app.use(InternalServerError);

  return app;
};
