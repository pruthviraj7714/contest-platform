import prisma from "@repo/db";
import type { NextFunction, Request, Response } from "express";

const verifyAdminContestOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = req.adminId;

    if (!adminId) {
      res.status(401).json({
        message: "Unauthorized Admin",
      });
      return;
    }

    const contestId = req.params.contestId as string;

    const contest = await prisma.contest.findFirst({
      where: {
        id: contestId,
        adminId,
      },
    });

    if (!contest) {
      res.status(404).json({
        message: "Contest not found or you don’t own this contest",
      });
      return;
    }

    req.contest = contest;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default verifyAdminContestOwnership;
