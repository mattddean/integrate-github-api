import { Request, Response, NextFunction } from "express";
import { query } from "./query";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";

// https://learn.vonage.com/blog/2020/03/12/using-apollo-to-query-graphql-from-node-js-dr/

export const apolloQuery = async (
  req: Request,
  res: Response,
  next: NextFunction,
  client: ApolloClient<NormalizedCacheObject>
) => {
  await query(req, res, client);

  next();
};
