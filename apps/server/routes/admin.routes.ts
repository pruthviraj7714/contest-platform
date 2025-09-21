import { Router } from "express";
import adminMiddlware from "../middlewares/adminMiddleware";
import { ContestSchema, EditContestSchema } from "@repo/common";
import prisma from "@repo/db";

const adminRouter = Router();

adminRouter.post("/contest", adminMiddlware, async (req, res) => {
  try {
    const adminId = req.adminId;

    if (!adminId) {
      res.status(401).json({
        message: "Unauthorized Admin",
      });
      return;
    }

    const { data, success, error } = ContestSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Validation errors",
        errors: error.message,
      });
      return;
    }

    const { challenges, description, endTime, startTime, title } = data;

    const contest = await prisma.contest.create({
      data: {
        description,
        endTime,
        startTime,
        title,
        adminId,
        challenges: {
          create: challenges.map((c) => ({
            index: c.index,
            title: c.title,
            description: c.description,
            startTime: c.startTime,
            endTime: c.endTime,
            notionDocId: c.notionDocId,
            maxPoints: c.maxPoints,
          })),
        },
      },
    });

    res.status(201).json({
      message: "Contest Successfully Created!",
      id: contest.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

adminRouter.get("/contests", adminMiddlware, async (req, res) => {
  try {
    const adminId = req.adminId;

    if (!adminId) {
      res.status(401).json({
        message: "Unauthorized Admin",
      });
      return;
    }

    const contests = await prisma.contest.findMany({
      where: {
        adminId,
      },
    });

    res.status(200).json(contests || []);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

adminRouter.get("/contest/:contestId", adminMiddlware, async (req, res) => {
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
        message: "Contest not found",
      });
      return;
    }

    if (contest.adminId !== adminId) {
      res.status(403).json({
        message: "You are not authorized to access this contest",
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

adminRouter.delete("/contest/:contestId", adminMiddlware, async (req, res) => {
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
        message: "Contest not found",
      });
      return;
    }

    if (contest.adminId !== adminId) {
      res.status(403).json({
        message: "You are not authorized to access this contest",
      });
      return;
    }

    await prisma.contest.delete({
      where: {
        id: contest.id,
      },
    });

    res.status(200).json({
      message: "Contest Successfully Removed",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

adminRouter.put("/contest/:contestId", adminMiddlware, async (req, res) => {
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
        message: "Contest not found",
      });
      return;
    }

    if (contest.adminId !== adminId) {
      res.status(403).json({
        message: "You are not authorized to access this contest",
      });
      return;
    }

    const { data, success, error } = EditContestSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Invalid Contest Data",
        errors: error.message,
      });
      return;
    }

    if (new Date(contest.endTime).getTime() <= Date.now()) {
      res.status(409).json({
        message: "Contest Already Ended You Can't make Changes Now",
      });
      return;
    }

    const current = Date.now();

    if (
      current >= new Date(contest.startTime).getTime() &&
      current <= new Date(contest.endTime).getTime()
    ) {
      res.status(409).json({
        message: "Contest already started, you can't make changes now",
      });
      return;
    }

    const { challenges, description, endTime, id, startTime, title } = data;

    await prisma.$transaction(async (tx) => {
      await tx.contest.update({
        where: {
          id: contestId,
        },
        data: {
          title,
          startTime,
          description,
          endTime,
        },
      });

      await tx.challenge.deleteMany({
        where: {
          contestId,
        },
      });

      await tx.challenge.createMany({
        data: challenges.map((c) => ({
          index: c.index,
          title: c.title,
          description: c.description,
          startTime: c.startTime,
          endTime: c.endTime,
          notionDocId: c.notionDocId,
          maxPoints: c.maxPoints,
          contestId,
        })),
      });
    });

    res.status(200).json({
      message: "Contest Data Successfully Updated",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default adminRouter;
