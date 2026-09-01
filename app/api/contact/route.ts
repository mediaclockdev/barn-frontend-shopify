import { NextResponse } from "next/server";
import { rateLimit } from "@/src/lib/rate-limit";
import { z } from "zod";

const limiter = rateLimit({ interval: 60_000 });

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").regex(/^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$/, "Invalid Australian phone number"),
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

    // Read SendGrid config from environment
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const TO_EMAIL = process.env.CONTACT_FORM_TO_EMAIL || "barn@gmail.com";
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@thebarnpet-dev.myshopify.com";

    if (!SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY is not set. Simulating successful form submission.");
      return NextResponse.json({
        success: true,
        message: "Message sent successfully (Simulated)",
      });
    }

    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message || "No message provided."}</p>
    `;

    const sendgridRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: TO_EMAIL }],
            subject: `New Contact Request from ${name}`,
          },
        ],
        from: { email: FROM_EMAIL },
        reply_to: { email: email },
        content: [
          {
            type: "text/html",
            value: emailHtml,
          },
        ],
      }),
    });

    if (!sendgridRes.ok) {
      const errorData = await sendgridRes.text();
      console.error("SendGrid API Error:", errorData);
      throw new Error("Failed to send email via SendGrid");
    }

    console.log(`✅ Contact form email successfully sent to [${TO_EMAIL}] (Reply-To: [${email}]) via SendGrid!`);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error: any) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message. Please try again later.",
      },
      { status: 500 },
    );
  }
}
