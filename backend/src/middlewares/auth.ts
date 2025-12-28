import { AsyncHandler } from "./error.ts";
import ErrorHandler from "@/utils/errorHandler.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { COOKIE_NAME, JWT_SECRET } from "@/config/config.ts";
import type { NextFunction, Request, Response } from "express";

export const isAuthenticated = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[COOKIE_NAME];
    if (!token)
      return next(new ErrorHandler(401, "Please login to access this route"));

    const decodedToken = jwt.verify(token, JWT_SECRET);

    req.user = (decodedToken as JwtPayload).id;
    next();
  }
);
