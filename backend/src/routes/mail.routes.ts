import {
  bulkMailSender,
  getMailHistory,
  sendMail,
} from "@/controllers/mail.controller.ts";
import { isAuthenticated } from "@/middlewares/auth.ts";
import { multerUpload } from "@/utils/multer.ts";
import express, { Router } from "express";

const router: Router = express.Router();

router.use(isAuthenticated);
router.post("/send", multerUpload.array("files", 15), sendMail);
router.get("/history", getMailHistory);
router.post("/bulk-send", multerUpload.array("files", 15), bulkMailSender);

export default router;
