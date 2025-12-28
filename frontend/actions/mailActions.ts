"use server";

import { fetchAPIServer } from "@/lib/fetch-api-server";

export async function sendMailSingle(formData: FormData) {
  try {
    const response = await fetchAPIServer({
      url: "/mail/send",
      method: "POST",
      body: formData,
      throwOnError: true,
      requireAuth: true,
    });
    return {
      success: true,
      message: response.message ?? "Mail sent successfully",
    };
  } catch (error) {
    console.error("Error sending mail:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "failed to send mail error",
    };
  }
}
