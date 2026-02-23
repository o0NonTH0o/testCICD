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
    case 'ACCEPTED_BY_DEPT_HEAD':
      return 'หัวหน้าภาควิชาอนุมัติแล้ว';
    case 'REJECTED_BY_DEPT_HEAD':
      return 'หัวหน้าภาควิชาปฏิเสธ';

    case 'PENDING_VICE_DEAN':
      return 'รอรองคณบดีอนุมัติ';
    case 'ACCEPTED_BY_VICE_DEAN':
      return 'รองคณบดีอนุมัติแล้ว';
    case 'REJECTED_BY_VICE_DEAN':
      return 'รองคณบดีปฏิเสธ';

    case 'PENDING_DEAN':
      return 'รอคณบดีอนุมัติ';
    case 'ACCEPTED_BY_DEAN':
      return 'คณบดีอนุมัติแล้ว';
    case 'REJECTED_BY_DEAN':
      return 'คณบดีปฏิเสธ';

    case 'PENDING_ADMIN':
      return 'รอกองกิจการนิสิตตรวจสอบ';
    case 'ACCEPTED_BY_ADMIN':
      return 'กองกิจการนิสิตอนุมัติแล้ว';
    case 'REJECTED_BY_ADMIN':
      return 'กองกิจการนิสิตปฏิเสธ';

    case 'PENDING_COMMITTEE':
      return 'รอคณะกรรมการตรวจสอบ';
    case 'APPROVED':
      return 'อนุมัติแล้ว';
    case 'REJECTED':
      return 'คณะกรรมการปฏิเสธ';

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
    case 'DRAFT':
      return 'bg-gray-100 text-gray-700 border-gray-200';

    case 'PENDING_DEPT_HEAD':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ACCEPTED_BY_DEPT_HEAD':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'REJECTED_BY_DEPT_HEAD':
      return 'bg-red-100 text-red-700 border-red-200';

    case 'PENDING_VICE_DEAN':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'ACCEPTED_BY_VICE_DEAN':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'REJECTED_BY_VICE_DEAN':
      return 'bg-red-100 text-red-700 border-red-200';

    case 'PENDING_DEAN':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'ACCEPTED_BY_DEAN':
      return 'bg-violet-100 text-violet-800 border-violet-300';
    case 'REJECTED_BY_DEAN':
      return 'bg-red-100 text-red-700 border-red-200';

    case 'PENDING_ADMIN':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'ACCEPTED_BY_ADMIN':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'REJECTED_BY_ADMIN':
      return 'bg-red-100 text-red-700 border-red-200';

    case 'PENDING_COMMITTEE':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';

    case 'NEEDS_EDIT':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

/**
 * Returns the progress percentage (0-100) for a given application status.
 */
export const getProgress = (status: ApplicationStatus | string): number => {
  switch (status) {
    case 'DRAFT':
      return 5;
    case 'NEEDS_EDIT':
      return 10;

    case 'PENDING_DEPT_HEAD':
      return 15;
    case 'ACCEPTED_BY_DEPT_HEAD':
      return 28;
    case 'REJECTED_BY_DEPT_HEAD':
      return 0;

    case 'PENDING_VICE_DEAN':
      return 30;
    case 'ACCEPTED_BY_VICE_DEAN':
      return 45;
    case 'REJECTED_BY_VICE_DEAN':
      return 0;

    case 'PENDING_DEAN':
      return 50;
    case 'ACCEPTED_BY_DEAN':
      return 62;
    case 'REJECTED_BY_DEAN':
      return 0;

    case 'PENDING_ADMIN':
      return 65;
    case 'ACCEPTED_BY_ADMIN':
      return 78;
    case 'REJECTED_BY_ADMIN':
      return 0;

    case 'PENDING_COMMITTEE':
      return 85;
    case 'APPROVED':
      return 100;
    case 'REJECTED':
      return 0;

    default:
      return 0;
  }
};
