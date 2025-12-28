import { Queue } from "bullmq";
import "dotenv/config";
import IORedis from "ioredis";

export const mailQueueName = "emailQueue";

export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST!,
  port: Number(process.env.REDIS_PORT!),
  password: process.env.REDIS_PASSWORD!,
  tls: {},
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue(mailQueueName, {
  connection: redisConnection,
  defaultJobOptions: {
    delay: 2000,
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 200,
    },
  },
});
