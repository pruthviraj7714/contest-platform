import prisma from "@repo/db";
import { Router } from "express";

const contestRouter = Router();

contestRouter.get("/", async (req, res) => {
  try {
    const contests = await prisma.contest.findMany();

    res.status(200).json(contests || []);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

contestRouter.get("/:contestId", async (req, res) => {
  try {
    const constestId = req.params.contestId;

    const contest = await prisma.contest.findUnique({
      where: {
        id: constestId,
      },
    });

    if (!contest) {
      res.status(401).json({
        message: "Contest With Given Id not found!",
      });
      return;
    }

    res.status(200).json(contest);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});


export default contestRouter;
