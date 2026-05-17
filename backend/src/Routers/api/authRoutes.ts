import { Router } from 'express';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  createAdmin, 
  requestPasswordReset, 
  verifyPasswordResetOtp, 
  resetPasswordWithOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  convertGuestToUser
} from '../../Controllers/authController';
import { 
  registrationValidation, 
  loginValidation, 
  requestResetValidation, 
  verifyOtpValidation, 
  resetPasswordValidation,
  verifyRegistrationOtpValidation,
  resendRegistrationOtpValidation,
  convertGuestToUserValidation
} from '../../middlewares/validation';
import { authenticateToken, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

// Registration and Email Verification
router.post('/register', registrationValidation, register);
router.post('/verify-email', verifyRegistrationOtpValidation, verifyRegistrationOtp);
router.post('/resend-verification', resendRegistrationOtpValidation, resendRegistrationOtp);

// Authentication
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', authenticateToken, logout);
router.post('/create-admin', authenticateToken, requireRole(['superadmin']), registrationValidation, createAdmin);

// Password Reset
router.post('/password/forgot', requestResetValidation, requestPasswordReset);
router.post('/password/verify-otp', verifyOtpValidation, verifyPasswordResetOtp);
router.post('/password/reset', resetPasswordValidation, resetPasswordWithOtp);

// Guest User Account Creation
router.post('/guest/create-account', convertGuestToUserValidation, convertGuestToUser);

export default router; 