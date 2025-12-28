import { COOKIE_NAME, JWT_SECRET } from "@/config/config.ts";
import { AsyncHandler } from "@/middlewares/error.ts";
import { prisma } from "@/utils/db.ts";
import ErrorHandler from "@/utils/errorHandler.ts";
import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const register = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(new ErrorHandler(400, "Please provide all fields"));
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return next(new ErrorHandler(409, "User with this email already exists"));
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hash,
      },
    });


    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  }
);

export const login = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler(400, "Please provide all fields"));
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return next(new ErrorHandler(401, "Invalid credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler(401, "Invalid credentials"));
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  }
);

export const logout = AsyncHandler(async (req: Request, res: Response) => {
  return res
    .status(200)
    .cookie(COOKIE_NAME, "", {
      httpOnly: true,
      secure: true,
      maxAge: 0,
    })
    .json({
      success: true,
      message: "Logged Out Successfully!",
    });
});

export const getMyProfile = AsyncHandler(
  async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: {
        user,
      },
    });
  }
);
