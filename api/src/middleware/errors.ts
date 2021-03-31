import { RequestHandler, Request, Response, NextFunction } from "express";
import { NODE_ENV } from "../config";

// https://stackoverflow.com/a/50014868/7472250
type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
  ...a: Parameters<T>
) => TNewReturn;

type PromiseRequestHandler = ReplaceReturnType<RequestHandler, Promise<void>>;

export const catchAsyncRequest = (handler: PromiseRequestHandler) => (
  ...args: [Request, Response, NextFunction]
) => handler(...args).catch(args[2]);

export const InternalError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  if (!err.status) {
    console.error(err.stack);
  }
  // don't expose inner workings to production user
  const message =
    NODE_ENV == "production" ? "Internal Error" : err?.message ?? "";

  res.status(err.status || 500).json({
    message,
  });
};

export const NotFoundError = (
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  res.status(404).json({ message: "Not Found" });
};
