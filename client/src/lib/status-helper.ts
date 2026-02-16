import { ApplicationStatus } from '../types';

/**
 * Returns the Thai label for a given application status.
 */
export const getStatusLabel = (status: ApplicationStatus | string): string => {
  switch (status) {
    case 'DRAFT':
      return 'ฉบับร่าง';
    case 'PENDING_DEPT_HEAD':
      return 'รอหัวหน้าภาควิชาอนุมัติ';
    case 'PENDING_VICE_DEAN':
      return 'รอรองคณบดีอนุมัติ';
    case 'PENDING_DEAN':
      return 'รอคณบดีอนุมัติ';
    case 'PENDING_ADMIN':
      return 'รอกองกิจการนิสิตตรวจสอบ';
    case 'PENDING_COMMITTEE':
      return 'รอคณะกรรมการตรวจสอบ';
    case 'APPROVED':
      return 'อนุมัติแล้ว';
    case 'REJECTED':
      return 'ถูกปฏิเสธ';
    case 'NEEDS_EDIT':
      return 'ต้องแก้ไข';
    default:
      return 'สถานะไม่ระบุ';
  }
};

/**
 * Returns the color classes (Tailwind CSS) for a given application status badge.
 */
export const getStatusColor = (status: ApplicationStatus | string): string => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'NEEDS_EDIT':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

/**
 * Returns the progress percentage (0-100) for a given application status.
 */
export const getProgress = (status: ApplicationStatus | string): number => {
  switch (status) {
    case 'DRAFT':
      return 5;
    case 'PENDING_DEPT_HEAD':
      return 20;
    case 'PENDING_VICE_DEAN':
      return 40;
    case 'PENDING_DEAN':
      return 60;
    case 'PENDING_ADMIN':
      return 70;
    case 'PENDING_COMMITTEE':
      return 80;
    case 'APPROVED':
      return 100;
    case 'REJECTED':
      return 0;
    case 'NEEDS_EDIT':
      return 10;
    default:
      return 0;
  }
};
