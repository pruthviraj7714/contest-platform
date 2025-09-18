import { Router } from "express";
import { AuhtSchema } from "@repo/common";
import prisma from "@repo/db";
import transporter from "../email/transporter";
import jwt, { type JwtPayload } from "jsonwebtoken";
import {
  ADMIN_JWT_SECRET,
  BACKEND_URL,
  EMAIL_JWT_SECRET,
  FROM_EMAIL_ADDRESS,
  FRONTEND_URL,
  USER_JWT_SECRET,
} from "../config";

const userRouter = Router();

userRouter.post("/auth/magic-login", async (req, res) => {
  try {
    const { data: email, success } = AuhtSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Validation Failed",
      });
      return;
    }

    const user = await prisma.user.upsert({
      where: {
        email,
      },
      update: {},
      create: {
        email,
        role: "USER",
      },
    });

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      EMAIL_JWT_SECRET,
      { expiresIn: "15m" }
    );

    if (process.env.NODE_ENV === "production") {
      await transporter.sendMail({
        from: `"Contest Platform Support" <${FROM_EMAIL_ADDRESS}>`,
        to: email,
        subject: "Your Secure Sign-In Link",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <title>Welcome</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <h2 style="color: #111827; margin-bottom: 20px;">Welcome to Contest Platform</h2>
                    <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
                      Click the button below to securely access your dashboard.
                    </p>
                    <a href="${BACKEND_URL}/api/v1/user/auth/post?token=${token}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Go to Dashboard
                    </a>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                      If you didn’t request this email, you can safely ignore it.
                    </p>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
    } else {
      console.log(
        `click here to login : ${BACKEND_URL}/api/v1/user/auth/post?token=${token}`
      );
    }
    res.status(200).json({
      message: "Email Successfully Sent for Verification!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

userRouter.get("/auth/post", async (req, res) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({
        message: "Missing Token",
      });
      return;
    }

    const decoded = jwt.verify(token, EMAIL_JWT_SECRET) as JwtPayload;

    const { email, role } = decoded;

    const user = await prisma.user.findUnique({
      where: {
        email,
        role,
      },
    });

    if (!user) {
      res.status(400).json({
        message: "No User with given email found!",
      });
      return;
    }

    const appJWT = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      user.role === "ADMIN" ? ADMIN_JWT_SECRET : USER_JWT_SECRET
    );

    res.cookie("authToken", appJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    });

    if (role === "USER") {
      const redirectLink = user.username
        ? `${FRONTEND_URL}/dashboard`
        : `${FRONTEND_URL}/set-username`;
      return res.redirect(redirectLink);
    } else {
      return res.redirect(`${FRONTEND_URL}/admin-dashboard`);
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default userRouter;
