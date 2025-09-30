import type { NextFunction, Request, Response } from "express";
import { ADMIN_JWT_SECRET } from "../config";
import { verify, type JwtPayload } from "jsonwebtoken";

const adminMiddlware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authToken = req.cookies.authToken;

    if (!authToken) {
        return res.status(401).json({
          message: "Missing token",
        });
      }

    const payload = verify(authToken, ADMIN_JWT_SECRET) as JwtPayload;

    if (payload.role !== "ADMIN") {
      res.status(401).json({
        message: "Unauthorized Admin",
      });
      return;
    }

    req.adminId = payload.id;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized Admin",
    });
  }
};

export default adminMiddlware;
