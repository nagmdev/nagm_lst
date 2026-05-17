import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import prisma from '../config/prismaClient';
import { v4 as uuidv4 } from 'uuid';
import transporter from '../config/emailConfig';

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password, firstName, lastName, phone } = req.body;

  try {
    // Prevent duplicate registration by email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    // Generate OTP for email verification
    const otp = generateSixDigitOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const now = new Date();
    console.log(`[OTP] Registration code for ${email}: ${otp}`);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        status: 'PENDING', // User is pending until email is verified
        isVerified: false,
        otpCode: otp,
        otpExpiresAt: expiresAt,
        lastOtpSentAt: now,
      },
    });

    // Environment-aware behavior
    const isProd = process.env.NODE_ENV === 'production';

    try {
      // Send verification email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email address',
        text: `Your verification code is ${otp}. It expires in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f8f8f8; border-radius: 10px;">
            <h2 style="color: #333;">Verify Your Email Address</h2>
            <p style="font-size: 16px; color: #555;">Thank you for registering! Please verify your email address using the code below:</p>
            <div style="margin: 20px 0; padding: 15px; background: #fff; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 32px; font-weight: bold; color: #007BFF; letter-spacing: 5px; margin: 0;">${otp}</p>
            </div>
            <p style="font-size: 14px; color: #777;">This code expires in <b>15 minutes</b>.</p>
            <p style="font-size: 14px; color: #999; margin-top: 20px;">If you didn't create an account, please ignore this email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error('Failed to send verification email:', mailError);

      // In non-production, surface the error
      if (!isProd) {
        res.status(500).json({
          error: 'Failed to send verification email',
          details: (mailError as Error).message,
          devOtp: otp,
        });
        return;
      }
      // In production, still create user but log error
    }

    if (!isProd) {
      // Help development/testing by logging and returning the OTP
      console.log(`[DEV OTP] Registration OTP for ${email}: ${otp}`);
      res.status(201).json({
        message: 'User registered successfully. Please verify your email.',
        id: user.id,
        email: user.email,
        devOtp: otp,
      });
      return;
    }

    // Production: generic success message
    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification code.',
      id: user.id,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    const message = error?.code === 'P2002' ? 'Email already exists' : 'User registration failed';
    const status = error?.code === 'P2002' ? 409 : 500;
    res.status(status).json({ error: message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    if (!await bcrypt.compare(password, user.password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if user has verified their email
    if (!user.isVerified || user.status === 'PENDING') {
      res.status(403).json({ 
        error: 'Email not verified',
        message: 'Please verify your email address before logging in. Check your email for the verification code.',
        requiresVerification: true,
        verificationEndpoint: '/api/auth/verify-email',
        resendEndpoint: '/api/auth/resend-verification',
        help: 'If you did not receive the email, you can request a new verification code using the resend endpoint.'
      });
      return;
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(200).json({ accessToken, refreshToken, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  if (!token) {
    res.status(401).json({ error: 'Refresh token is required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string; role?: string };
    
    const user = await prisma.user.findFirst({ where: { id: decoded.id, refreshToken: token } });
    if (!user) {
      res.status(403).json({ error: 'Invalid refresh token' });
      return;
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken, role: user.role });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const userId = req.user?.id;
  if (!userId) {
    res.status(400).json({ error: 'User ID not found in token' });
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

// ===== Forgot Password (OTP) =====
const generateSixDigitOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email } = req.body as { email: string };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // For security, do not reveal existence
    if (!user) {
      res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
      return;
    }

    // Check if user is a guest (no password) - this is for account creation
    const isGuest = !user.password;
    
    const otp = generateSixDigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log(`[OTP] ${isGuest ? 'Account creation' : 'Password reset'} code for ${email}: ${otp}`);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: otp, resetOtpExpires: expiresAt },
    });

    // Environment-aware behavior
    const isProd = process.env.NODE_ENV === 'production';

    try {
      // Send appropriate email based on whether user is guest or regular
      const subject = isGuest 
        ? 'Create Your Account - Verification Code'
        : 'Your password reset code';
      
      const html = isGuest
        ? `
          <h2>Create Your Account</h2>
          <p>You've applied for a job with us. Create your account to track your application and receive updates.</p>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>Use this code to set your password and complete your account setup.</p>
        `
        : `<p>Your OTP code is <b>${otp}</b>. It expires in <b>10 minutes</b>.</p>`;
      
      // Try to send the email in ALL environments
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
        html,
      });
    } catch (mailError) {
      console.error('Failed to send reset OTP email:', mailError);

      // In non-production, surface the error so you can debug why email isn't sending
      if (!isProd) {
        res.status(500).json({
          error: 'Failed to send reset OTP email',
          details: (mailError as Error).message,
          devOtp: otp,
          isGuest,
        });
        return;
      }
      // In production, keep behavior generic (do not reveal email existence)
    }

    if (!isProd) {
      // Help development/testing by logging and returning the OTP
      console.log(`[DEV OTP] ${isGuest ? 'Account creation' : 'Password reset'} OTP for ${email}: ${otp}`);
      res.status(200).json({
        message: 'If the email exists, an OTP has been sent.',
        devOtp: otp,
        isGuest, // Indicate if this is for guest account creation
      });
      return;
    }

    // Production: generic success message
    res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
  } catch (error) {
    console.error('requestPasswordReset error:', error);
    // Return generic success to avoid user enumeration
    res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
  }
};

export const verifyPasswordResetOtp = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, otp } = req.body as { email: string; otp: string };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    const isExpired = user.resetOtpExpires.getTime() < Date.now();
    if (isExpired || user.resetOtp !== otp) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    res.status(200).json({ message: 'OTP verified' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

export const resetPasswordWithOtp = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, otp, newPassword } = req.body as { email: string; otp: string; newPassword: string };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    const isExpired = user.resetOtpExpires.getTime() < Date.now();
    if (isExpired || user.resetOtp !== otp) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Check if user is a guest (no password) - converting to regular user
    const isGuest = !user.password;
    
    // Prepare update data
    const updateData: any = {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpires: null,
    };
    
    // Declare verificationOtp outside if block for use in response
    let verificationOtp: string | null = null;
    
    // If guest user, also set up email verification
    if (isGuest) {
      verificationOtp = generateSixDigitOtp();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      updateData.otpCode = verificationOtp;
      updateData.otpExpiresAt = expiresAt;
      updateData.lastOtpSentAt = new Date();
      updateData.status = 'PENDING';
      updateData.isVerified = false;
      
      // Send verification email
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'noreply@example.com',
          to: email,
          subject: 'Verify Your Email - Complete Your Account Setup',
          html: `
            <h2>Welcome! Complete Your Account Setup</h2>
            <p>Thank you for creating an account. Please verify your email address to complete the setup.</p>
            <p>Your verification code is: <strong>${verificationOtp}</strong></p>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          `,
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue even if email fails
      }
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Return appropriate message based on whether it's a guest conversion or password reset
    if (isGuest) {
      const isProd = process.env.NODE_ENV === 'production';
      if (!isProd && verificationOtp) {
        console.log(`[DEV OTP] Verification OTP for ${email}: ${verificationOtp}`);
        res.status(200).json({
          message: 'Account created successfully. Please verify your email.',
          isGuestConversion: true,
          devOtp: verificationOtp,
        });
        return;
      }
      res.status(200).json({
        message: 'Account created successfully. Please check your email for verification code.',
        isGuestConversion: true,
      });
    } else {
      res.status(200).json({ message: 'Password reset successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
}; 

// ===== Email Verification (Registration OTP) =====

export const verifyRegistrationOtp = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, otp } = req.body as { email: string; otp: string };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Check if user exists
    if (!user) {
      res.status(404).json({ 
        error: 'User not found',
        message: 'No account found with this email address. Please register first.'
      });
      return;
    }

    // Check if already verified
    if (user.isVerified && user.status === 'ACTIVE') {
      res.status(200).json({ 
        message: 'Email already verified. You can log in now.',
        alreadyVerified: true
      });
      return;
    }

    // Check if OTP exists
    if (!user.otpCode || !user.otpExpiresAt) {
      res.status(400).json({ 
        error: 'No OTP found',
        message: 'No verification code found. Please request a new verification code.',
        action: 'resend',
        endpoint: '/api/auth/resend-verification'
      });
      return;
    }

    // Check if OTP expired
    const isExpired = user.otpExpiresAt.getTime() < Date.now();
    if (isExpired) {
      res.status(400).json({ 
        error: 'OTP expired',
        message: 'This verification code has expired. Please request a new one.',
        action: 'resend',
        endpoint: '/api/auth/resend-verification'
      });
      return;
    }

    // Check if OTP matches
    if (user.otpCode !== otp) {
      res.status(400).json({ 
        error: 'Invalid OTP',
        message: 'The verification code you entered is incorrect. Please try again or request a new code.'
      });
      return;
    }

    // Verify the user and activate account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        status: 'ACTIVE',
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    res.status(200).json({ 
      message: 'Email verified successfully. You can now log in.',
      verified: true
    });
  } catch (error) {
    console.error('Verify registration OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

export const resendRegistrationOtp = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email } = req.body as { email: string };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // For security, don't reveal if user exists
    if (!user) {
      res.status(200).json({ message: 'If the email exists and is unverified, a new OTP has been sent.' });
      return;
    }

    // If user is already verified, don't send OTP
    if (user.isVerified && user.status === 'ACTIVE') {
      res.status(200).json({ message: 'If the email exists and is unverified, a new OTP has been sent.' });
      return;
    }

    // Rate limiting: Check if OTP was sent recently (within 1 minute)
    if (user.lastOtpSentAt) {
      const timeSinceLastOtp = Date.now() - user.lastOtpSentAt.getTime();
      if (timeSinceLastOtp < 60 * 1000) {
        res.status(429).json({ error: 'Please wait before requesting a new OTP' });
        return;
      }
    }

    // Generate new OTP
    const otp = generateSixDigitOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const now = new Date();
    console.log(`[OTP] Resent registration code for ${email}: ${otp}`);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt,
        lastOtpSentAt: now,
      },
    });

    // Environment-aware behavior
    const isProd = process.env.NODE_ENV === 'production';

    try {
      // Send verification email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email address',
        text: `Your verification code is ${otp}. It expires in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f8f8f8; border-radius: 10px;">
            <h2 style="color: #333;">Verify Your Email Address</h2>
            <p style="font-size: 16px; color: #555;">Please verify your email address using the code below:</p>
            <div style="margin: 20px 0; padding: 15px; background: #fff; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 32px; font-weight: bold; color: #007BFF; letter-spacing: 5px; margin: 0;">${otp}</p>
            </div>
            <p style="font-size: 14px; color: #777;">This code expires in <b>15 minutes</b>.</p>
            <p style="font-size: 14px; color: #999; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error('Failed to send verification email:', mailError);

      if (!isProd) {
        res.status(500).json({
          error: 'Failed to send verification email',
          details: (mailError as Error).message,
          devOtp: otp,
        });
        return;
      }
    }

    if (!isProd) {
      console.log(`[DEV OTP] Resent registration OTP for ${email}: ${otp}`);
      res.status(200).json({
        message: 'If the email exists and is unverified, a new OTP has been sent.',
        devOtp: otp,
      });
      return;
    }

    res.status(200).json({ message: 'If the email exists and is unverified, a new OTP has been sent.' });
  } catch (error) {
    console.error('Resend registration OTP error:', error);
    res.status(200).json({ message: 'If the email exists and is unverified, a new OTP has been sent.' });
  }
}; 

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password, firstName, lastName, phone } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'superadmin', // SuperAdmin can manage platform
        status: 'ACTIVE', // Admin users are auto-verified
        isVerified: true, // Admin users don't need email verification
      },
    });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Admin user creation failed' });
  }
};

