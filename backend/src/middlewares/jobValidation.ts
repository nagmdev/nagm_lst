import { body } from 'express-validator';

export const createJobValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('responsibilities').notEmpty().withMessage('Responsibilities are required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('requirements').optional().isArray().withMessage('Requirements must be an array'),
  body('salaryMin').optional().isFloat({ min: 0 }).withMessage('Minimum salary must be a positive number'),
  body('salaryMax').optional().isFloat({ min: 0 }).withMessage('Maximum salary must be a positive number'),
  body('employmentType').optional().isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).withMessage('Invalid employment type'),
];

export const updateJobStatusValidation = [
  body('status').isIn(['PENDING', 'APPROVED', 'REJECTED', 'CLOSED']).withMessage('Invalid status'),
];

export const applicationValidation = [
  body('expectedSalary').isFloat({ min: 0 }).withMessage('Expected salary must be a positive number'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('experienceYears').isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
];

export const guestApplicationValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('expectedSalary').isFloat({ min: 0 }).withMessage('Expected salary must be a positive number'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('experienceYears').isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
];

export const updateApplicationStatusValidation = [
  body('status').isIn(['NEW', 'REVIEWED', 'INTERVIEW', 'REJECTED']).withMessage('Invalid application status'),
];

