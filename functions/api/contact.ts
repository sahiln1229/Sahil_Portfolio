import { Resend } from "resend";

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function onRequestPost(context: {
  request: Request;
  env: {
    RESEND_API_KEY?: string;
  };
}) {
  try {
    const body = (await context.request.json()) as ContactBody;
    const { name, email, subject, message } = body;

    if (!context.env.RESEND_API_KEY) {
      return Response.json(
        {
          success: false,
          error: "Missing RESEND_API_KEY.",
        },
        { status: 500 }
      );
    }

    if (!name || !email || !subject || !message) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields.",
        },
        { status: 400 }
      );
    }

    const resend = new Resend(context.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: "sahilnarkar.dev@gmail.com",
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr>
        <p>${message}</p>
      `,
    });

    return Response.json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}