import { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
import { Request, Response } from "express";
import gql from "graphql-tag";

export const query = async (
  req: Request,
  res: Response,
  client: ApolloClient<NormalizedCacheObject>
) => {
  if (!req.body || !req.body.query) {
    res.sendStatus(500);
    return;
  }

  const query = gql(req.body.query);
  let variables = undefined;
  if (req.body.variables) {
    variables = JSON.parse(decodeURIComponent(req.body.variables));
  }

  try {
    const result = await client.query({
      query,
      variables,
    });
    res.json(result);
  } catch (err) {
    console.log(err);
    res.sendStatus(500).send(JSON.stringify(err));
  }
};
