'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { Campus, Faculty, Department } from '../../../types';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [role, setRole] = useState('STUDENT');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [fullname, setFullname] = useState('');
  const [actualId, setActualId] = useState('');
  const [tel, setTel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token && typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }

    const fetchMasterData = async () => {
      try {
        const data = await api.get<Campus[]>('/master/structure');
        setCampuses(data);
      } catch (err) {
        console.error("Failed to fetch master data", err);
      }
    };
    fetchMasterData();
  }, [searchParams]);

  useEffect(() => {
    if (selectedCampus) {
      const campus = campuses.find(c => c.id === selectedCampus);
      setFaculties(campus ? campus.faculties : []);
      setSelectedFaculty('');
      setSelectedDept('');
    }
  }, [selectedCampus, campuses]);

  useEffect(() => {
    if (selectedFaculty) {
      const faculty = faculties.find(f => f.id === selectedFaculty);
      setDepartments(faculty ? faculty.departments : []);
      setSelectedDept('');
    }
  }, [selectedFaculty, faculties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate phone number (simple check: 10 digits, starts with 0)
    // Removed dashes/spaces for checking
    const cleanTel = tel.replace(/[- ]/g, '');
    if (!/^0\d{9}$/.test(cleanTel)) {
        alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)');
        setLoading(false);
        return;
    }

    try {
      await api.post('/users/onboard', {
        role,
        campusId: selectedCampus,
        facultyId: selectedFaculty,
        departmentId: selectedDept,
        name: fullname,
        actualId: role === 'STUDENT' ? actualId : undefined,
        tel
      });
      router.push('/auth/pending');
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || 'Error');
      } else {
        alert('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fluid-background min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-black font-sans relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="fluid-blob fluid-blob-1" />
      <div className="fluid-blob fluid-blob-2" />
      <div className="fluid-blob fluid-blob-3" />

      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-sm p-10 rounded-[40px] shadow-2xl border border-white/20 z-10 relative">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-[#1a1a1a]">User Registration</h2>
          <p className="mt-2 text-lg text-gray-500">
            Complete your profile to access the student award system
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* 1. Status / Role */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 pl-1">ตำแหน่ง</label>
              <div className="relative">
                <select 
                  required 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  className="block w-full py-3 px-4 border border-gray-400 rounded-full appearance-none focus:outline-none focus:border-green-500 text-gray-500 bg-white"
                >
                  <option value="STUDENT">Student</option>
                  <option value="HEAD_OF_DEPARTMENT">Head of Department</option>
                  <option value="VICE_DEAN">Vice Dean</option>
                  <option value="DEAN">Dean</option>
                  <option value="COMMITTEE">Committee</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                   <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>

             {/* 2. Campus */}
             <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 pl-1">วิทยาเขต</label>
              <div className="relative">
                <select 
                  required 
                  value={selectedCampus} 
                  onChange={(e) => setSelectedCampus(e.target.value)} 
                  className="block w-full py-3 px-4 border border-gray-400 rounded-full appearance-none focus:outline-none focus:border-green-500 text-gray-500 bg-white"
                >
                  <option value="" disabled>เลือกวิทยาเขต</option>
                  {campuses.map(c => <option key={c.id} value={c.id}>{c.campusName}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                   <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>

            {/* 3. Faculty */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 pl-1">คณะ</label>
              <div className="relative">
                <select 
                  required 
                  disabled={!selectedCampus} 
                  value={selectedFaculty} 
                  onChange={(e) => setSelectedFaculty(e.target.value)} 
                  className="block w-full py-3 px-4 border border-gray-400 rounded-full appearance-none focus:outline-none focus:border-green-500 text-gray-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="" disabled>เลือกคณะ</option>
                  {faculties.map(f => <option key={f.id} value={f.id}>{f.facultyName}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                   <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>

            {/* 4. Dept / Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 pl-1">สาขา</label>
              <div className="relative">
                <select 
                  required 
                  disabled={!selectedFaculty} 
                  value={selectedDept} 
                  onChange={(e) => setSelectedDept(e.target.value)} 
                  className="block w-full py-3 px-4 border border-gray-400 rounded-full appearance-none focus:outline-none focus:border-green-500 text-gray-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="" disabled>เลือกสาขา</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                   <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>

            {/* 5. Name */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 pl-1">ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                required 
                value={fullname} 
                onChange={(e) => setFullname(e.target.value)} 
                className="block w-full py-3 px-4 border border-gray-400 rounded-full focus:outline-none focus:border-green-500 text-gray-500 placeholder-gray-300" 
                placeholder="ชื่อ-นามสกุล" 
              />
            </div>

             {/* 6. Student ID (Conditional) */}
             <div>
               <label className="block text-sm font-medium text-gray-500 mb-1 pl-1">รหัสนิสิต</label>
               {role === 'STUDENT' ? (
                 <input 
                   key="student-input"
                   type="text" 
                   required 
                   value={actualId} 
                   onChange={(e) => setActualId(e.target.value)} 
                   className="block w-full py-3 px-4 border border-gray-400 rounded-full focus:outline-none focus:border-green-500 text-gray-500 placeholder-gray-300" 
                   placeholder="รหัสนิสิต Ex. 661045xxxx" 
                 />
               ) : (
                 <input 
                   key="non-student-input"
                   type="text" 
                   disabled 
                   readOnly
                   value=""
                   className="block w-full py-3 px-4 border border-gray-200 rounded-full bg-gray-50 text-gray-400" 
                   placeholder="สำหรับนิสิตเท่านั้น" 
                 />
               )}
            </div>

            {/* 7. Tel */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 pl-1">เบอร์โทรศัพท์</label>
              <input 
                type="tel" 
                required 
                value={tel} 
                onChange={(e) => setTel(e.target.value)} 
                className="block w-full py-3 px-4 border border-gray-400 rounded-full focus:outline-none focus:border-green-500 text-gray-500 placeholder-gray-300" 
                placeholder="เบอร์โทรศัพท์ Ex. 087-123-xxxx" 
              />
            </div>

          </div>

          <div className="flex justify-center mt-10 pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="px-16 py-3 border border-transparent text-base font-medium rounded-full text-white bg-[#5D9F75] hover:bg-[#4C8561] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition-colors shadow-lg"
            >
              {loading ? 'Processing...' : 'register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
     <Suspense fallback={<div>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}