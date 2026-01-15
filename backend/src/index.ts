import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { errorMiddleware } from "./middlewares/error";
import userRouter from "./routes/user.routes"
import chatRouter from "./routes/chat.routes"
import formRouter from "./routes/form.routes"
import mailRouter from "./routes/mail.routes"
dotenv.config({
  debug: true,
});
const app = express();

export const envMode = process.env.NODE_ENV?.trim() || "DEVELOPMENT";
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL!,
      "http://localhost:3000",
      "https://nexora.krishnat.dev"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(morgan("dev"));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/mail", mailRouter);
app.use("/api/v1/chat" , chatRouter)
app.use("/api/v1/form", formRouter);


app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "server is healthy !!",
  });
});

app.use(errorMiddleware);
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
