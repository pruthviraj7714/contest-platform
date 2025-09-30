import { Worker } from "bullmq";
import prisma from "@repo/db";
import redisclient from "@repo/redisclient";

const worker = new Worker(
  "contest-status",
  async (job) => {
    const { contestId, challengeId } = job.data;

    switch (job.name) {
      case "ContestStarted": {
        await prisma.contest.update({
          where: {
            id: contestId,
          },
          data: {
            status: "ACTIVE",
          },
        });

        break;
      }

      case "ContestEnded": {
        await prisma.contest.update({
          where: {
            id: contestId,
          },
          data: {
            status: "ENDED",
          },
        });
        break;
      }

      case "ChallengeStarted": {
        await prisma.challenge.update({
          where: {
            id: challengeId,
          },
          data: {
            isActive: true,
          },
        });
        break;
      }

      case "ChallengeEnded": {
        await prisma.challenge.update({
          where: {
            id: challengeId,
          },
          data: {
            isActive: false,
          },
        });
        break;
      }
    }
  },
  { connection: redisclient }
);

worker.on("error", (err) => {
  console.log(err.message);
});

worker.on("completed", (job) => {
  console.log("Contest/Challenge Status Successfully Updated In Db:", job.id);
});
