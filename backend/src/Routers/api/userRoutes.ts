import { Router } from 'express';
import { 
  getProfile, 
  getAdminData, 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  deleteUser, 
  getSystemStats,
  updateProfile,
} from '../../Controllers/UserController';
import { authenticateToken, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

// User routes
router.get('/profile', authenticateToken, getProfile);
router.put('/update', authenticateToken, updateProfile);

// Admin routes (all require superadmin role)
router.get('/admin', authenticateToken, requireRole(['superadmin']), getAdminData);
router.get('/admin/users', authenticateToken, requireRole(['superadmin']), getAllUsers);
router.get('/admin/users/:id', authenticateToken, requireRole(['superadmin']), getUserById);
router.put('/admin/users/:id/role', authenticateToken, requireRole(['superadmin']), updateUserRole);
router.delete('/admin/users/:id', authenticateToken, requireRole(['superadmin']), deleteUser);
router.get('/admin/stats', authenticateToken, requireRole(['superadmin']), getSystemStats);

export default router;