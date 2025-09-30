import type { NextFunction, Request, Response } from "express";
import { verify, type JwtPayload } from "jsonwebtoken";
import { USER_JWT_SECRET } from "../config";

const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authToken = req.cookies.authToken;

    if (!authToken) {
      res.status(400).json({
        messag: "Missing Token",
      });
      return;
    }

    const user = verify(authToken, USER_JWT_SECRET) as JwtPayload;

    req.userId = user.sub;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized User",
    });
  }
};

export default userMiddleware;
