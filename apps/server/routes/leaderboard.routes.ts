import { Router } from "express";
import userMiddleware from "../middlewares/userMiddleware";
import prisma from "@repo/db";

const leaderboardRouter = Router();

leaderboardRouter.get("/:contestId", userMiddleware, async (req, res) => {
  try {
    const contestId = req.params.contestId;

    const leaderboards = await prisma.leaderboard.findMany({
      where: {
        contestId,
      },
      orderBy: {
        rank: "asc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      leaderboards,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default leaderboardRouter;
