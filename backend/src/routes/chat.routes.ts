import {
  getAllChats,
  getChat,
  getChatPdfs,
  replyMessage,
  uploadPdfToS3,
} from "@/controllers/chat.controller";
import { isAuthenticated } from "@/middlewares/auth";
import { multerUpload } from "@/utils/multer";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/message", replyMessage);

router.use(isAuthenticated);
router.get("/pdfs", getChatPdfs);
router.post("/upload", multerUpload.single("file"), uploadPdfToS3);
router.get("/all", getAllChats);
router.get("/:id", getChat);

export default router;
