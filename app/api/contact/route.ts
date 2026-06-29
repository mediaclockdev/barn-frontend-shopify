import { NextResponse } from "next/server";
import { fetchWcApi } from "@/src/utils/api-client";
import { rateLimit } from "@/src/lib/rate-limit";
import { z } from "zod";

const limiter = rateLimit({ interval: 60_000 });

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const { success } = limiter.check(10, `contact-${ip}`);
  if (!success) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, message: firstError },
        { status: 400 },
      );
    }

    const { name, email, phone, message } = result.data;

    const { data } = await fetchWcApi<{ success: boolean; message: string }>(
      "custom/v1/contact",
      {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message?.trim() || "",
        }),
      },
    );

    return NextResponse.json({
      success: true,
      message: data.message || "Message sent successfully",
    });
  } catch (error: any) {
    console.error("Contact form submission error:", error);

    // Check if it's an internal server error from the WordPress backend
    const errorMessage = error.message || "";
    let friendlyMessage = "Failed to send message. Please try again later.";

    if (
      errorMessage.includes("500") ||
      errorMessage.includes("Internal Server Error")
    ) {
      friendlyMessage =
        "Our servers are currently experiencing issues. Please try again later or email us directly at barn@gmail.com.";
    } else if (errorMessage) {
      // If it's a specific 400 bad request error from the backend with a clear message, we can pass it through,
      // otherwise stick to the friendly fallback.
      friendlyMessage =
        errorMessage.replace(/API Error: \d+ [^-]+ - /, "").trim() ||
        friendlyMessage;
    }

    return NextResponse.json(
      {
        success: false,
        message: friendlyMessage,
      },
      { status: 500 },
    );
  }
}
