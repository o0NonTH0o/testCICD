export type UserRole = 
  | 'STUDENT'
  | 'HEAD_OF_DEPARTMENT'
  | 'VICE_DEAN'
  | 'DEAN'
  | 'ADMIN'
  | 'COMMITTEE';

export type UserStatus = 
  | 'PENDING_ONBOARDING'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REJECTED';

export type ApplicationStatus =
  | 'DRAFT'
  | 'PENDING_DEPT_HEAD'
  | 'ACCEPTED_BY_DEPT_HEAD'
  | 'REJECTED_BY_DEPT_HEAD'
  | 'PENDING_VICE_DEAN'
  | 'ACCEPTED_BY_VICE_DEAN'
  | 'REJECTED_BY_VICE_DEAN'
  | 'PENDING_DEAN'
  | 'ACCEPTED_BY_DEAN'
  | 'REJECTED_BY_DEAN'
  | 'PENDING_ADMIN'
  | 'ACCEPTED_BY_ADMIN'
  | 'REJECTED_BY_ADMIN'
  | 'PENDING_COMMITTEE'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_EDIT';

export interface Department {
  id: string;
  name: string;
  facultyId: string;
}

export interface AwardType {
  id: string;
  awardName: string;
  description?: string;
  iconUrl?: string; // e.g. 'trophy' | 'star'
  tags?: string[];
  stats?: {
    totalApplications: number;
    submitted: number;
    pending: number;
  };
}

export interface Campus {
  id: string;
  campusName: string;
  faculties: Faculty[];
}

export interface Faculty {
  id: string;
  facultyName: string;
  campusId: string;
  departments: Department[];
  campus?: Campus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  status: UserStatus;
  
  campusId?: string;
  campus?: Campus;
  
  facultyId?: string;
  departmentId?: string;
  actualId?: string;  // Student ID
  tel?: string;
  faculty?: Faculty;
  department?: Department;
  createdAt?: string;
}

export interface ApprovalLog {
  id: string;
  createdAt: string;
  actor: User;
  action: string;
  step: ApplicationStatus;
  comment?: string;
}

export interface WorkItemAttachment {
  id?: string;
  fileUrl: string;
}

export interface WorkItem {
  id?: string;
  title: string;
  date?: string; // used for UI binding
  awardDate?: string; // used for API
  role?: string;
  organizer?: string;
  competitionName?: string;
  level?: string;
  rank?: string;
  isTeam?: boolean;
  teamName?: string;
  attachments?: WorkItemAttachment[];
}

export interface AwardApplication {
  id: string;
  createdAt: string;
  status: ApplicationStatus;
  user: User; // Applicant
  typeId: string;
  
  // Personal Info snapshots (Optional/Virtual)
  title?: string;
  firstName?: string;
  lastName?: string;
  studentId?: string;
  faculty?: string;
  department?: string;
  gpax?: string;
  phone?: string;
  email?: string;
  advisor?: string;
  address?: string;

  // Files
  transcriptFile?: string;
  applicationFile?: string;

  // Relations
  workItems: WorkItem[];
  approvalLogs: ApprovalLog[];
  awardType?: AwardType;
  
  academicYear?: string;
  semester?: string;
}

export interface CreateApplicationInput {
  typeId: string;
  
  // Personal Info
  title: string;
  firstName: string;
  lastName: string;
  studentId: string;
  faculty: string;
  department: string;
  major: string;
  year: string;
  gpa: string;
  phone: string;
  email: string;
  advisor: string;
  address: string;
  gpax: string; // Ensure consistency
  tel: string;

  // Files
  transcriptFile?: string;
  applicationFile?: string;

  // Work Items
  workItems: WorkItem[];
}
