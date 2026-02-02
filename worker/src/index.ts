import { mailQueueName, redisConnection } from "./mail-queue.ts";

import axios from "axios";
import { Job, Worker } from "bullmq";
import cors from "cors";
import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";
import { prisma } from "./db.ts";

const app = express();
const port = process.env.PORT!;
app.use(cors({ origin: process.env.ORIGIN || "*" }));
interface JobData {
  userId: string;
  emailId: string;
  recipient: string;
  subject: string;
  body: string;
  attachmentIds: string[];
  appUsername: string;
  appPassword: string;
}

interface EmailAttachment {
  filename: string;
  content: Buffer;
}

async function downloadAttachment(url: string): Promise<Buffer> {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Failed to download attachment from ${url}:`, error);
    throw new Error(`Failed to download attachment: ${error}`);
  }
}

function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split("/").pop() || "attachment";
    return filename;
  } catch (error) {
    console.log(`Failed to extract filename from URL ${url}:`, error);
    return "attachment";
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const emailWorker = new Worker(
  mailQueueName,
  async (job: Job) => {
    const data = job.data;

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: data.appUsername,
          pass: data.appPassword,
        },
      });

      let emailAttachments: EmailAttachment[] = [];

      if (data.attachmentIds && data.attachmentIds.length > 0) {
        const attachmentPromises = data.attachmentIds.map(
          async (attachmentUrl: string) => {
            try {
              const attachmentBuffer = await downloadAttachment(attachmentUrl);
              const filename = getFilenameFromUrl(attachmentUrl);

              return {
                filename: filename,
                content: attachmentBuffer,
              };
            } catch (attachmentError) {
              console.error(
                `Failed to process attachment ${attachmentUrl}:`,
                attachmentError
              );
              return null; 
            }
          }
        );

        const attachmentResults = await Promise.all(attachmentPromises);
        emailAttachments = attachmentResults.filter(
          (attachment): attachment is EmailAttachment => attachment !== null
        );
      }

      const mailOptions = {
        from: data.appUsername,
        to: data.recipient,
        subject: data.subject,
        html: data.body,
        attachments: emailAttachments.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
        })),
      };

      const info = await transporter.sendMail(mailOptions);

      await delay(500);
    } catch (error) {
      console.error(`Failed to send email for job ${job.id}:`, error);

      try {
        await prisma.emailSent.update({
          where: {
            id: data.emailId,
          },
          data: {
            status: "FAILED",
            sentAt: new Date(),
          },
        });
      } catch (dbError) {
        console.error(
          `Failed to update database for failed email ${data.emailId}:`,
          dbError
        );
      }
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST!,
      password: process.env.REDIS_PASSWORD!,
      port: Number(process.env.REDIS_PORT!),
      username: process.env.REDIS_USERNAME!
    }
  }
);

emailWorker.on("ready", () => {
  console.log("🟢 Worker is ready and waiting for jobs...");
});

emailWorker.on("active", (job) => {
  console.log(`🔄 Processing job ${job.id}`);
});

emailWorker.on("completed", async (job: Job) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const jobData = job.data as JobData;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updatedEmail = await prisma.emailSent.update({
    where: {
      id: jobData.emailId,
    },
    data: {
      status: "DONE",
      sentAt: new Date(),
    },
  });
});
emailWorker.on("failed", async (job: Job | undefined, err: Error) => {
  if (job) {

    const jobData = job.data as JobData;

    try {
      await prisma.emailSent.update({
        where: {
          id: jobData.emailId,
        },
        data: {
          status: "FAILED",
          sentAt: new Date(),
        },
      });
    } catch (dbError) {
      console.error(
        `Failed to update database for failed email ${jobData.emailId}:`,
        dbError
      );
    }
  } else {
    console.log(`Job failed with error: ${err.message}`);
  }
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Worker service is healthy",
  });
});

app.listen(port, () => console.log(` Worker web service running on ${port}`));
