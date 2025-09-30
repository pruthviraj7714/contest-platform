import { Router } from "express";
import adminMiddlware from "../middlewares/adminMiddleware";
import {
  ChallangeSchema,
  ContestSchema,
  EditChallangeSchema,
  EditContestSchema,
} from "@repo/common";
import prisma from "@repo/db";
import verifyAdminContestOwnership from "../middlewares/verifyAdminContestOwnership";

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

    const { description, endTime, startTime, title } = data;

    const contest = await prisma.contest.create({
      data: {
        description,
        endTime,
        startTime,
        title,
        adminId,
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
      include : {
        _count : {
          select : {
            challenges : true
          }
        }
      }
    });

    res.status(200).json(contests || []);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

adminRouter.get(
  "/contest/:contestId",
  adminMiddlware,
  verifyAdminContestOwnership,
  async (req, res) => {
    try {
      res.status(200).json(req.contest);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

adminRouter.delete(
  "/contest/:contestId",
  adminMiddlware,
  verifyAdminContestOwnership,
  async (req, res) => {
    try {
      const contest = req.contest;

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
  }
);

adminRouter.put("/contest/:contestId", adminMiddlware, verifyAdminContestOwnership, async (req, res) => {
  try {
    const contest = req.contest;

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

    const { description, endTime, startTime, title } = data;

    await prisma.$transaction(async (tx) => {
      await tx.contest.update({
        where: {
          id: contest.id,
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
          contestId: contest.id,
        },
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

adminRouter.post(
  "/contest/:contestId/challenges",
  adminMiddlware,
  verifyAdminContestOwnership,
  async (req, res) => {
    try {
      const contest = req.contest;

      const { data, success, error } = ChallangeSchema.safeParse(req.body);

      if (!success) {
        res.status(400).json({
          message: "Validation errors",
          errors: error.message,
        });
        return;
      }

      const {
        description,
        endTime,
        index,
        maxPoints,
        notionDocId,
        startTime,
        title,
      } = data;

      const challenge = await prisma.challenge.create({
        data: {
          description,
          title,
          endTime,
          index,
          maxPoints,
          notionDocId,
          startTime,
          contestId: contest.id,
        },
      });

      res.status(201).json({
        message: "challange Successfully Added to Contest",
        id: challenge.id,
      });
    } catch {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

adminRouter.get(
  "/contest/:contestId/challenges/:challangeId",
  adminMiddlware,
  verifyAdminContestOwnership,
  async (req, res) => {
    try {
      const contest = req.contest;
      const challangeId = req.params.challangeId;

      const challenge = await prisma.challenge.findFirst({
        where: {
          id: challangeId,
          contestId: contest.id,
        },
      });

      if (!challenge) {
        res.status(400).json({
          message: "Challenge with given Id not found in this contest",
        });
        return;
      }

      res.status(200).json({
        message: "challange Successfully fetched",
        challenge,
      });
    } catch {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

adminRouter.put(
  "/contest/:contestId/challenges/:challangeId",
  adminMiddlware,
  verifyAdminContestOwnership,
  async (req, res) => {
    try {
      const challangeId = req.params.challangeId;
      const contest = req.contest;

      const { data, success, error } = EditChallangeSchema.safeParse(req.body);

      if (!success) {
        res.status(400).json({
          message: "Validation errors",
          errors: error.message,
        });
        return;
      }

      const {
        description,
        endTime,
        index,
        maxPoints,
        notionDocId,
        startTime,
        title,
      } = data;

      const challenge = await prisma.challenge.update({
        where: {
          id: challangeId,
        },
        data: {
          description,
          title,
          endTime,
          index,
          maxPoints,
          notionDocId,
          startTime,
        },
      });

      res.status(200).json({
        message: "challange Successfully Updated",
        id: challenge.id,
      });
    } catch {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

adminRouter.delete(
  "/contest/:contestId/challenges/:challangeId",
  adminMiddlware,
  verifyAdminContestOwnership,
  async (req, res) => {
    try {
      const contest = req.contest;

      const { challangeId } = req.params;

      const challenge = await prisma.challenge.findFirst({
        where: {
          id: challangeId,
          contestId: contest.id,
        },
      });

      if (!challenge) {
        res.status(404).json({
          message: "Challenge with given Id not found in given contest",
        });
        return;
      }

      await prisma.challenge.delete({
        where: {
          id: challangeId,
        },
      });

      res.status(200).json({
        message: "challange Deleted Successfully",
        id: challenge.id,
      });
    } catch {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

adminRouter.get(
  "/contests/:contestId/submissions",
  adminMiddlware,
  verifyAdminContestOwnership,
  async (req, res) => {
    try {
      const contest = req.contest;

      const submissions = await prisma.submission.findMany({
        where: {
          challenge: {
            contestId: contest.id,
          },
        },
        include: {
          challenge: true,
        },
      });

      res.status(200).json(submissions || []);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

adminRouter.get(
  "/contests/:contestId/leaderboard",
  adminMiddlware,
  verifyAdminContestOwnership,
  async (req, res) => {
    try {
      const contest = req.contest;

      const leaderboards = await prisma.leaderboard.findMany({
        where: {
          contestId : contest.id,
        },
        orderBy: {
          rank: "asc",
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

      res.status(200).json(leaderboards || []);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

export default adminRouter;
