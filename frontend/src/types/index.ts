export type Role = 'ADMIN' | 'USER';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export type AnnouncementPriority = 'IMPORTANT' | 'MEETING' | 'NOTICE' | 'GENERAL';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  designation?: string | null;
  rollNumber?: string | null;
  avatar?: string | null;
  teamId?: string | null;
  team?: Team | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  leadId?: string | null;
  lead?: {
    id: string;
    name: string;
    email: string;
    designation?: string | null;
    rollNumber?: string | null;
  } | null;
  members?: User[];
  memberCount?: number;
  avgProgress?: number;
  currentTask?: Task | null;
  tasksCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  dueDate?: string | null;
  completedAt?: string | null;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    rollNumber?: string | null;
    designation?: string | null;
  };
  createdById?: string | null;
  createdBy?: {
    id: string;
    name: string;
  } | null;
  teamId?: string | null;
  team?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  expiryDate?: string | null;
  isReposted: boolean;
  originalId?: string | null;
  authorId: string;
  author?: {
    id: string;
    name: string;
    role: string;
  };
  attachment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    rollNumber?: string | null;
    designation?: string | null;
    team?: { id: string; name: string } | null;
  };
  date: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  status: AttendanceStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    rollNumber?: string | null;
    team?: { id: string; name: string } | null;
  };
  leaveDate: string;
  reason: string;
  description?: string | null;
  status: LeaveStatus;
  reviewedById?: string | null;
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardData {
  stats: {
    totalMembers: number;
    teamsCount: number;
    presentToday: number;
    presentPercentage: string;
    lateToday: number;
    latePercentage: string;
    openTasks: number;
    dueThisWeek: number;
    pendingLeaves: number;
  };
  teamsOverview: Array<{
    id: string;
    code: string;
    name: string;
    leadName: string;
    memberCount: number;
    progress: number;
  }>;
  latestAnnouncements: Announcement[];
  attendanceThisWeek: Array<{
    day: string;
    percentage: number;
  }>;
  tasksNeedingAttention: Array<{
    id: string;
    title: string;
    teamName: string;
    dueText: string;
    status: string;
    rawStatus: string;
  }>;
}

export interface UserDashboardData {
  stats: {
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    completionRate: number;
    monthlyAttendanceRate: number;
    todayAttendanceStatus: string;
    checkInTime?: string | null;
    checkOutTime?: string | null;
  };
  tasks: Task[];
  todayAttendance?: Attendance | null;
  latestAnnouncements: Announcement[];
  recentLeaves: LeaveRequest[];
}
