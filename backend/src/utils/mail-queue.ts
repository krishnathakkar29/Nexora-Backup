import { Queue } from "bullmq";
import "dotenv/config";
import IORedis from "ioredis";
export const mailQueueName = "emailQueue";

export const REDIS_HOST = process.env.REDIS_HOST!;
export const REDIS_PORT = process.env.REDIS_PORT!;

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
    delay: 5000,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
