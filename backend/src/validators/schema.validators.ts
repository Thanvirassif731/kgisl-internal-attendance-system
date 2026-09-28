import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain alphanumeric characters, underscores, dots and hyphens'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
  teamId: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  rollNumber: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  teamId: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  rollNumber: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).default('PENDING'),
  progress: z.number().min(0).max(100).default(0),
  dueDate: z.string().optional().nullable(),
  userId: z.string().optional(), // If not specified, user creates for themselves
  teamId: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
  progress: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional().nullable(),
  userId: z.string().optional(),
  teamId: z.string().optional().nullable(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Message content is required'),
  priority: z.enum(['IMPORTANT', 'MEETING', 'NOTICE', 'GENERAL']).default('IMPORTANT'),
  expiryDate: z.string().optional().nullable(),
  attachment: z.string().optional().nullable(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  priority: z.enum(['IMPORTANT', 'MEETING', 'NOTICE', 'GENERAL']).optional(),
  expiryDate: z.string().optional().nullable(),
});

export const createLeaveRequestSchema = z.object({
  leaveDate: z.string().min(1, 'Leave date is required (YYYY-MM-DD)'),
  reason: z.string().min(2, 'Reason is required'),
  description: z.string().optional().nullable(),
});

export const reviewLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name is required'),
  description: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
});