// Convert guest user to regular user (set password)
export const convertGuestToUser = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user already has a password (not a guest)
    if (user.password) {
      res.status(400).json({ error: 'User already has an account. Please login instead.' });
      return;
    }

    // Hash password and update user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate OTP for email verification
    const otp = generateSixDigitOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const now = new Date();
    console.log(`[OTP] Verification code for ${email}: ${otp}`);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otpCode: otp,
        otpExpiresAt: expiresAt,
        lastOtpSentAt: now,
        status: 'PENDING', // User needs to verify email
        isVerified: false,
      },
    });

    // Environment-aware behavior
    const isProd = process.env.NODE_ENV === 'production';

    try {
      // Send verification email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        to: email,
        subject: 'Verify Your Email - Complete Your Account Setup',
        html: `
          <h2>Welcome! Complete Your Account Setup</h2>
          <p>Thank you for creating an account. Please verify your email address to complete the setup.</p>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    if (!isProd) {
      // Help development/testing by logging and returning the OTP
      console.log(`[DEV OTP] Verification OTP for ${email}: ${otp}`);
      res.status(200).json({
        message: 'Account created successfully. Please verify your email.',
        id: updatedUser.id,
        email: updatedUser.email,
        devOtp: otp,
      });
      return;
    }

    // Production: generic success message
    res.status(200).json({
      message: 'Account created successfully. Please check your email for verification code.',
      id: updatedUser.id,
      email: updatedUser.email,
    });
  } catch (error: any) {
    console.error('Convert guest to user error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
}; 
