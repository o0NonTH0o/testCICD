'use client';

import React, { useState, useEffect } from 'react';
import { User, Campus, Faculty, Department } from '../../types';
import { api } from '../../lib/api';
import { Save } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userId: string, data: Partial<User>) => Promise<void>;
}

export default function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(false);
  const [structureLoading, setStructureLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        role: user.role,
        actualId: user.actualId,
        campusId: user.campusId || user.campus?.id,
        facultyId: user.facultyId || user.faculty?.id,
        departmentId: user.departmentId || user.department?.id,
        email: user.email,
        tel: user.tel,
        status: user.status
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const data = await api.get<Campus[]>('/master/structure');
        setCampuses(data || []);
      } catch (error) {
        console.error("Failed to fetch structure", error);
      } finally {
        setStructureLoading(false);
      }
    };
    if (isOpen) fetchStructure();
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'campusId') {
        newData.facultyId = '';
        newData.departmentId = '';
      } else if (name === 'facultyId') {
        newData.departmentId = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(user.id, formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const selectedCampus = campuses.find(c => c.id === formData.campusId);

  // Helper: label สำหรับ role
  const roleDisplayMap: Record<string, string> = {
    STUDENT: 'Student',
    HEAD_OF_DEPARTMENT: 'Head of Department',
    VICE_DEAN: 'Vice Dean',
    DEAN: 'Dean',
    COMMITTEE: 'Committee',
    ADMIN: 'Admin',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      
      {/* Overlay — เบลอพื้นหลัง + กดปิด */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal — stopPropagation ไม่ให้ click ทะลุไปถึง overlay */}
      <div className="flex min-h-screen items-center justify-center p-6">
        <div
          className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 px-10 py-8"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="flex items-center space-x-4 mb-7 py-2">
            {/* Avatar */}
            <div className="relative w-16 h-16 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white bg-purple-500 w-full h-full flex items-center justify-center">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>

            {/* Header Text */}
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[#4A5568] text-lg font-bold">Edit Profile User</h1>
              <span className="text-[#2D3748] text-sm font-semibold">{user.name}</span>
              <span className="text-[#4A5568] text-xs font-medium">{user.actualId || '-'}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Form Grid — 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-7">

              {/* Full Name */}
              <div className="flex flex-col">
                <label className="text-[#4A5568] text-sm font-bold mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#2D3748] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#52a677] focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Role */}
              <div className="flex flex-col">
                <label className="text-[#4A5568] text-sm font-bold mb-1.5">Role</label>
                <select
                  name="role"
                  value={formData.role || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#2D3748] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#52a677] focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                >
                  {Object.entries(roleDisplayMap).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Student/Staff ID */}
              <div className="flex flex-col">
                <label className="text-[#4A5568] text-sm font-bold mb-1.5">Student/Staff ID</label>
                <input
                  type="text"
                  name="actualId"
                  value={formData.actualId || ''}
                  onChange={handleChange}
                  placeholder="ID number"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#2D3748] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#52a677] focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Campus */}
              <div className="flex flex-col">
                <label className="text-[#4A5568] text-sm font-bold mb-1.5">Campus</label>
                <select
                  name="campusId"
                  value={formData.campusId || ''}
                  onChange={handleChange}
                  disabled={structureLoading}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#2D3748] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#52a677] focus:border-transparent transition-all appearance-none bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Select Campus</option>
                  {campuses.map(c => (
                    <option key={c.id} value={c.id}>{c.campusName}</option>
                  ))}
                </select>
              </div>

              {/* Faculty */}
              <div className="flex flex-col">
                <label className="text-[#4A5568] text-sm font-bold mb-1.5">Faculty</label>
                <select
                  name="facultyId"
                  value={formData.facultyId || ''}
                  onChange={handleChange}
                  disabled={!formData.campusId}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#2D3748] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#52a677] focus:border-transparent transition-all appearance-none bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Select Faculty</option>
                  {selectedCampus?.faculties?.map(f => (
                    <option key={f.id} value={f.id}>{f.facultyName}</option>
                  ))}
                </select>
              </div>

              {/* Email Address — readonly */}
              <div className="flex flex-col">
                <label className="text-[#4A5568] text-sm font-bold mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  readOnly
                  className="w-full border border-gray-100 bg-[#F4F6F8] rounded-lg px-4 py-2.5 text-[#718096] font-medium text-sm focus:outline-none cursor-not-allowed"
                />
              </div>

            </div>

            {/* Divider */}
            <hr className="border-gray-100 mb-6 mt-6" />

            {/* Footer */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="text-[#4A5568] font-semibold text-sm hover:text-gray-900 transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
              >
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                {!loading && <Save className="w-4 h-4" />}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}