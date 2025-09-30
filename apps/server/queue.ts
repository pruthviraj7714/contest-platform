import { Queue } from "bullmq";
import redisclient from '@repo/redisclient';

const contestQueue = new Queue("contest-queue", {
    connection : redisclient
});

export default contestQueue;