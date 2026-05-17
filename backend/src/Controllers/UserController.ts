import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import prisma from '../config/prismaClient';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const userId = req.user?.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

export const getAdminData = (req: Request, res: Response): void => {
  res.json({ message: 'Welcome, superadmin! This is protected data.' });
};

// ===== Admin User Management =====

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', role = '', isGuest = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      whereClause.role = role;
    }
    
    // Filter by guest status
    if (isGuest === 'true') {
      whereClause.password = null; // Guest users have no password
    } else if (isGuest === 'false') {
      whereClause.password = { not: null }; // Regular users have password
    }

    const [usersRaw, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          role: true,
          password: true, // Include to check if guest (null = guest)
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              answers: true,
              atsResults: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    // Map users to include isGuest and displayRole, but exclude password
    const users = usersRaw.map((user: typeof usersRaw[0]) => {
      const isGuest = !user.password;
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        displayRole: isGuest ? 'Guest' : user.role, // Show "Guest" instead of "user" for guests
        isGuest, // Boolean flag for frontend
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        _count: user._count,
      };
    });

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const userRaw = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        password: true, // Include to check if guest
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        answers: {
          select: {
            id: true,
            situation: true,
            task: true,
            action: true,
            result: true,
            createdAt: true,
            question: {
              select: {
                id: true,
                text: true,
                companyName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        atsResults: {
          select: {
            id: true,
            atsScore: true,
            pass: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!userRaw) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Add isGuest and displayRole, exclude password
    const isGuest = !userRaw.password;
    const user = {
      ...userRaw,
      displayRole: isGuest ? 'Guest' : userRaw.role,
      isGuest,
    };
    delete (user as any).password; // Remove password from response

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'hr', 'superadmin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be "user", "hr", or "superadmin"' });
      return;
    }

    // Prevent superadmin from demoting themselves
    // @ts-ignore
    if (req.user?.id === id && role !== 'superadmin') {
      res.status(400).json({ error: 'Cannot demote yourself from superadmin role' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updatedUserRaw = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        password: true, // Include to check if guest
        firstName: true,
        lastName: true,
        updatedAt: true,
      },
    });

    // Add displayRole and isGuest
    const isGuest = !updatedUserRaw.password;
    const updatedUser = {
      id: updatedUserRaw.id,
      email: updatedUserRaw.email,
      role: updatedUserRaw.role,
      displayRole: isGuest ? 'Guest' : updatedUserRaw.role,
      isGuest,
      firstName: updatedUserRaw.firstName,
      lastName: updatedUserRaw.lastName,
      updatedAt: updatedUserRaw.updatedAt,
    };

    res.json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    // @ts-ignore
    if (req.user?.id === id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Delete user and all related data
    await prisma.$transaction(async (tx: PrismaClient) => {
      // Delete ATS results
      await tx.aTSResult.deleteMany({ where: { userId: id } });
      
      // Delete answer revisions
      await tx.answerRevision.deleteMany({
        where: { answer: { userId: id } },
      });
      
      // Delete answers
      await tx.answer.deleteMany({ where: { userId: id } });
      
      // Delete user
      await tx.user.delete({ where: { id } });
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      superAdmins,
      hrUsers,
      regularUsers,
      guestUsers,
      totalAnswers,
      totalAtsResults,
      totalCompanies,
      totalQuestions,
      recentUsersRaw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'superadmin' } }),
      prisma.user.count({ where: { role: 'hr' } }),
      prisma.user.count({ where: { role: 'user', password: { not: null } } }), // Regular users (have password)
      prisma.user.count({ where: { password: null } }), // Guest users (no password)
      prisma.answer.count(),
      prisma.aTSResult.count(),
      prisma.company.count(),
      prisma.question.count(),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          password: true, // Include to check if guest
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Map recent users to include displayRole and isGuest
    const recentUsers = recentUsersRaw.map((user: typeof recentUsersRaw[0]) => {
      const isGuest = !user.password;
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        displayRole: isGuest ? 'Guest' : user.role,
        isGuest,
        createdAt: user.createdAt,
      };
    });

    res.json({
      stats: {
        totalUsers,
        superAdmins,
        hrUsers,
        regularUsers,
        guestUsers, // New: count of guest users
        totalAnswers,
        totalAtsResults,
        totalCompanies,
        totalQuestions,
      },
      recentUsers,
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { firstName, lastName, phone } = req.body;

  if (
    typeof firstName === 'undefined' &&
    typeof lastName === 'undefined' &&
    typeof phone === 'undefined'
  ) {
    res.status(400).json({ error: 'No fields provided for update' });
    return;
  }

  const updateData: Record<string, any> = {};
  if (typeof firstName !== 'undefined') updateData.firstName = firstName;
  if (typeof lastName !== 'undefined') updateData.lastName = lastName;
  if (typeof phone !== 'undefined') updateData.phone = phone;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
