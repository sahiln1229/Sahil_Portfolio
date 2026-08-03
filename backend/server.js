import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes("*")) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["POST", "GET", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// Middleware to strip /backend prefix if present (Vercel Services routing fallback)
app.use((req, res, next) => {
  if (req.url.startsWith("/backend")) {
    req.url = req.url.replace(/^\/backend/, "");
    if (req.url === "") req.url = "/";
  }
  next();
});

// Trust proxy for accurate client IP address under reverse proxies (Render, Railway, Cloudflare, etc.)
app.set("trust proxy", 1);

// Rate Limiter: Max 5 submissions per 15 minutes per IP
const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper: Setup Nodemailer Transporter
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("SMTP credentials EMAIL_USER and EMAIL_PASS are not configured.");
  }

  // Use Gmail service preset if it looks like a Gmail address, otherwise use default SMTP settings
  if (user.endsWith("@gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  } else {
    // Generic SMTP host fallback (e.g. custom domain email)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "465", 10),
      secure: process.env.SMTP_SECURE !== "false", // default true
      auth: { user, pass },
    });
  }
};

// Turnstile Token Verification Helper
async function verifyTurnstile(token, ip) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn("WARNING: TURNSTILE_SECRET_KEY is not set. Skipping Cloudflare Turnstile verification.");
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Spam check token is required." };
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    const result = await response.json();
    return { success: result.success, error: result.success ? null : "Spam check validation failed. Please try again." };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return { success: false, error: "Failed to verify spam check. Please try again later." };
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Contact Route
app.post(
  "/api/contact",
  contactRateLimiter,
  [
    body("name").trim().isLength({ min: 3 }).withMessage("Name must be at least 3 characters long.").escape(),
    body("email").trim().isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
    body("subject").trim().isLength({ min: 5 }).withMessage("Subject must be at least 5 characters long.").escape(),
    body("message").trim().isLength({ min: 20 }).withMessage("Message must be at least 20 characters long.").escape(),
  ],
  async (req, res) => {
    // Run express-validator checks
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg, // Return the first error message
      });
    }

    const { name, email, subject, message, turnstileToken } = req.body;
    const visitorIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    const formattedDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) + " (IST)";

    // Verify Turnstile (Spam prevention) if secret key exists
    const turnstileCheck = await verifyTurnstile(turnstileToken, visitorIp);
    if (!turnstileCheck.success) {
      return res.status(400).json({
        success: false,
        error: turnstileCheck.error,
      });
    }

    try {
      const isDemoMode = !process.env.EMAIL_PASS || 
                         process.env.EMAIL_PASS === "your-app-password" || 
                         process.env.EMAIL_USER === "your-email@gmail.com" || 
                         process.env.EMAIL_USER === "sahilnarkar.dev@gmail.com" && process.env.EMAIL_PASS === "your-app-password";
      
      if (isDemoMode) {
        console.log("\n🚀 =================== [DEMO MOCK EMAIL MODE ACTIVE] ===================");
        console.log(`[MOCK EMAIL TO PORTFOLIO OWNER]`);
        console.log(`To: ${process.env.CONTACT_RECEIVER || process.env.EMAIL_USER || "sahilnarkar.dev@gmail.com"}`);
        console.log(`Subject: New Portfolio Contact Request: ${subject}`);
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Message:\n${message}`);
        console.log(`Submitted At: ${formattedDate}`);
        console.log(`IP Address: ${visitorIp}`);
        console.log(`User Agent: ${userAgent}`);
        console.log("----------------------------------------------------------------------");
        console.log(`[MOCK AUTO-REPLY TO VISITOR]`);
        console.log(`To: ${email}`);
        console.log(`Subject: Thank you for contacting Sahil Narkar`);
        console.log(`Body:\nHello ${name},\n\nThank you for reaching out through my portfolio.\n\nI have received your message and will get back to you as soon as possible.\n\nRegards,\nSahil Narkar\nFull Stack Developer`);
        console.log("======================================================================\n");

        return res.status(200).json({
          success: true,
          message: "Demo Mode: Submission logged to server console successfully.",
        });
      }

      const transporter = getTransporter();
      const receiver = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;

      // 1. Send Portfolio Contact Notification to Owner
      const ownerEmailSubject = `New Portfolio Contact Request: ${subject}`;
      const ownerEmailText = `New Portfolio Contact Request

Name:
${name}

Email:
${email}

Subject:
${subject}

Message:
${message}

Submitted At:
${formattedDate}

IP Address:
${visitorIp}

Browser:
${userAgent}`;

      const ownerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-top: 0;">New Portfolio Contact Request</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px; vertical-align: top;">Name:</td>
              <td style="padding: 8px 0; color: #333;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px; vertical-align: top;">Email:</td>
              <td style="padding: 8px 0; color: #333;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px; vertical-align: top;">Subject:</td>
              <td style="padding: 8px 0; color: #333; font-weight: 500;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px; vertical-align: top;">Message:</td>
              <td style="padding: 8px 0; color: #444; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; white-space: pre-wrap; margin-top: 5px; display: block;">${message}</td>
            </tr>
          </table>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          
          <div style="font-size: 12px; color: #6b7280; line-height: 1.6;">
            <p style="margin: 4px 0;"><strong>Submitted At:</strong> ${formattedDate}</p>
            <p style="margin: 4px 0;"><strong>IP Address:</strong> ${visitorIp}</p>
            <p style="margin: 4px 0;"><strong>Browser (User Agent):</strong> ${userAgent}</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
        to: receiver,
        replyTo: email,
        subject: ownerEmailSubject,
        text: ownerEmailText,
        html: ownerEmailHtml,
      });

      console.log(`Successfully sent email from ${name} (${email}) to ${receiver}`);

      // 2. Send Auto-Reply Confirmation to Visitor
      const visitorEmailSubject = "Thank you for contacting Sahil Narkar";
      const visitorEmailText = `Hello ${name},

Thank you for reaching out through my portfolio.

I have received your message and will get back to you as soon as possible.

Regards,
Sahil Narkar
Full Stack Developer`;

      const visitorEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1f2937; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #1e1b4b; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">Sahil Narkar - Portfolio</h2>
          </div>
          <div style="padding: 25px 10px 10px 10px; line-height: 1.6; font-size: 15px;">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for reaching out through my portfolio website.</p>
            <p>I have received your message and will get back to you as soon as possible.</p>
            <br>
            <p style="margin-bottom: 0;">Regards,</p>
            <p style="margin-top: 5px; font-weight: bold; color: #1e1b4b; font-size: 16px; margin-bottom: 2px;">Sahil Narkar</p>
            <p style="margin-top: 0; color: #6b7280; font-size: 14px;">Full Stack Developer</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <div style="text-align: center; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">This is an automated confirmation of your message submission.</p>
            <p style="margin: 5px 0 0 0;">Mumbai, Maharashtra, India</p>
          </div>
        </div>
      `;

      // Try sending the auto-reply, log warning if fails but do not fail the main request since the message was already successfully sent to the owner
      try {
        await transporter.sendMail({
          from: `"Sahil Narkar" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: visitorEmailSubject,
          text: visitorEmailText,
          html: visitorEmailHtml,
        });
        console.log(`Successfully sent auto-reply to visitor: ${email}`);
      } catch (autoReplyError) {
        console.error("Warning: Failed to send auto-reply to visitor:", autoReplyError);
      }

      return res.status(200).json({
        success: true,
        message: "Message sent successfully.",
      });
    } catch (error) {
      console.error("Nodemailer error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to send email. Please try again later.",
      });
    }
  }
);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "An unexpected error occurred.",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
