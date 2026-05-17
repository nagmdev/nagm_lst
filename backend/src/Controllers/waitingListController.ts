import { Request, Response } from "express";
import prisma from "../config/prismaClient";
import transporter from "../config/emailConfig";

export const registerUserToWaitingList = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Add to the waiting list
    const newUser = await prisma.watinglist.create({
      data: {
        email,
        isWaiting: true,
      },
    });

    // HTML Email Template
    const mailOptions = {
      from: process.env.EMAIL_USER as string,
      to: email,
      subject: "🎉 Welcome to the STARJOBS Waiting List!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f8f8f8; border-radius: 10px; text-align: center;">
          <h2 style="color: #333;">🎉 Welcome to STARJOBS!</h2>
          <p style="font-size: 16px; color: #555;">Thank you for joining our waitlist. We're excited to have you onboard! 🚀</p>
          
          <div style="margin: 20px 0; padding: 15px; background: #fff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 14px; color: #777;">We'll notify you as soon as we launch. Stay tuned for exclusive updates!</p>
          </div>

          <a href="https://starjobs.com" style="display: inline-block; padding: 12px 24px; background: #ffbe42; color: #fff; font-weight: bold; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Visit Our Website
          </a>

          <p style="font-size: 14px; color: #999; margin-top: 20px;">Need help? Contact us at <a href="mailto:support@starjobs.com" style="color: #007BFF;">support@starjobs.com</a></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({ message: "Successfully registered", user: newUser });
  } catch (error: any) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
