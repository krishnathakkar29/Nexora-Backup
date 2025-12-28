import { AsyncHandler } from "@/middlewares/error.ts";
import {
  convertToAscii,
  embedDocument,
  getContext,
  prepareDocument,
} from "@/utils/chatpdf-helper.ts";
import { prisma } from "@/utils/db.ts";
import ErrorHandler from "@/utils/errorHandler";
import { getPineconeClient } from "@/utils/pinecone.ts";
import { s3Upload } from "@/utils/s3.ts";
import { type PDFPage } from "@/utils/types.ts";
import { GoogleGenAI } from "@google/genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const genAI = new GoogleGenAI({
  apiKey: process.env.API_KEY!,
});

export const getChatPdfs = AsyncHandler(async (req, res) => {
  const user = req.user;

  const chatPdfs = await prisma.chatPdf.findMany({
    where: {
      userId: user,
    },
    include: {
      _count: true,
    },
  });

  return res.status(200).json({
    status: true,
    message: "Chat PDFs fetched successfully.",
    data: chatPdfs,
  });
});

export const uploadPdfToS3 = AsyncHandler(async (req, res, next) => {
  const file = req.file as Express.Multer.File;
 
  const uploadedFile: {
    fileKey: string;
    fileName: string;
    url: string;
  } = await s3Upload(file);

  // const file_name = await s3Download(uploadedFile.fileKey);
  // console.log("file_name", file_name);

  // if (!file_name) {
  //   return next(new ErrorHandler(500, "Failed to download file from S3"));
  // }

  // const loader = new PDFLoader(file_name as string);
  const blob = new Blob([new Uint8Array(file.buffer)]);
  const loader = new PDFLoader(blob);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. vectorise and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = await client.index("nexi");
  const namespace = pineconeIndex.namespace(
    convertToAscii(uploadedFile.fileKey)
  );

  // console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);

  // 5. save to db
  const chatPdfDoc = await prisma.chatPdf.create({
    data: {
      pdfUrl: uploadedFile.url,
      pdfName: uploadedFile.fileName,
      fileKey: uploadedFile.fileKey,
      userId: req.user,
    },
  });
  
  return res.status(200).json({
    status: true,
    message: "PDF uploaded successfully.",
    data: {
      chatDoc: chatPdfDoc,
    },
  });
});

export const getChat = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler(400, "Chat ID is required"));
  }

  const chat = await prisma.chatPdf.findUnique({
    where: {
      id,
    },
    include: {
      chatMessage: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          role: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!chat) {
    return next(new ErrorHandler(404, "Chat not found"));
  }

  return res.status(200).json({
    status: true,
    message: "Chat fetched successfully.",
    data: {
      chat,
    },
  });
});

export const getAllChats = AsyncHandler(async (req, res) => {
  const chats = await prisma.chatPdf.findMany({
    where: {
      userId: req.user,
    },
  });

  return res.status(200).json({
    status: true,
    message: "Chats fetched successfully.",
    data: {
      chats,
    },
  });
});

export const replyMessage = AsyncHandler(async (req, res, next) => {

  const { message, chatId } = await req.body;
  const chat = await prisma.chatPdf.findUnique({
    where: {
      id: chatId,
    },
    include: {
      chatMessage: true,
    },
  });

  if (!chat) {
    return next(new ErrorHandler(404, "Chat not found"));
  }
  const fileKey = chat.fileKey;

  const lastMessage = message;

  const context = await getContext(lastMessage, fileKey);

  const prompt = `
        AI assistant is a brand new, powerful, human-like artificial intelligence.
        The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind, and inspiring, and is eager to provide vivid and thoughtful responses to the user.
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
        User: ${lastMessage}
        `;

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const aiResponse = await result.text;


  await prisma.chatMessage.create({
    data: {
      chatPdfId: chatId,
      content: lastMessage,
      role: "USER",
    },
  });

  await prisma.chatMessage.create({
    data: {
      chatPdfId: chatId,
      content: aiResponse ?? "",
      role: "SYSTEM",
    },
  });
  return res.status(200).json({
    status: true,
    message: "Message replied successfully.",
    data: {
      reply: aiResponse,
    },
  });
});
