import { body } from 'express-validator';

export const registrationValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const requestResetValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
];

export const verifyOtpValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('otp')
    .customSanitizer((v) => String(v))
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only digits'),
];

export const resetPasswordValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('otp')
    .customSanitizer((v) => String(v))
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
]; 

export const verifyRegistrationOtpValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('otp')
    .customSanitizer((v) => String(v))
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only digits'),
];

export const resendRegistrationOtpValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
];

export const convertGuestToUserValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
]; 