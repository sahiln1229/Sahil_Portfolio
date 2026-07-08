import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields.",
        },
        { status: 400 }
      );
    }

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