"use server";

import { fetchAPIServer } from "@/lib/fetch-api-server";
import { cookies } from "next/headers";

export async function register(formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const res = await fetchAPIServer({
      url: "/user/register",
      method: "POST",
      body: {
        username,
        email,
        password,
      },
      throwOnError: false,
      requireAuth: false,
    });


    if (!res.success) {
      throw new Error(res.message);
    }

    (await cookies()).set({
      name: process.env.COOKIE_NAME!,
      value: res.data.token!,
      httpOnly: true,
      maxAge: 24 * 60 * 60,
      path: "/",
      //  secure: process.env.NODE_ENV === 'production',
      // sameSite: 'lax',
    });

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const res = await fetchAPIServer({
      url: "/user/login",
      method: "POST",
      body: { email, password },
      throwOnError: false,
      requireAuth: false,
    });

    if (!res.success) {
      throw new Error(res.message);
    }

    (await cookies()).set({
      name: process.env.COOKIE_NAME!,
      value: res.data.token!,
      httpOnly: true,
      maxAge: 24 * 60 * 60,
      path: "/",
      // secure: process.env.NODE_ENV === 'production',
      // sameSite: 'lax',
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    };
  }
}
