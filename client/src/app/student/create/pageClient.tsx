'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMasterData, AwardType } from '../../../hooks/useMasterData';
import { useApplications } from '../../../hooks/useApplications';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { CreateApplicationInput, User, WorkItem } from '../../../types';
import { api } from '../../../lib/api';

// Extended type for form handling including File objects
interface FormAttachment {
  file?: File;
  fileUrl?: string; // If already uploaded or from existing data
  fileName: string;
}

interface FormWorkItem extends Omit<WorkItem, 'attachments'> {
  attachments: FormAttachment[];
  date?: string; // Frontend date field
}

// Reduce redundancy by extending CreateApplicationInput
interface ApplicationFormData extends Omit<CreateApplicationInput, 'typeId' | 'workItems' | 'transcriptFile' | 'applicationFile'> {
  // Additional form-specific fields
  age: string;
  birthdate: string;
  
  // File handling
  transcriptFileObj?: File | null;
  transcriptFileName?: string;

  // Form-specific WorkItems
  workItems: FormWorkItem[];
}

interface ApplicationFormProps {
  user: User | null;
  awardTypes: AwardType[];
  typeParam: string | null;
  modeParam: string | null;
}

// For multiple files
const MultiFileUploadZone = ({ 
    label, 
    onFilesSelect, 
    attachments, 
    onRemove 
  }: { 
    label: string, 
    onFilesSelect: (files: File[]) => void, 
    attachments: FormAttachment[],
    onRemove: (index: number) => void
  }) => {
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesSelect(Array.from(e.dataTransfer.files));
      }
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelect(Array.from(e.target.files));
      }
    };
  
    return (
      <div className="mt-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
        
        {/* File List */}
        {attachments.length > 0 && (
            <div className="mb-4 space-y-3">
                {attachments.map((file, idx) => (
                    <div key={idx} className="border border-green-200 bg-green-50 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 text-green-600">
                               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd"></path></svg>
                           </div>
                           <div className="min-w-0">
                               <p className="text-sm font-bold text-gray-900 truncate">{file.fileName}</p>
                               <p className="text-xs text-green-600">Ready to upload</p>
                           </div>
                        </div>
                        <button onClick={() => onRemove(idx)} className="text-gray-400 hover:text-red-500 p-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* Upload Button */}
        <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-green-400 transition-colors bg-white cursor-pointer group"
            onClick={() => document.getElementById(`file-upload-multi-${label}`)?.click()}
        >
            <input 
            type="file" 
            id={`file-upload-multi-${label}`}
            className="hidden" 
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
            />
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <p className="text-xs font-bold text-gray-500 group-hover:text-green-600">Click or Drag to add files</p>
            </div>
        </div>
      </div>
    );
};

const FileUploadZone = ({ 
  label, 
  onFileSelect, 
  currentFileName, 
  onRemove 
}: { 
  label: string, 
  onFileSelect: (file: File) => void, 
  currentFileName?: string,
  onRemove?: () => void
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="mt-2">
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      
      {!currentFileName ? (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-green-400 transition-colors bg-white cursor-pointer group"
          onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
        >
          <input 
            type="file" 
            id={`file-upload-${label}`}
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
          />
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
             <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          </div>
          <p className="text-sm font-bold text-gray-900">Drag and drop your file here</p>
          <p className="text-xs text-gray-400 mt-1">Supported: PDF, JPG, PNG (Max 5MB)</p>
          <button type="button" className="mt-4 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
            Browse Files
          </button>
        </div>
      ) : (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd"></path></svg>
              <div>
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{currentFileName}</p>
                <p className="text-xs text-green-600">Ready to upload</p>
              </div>
           </div>
           <button onClick={onRemove} className="text-gray-400 hover:text-red-500">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
           </button>
        </div>
      )}
    </div>
  );
};

function ApplicationForm({ user, awardTypes, typeParam, modeParam }: ApplicationFormProps) {
  const router = useRouter();
  const { createApplication } = useApplications();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    title: 'นาย/นางสาว',
    firstName: '',
    lastName: '',
    studentId: '',
    faculty: '',
    department: '',
    major: '',
    year: '',
    tel: '',
    phone: '', // Added to satisfy interface
    email: '',
    gpax: '',
    gpa: '', // Added to satisfy interface
    advisor: '',
    address: '',
    age: '',
    birthdate: '',
    workItems: [
        { 
            title: '', 
            competitionName: '', 
            organizer: '', 
            rank: '', 
            level: '', // Added level
            date: '', 
            attachments: [],
            isTeam: false,
            teamName: '' 
        }
    ]
  });

  // Pre-fill user data
  useEffect(() => {
    if (user) {
        // Simple name split, not perfect but works for now if name is full
        const names = user.name?.split(' ') || ['', ''];
        setFormData(prev => ({
            ...prev,
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            studentId: user.actualId || '',
            email: user.email || '',
            faculty: user.faculty?.facultyName || '',
            department: user.department?.name || '',
            major: user.department?.name || '', // Assuming major = department
            tel: user.tel || '',
            phone: user.tel || ''
        }));
    }
  }, [user]);

  const selectedType = useMemo(() => {
    if (awardTypes.length === 0 || !typeParam) return null;
    if (modeParam === 'id') return awardTypes.find(t => t.id === typeParam);
    if (typeParam === 'creativity') return awardTypes.find(t => t.awardName.includes('ความคิดสร้างสรรค์'));
    if (typeParam === 'activity') return awardTypes.find(t => t.awardName.includes('กิจกรรมเสริมหลักสูตร'));
    if (typeParam === 'conduct') return awardTypes.find(t => t.awardName.includes('ความประพฤติดี'));
    return null;
  }, [awardTypes, typeParam, modeParam]);

  const selectedTypeId = selectedType?.id;
  const error = awardTypes.length > 0 && typeParam && !selectedType ? 'ไม่พบประเภทรางวัลที่ระบุ' : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkItemChange = (index: number, name: string, value: string) => {
    setFormData(prev => {
      const items = [...prev.workItems];
      items[index] = { ...items[index], [name]: value };
      return { ...prev, workItems: items };
    });
  };

  const addWorkItem = () => {
    setFormData(prev => ({
      ...prev,
      workItems: [...prev.workItems, { title: '', competitionName: '', organizer: '', rank: '', level: '', date: '', attachments: [], isTeam: false, teamName: '' }]
    }));
  };

  const removeWorkItem = (index: number) => {
    if (formData.workItems.length > 1) {
        setFormData(prev => ({
        ...prev,
        workItems: prev.workItems.filter((_, i) => i !== index)
        }));
    }
  };

  const handleWorkItemFileSelect = (index: number, files: File[]) => {
    setFormData(prev => {
        const items = [...prev.workItems];
        // Append new files to existing ones
        const newAttachments = files.map(file => ({ file, fileName: file.name }));
        items[index] = { 
            ...items[index], 
            attachments: [...items[index].attachments, ...newAttachments] 
        };
        return { ...prev, workItems: items };
    });
  };

  const handleWorkItemFileRemove = (index: number, attachmentIndex: number) => {
     setFormData(prev => {
        const items = [...prev.workItems];
        items[index] = { 
            ...items[index], 
            attachments: items[index].attachments.filter((_, i) => i !== attachmentIndex) 
        };
        return { ...prev, workItems: items };
    });
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.studentId || !formData.faculty || !formData.major) {
       alert('กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน');
       return false;
    }
    if (!formData.gpax) {
       alert('กรุณากรอกเกรดเฉลี่ยสะสม (GPAX)');
       return false;
    }
    const gpaxNum = parseFloat(formData.gpax);
    if (isNaN(gpaxNum) || gpaxNum < 0 || gpaxNum > 4) {
       alert('GPAX ต้องอยู่ระหว่าง 0.00 - 4.00');
       return false;
    }
    if (!formData.transcriptFileObj) {
        alert('กรุณาอัปโหลดไฟล์ Transcript');
        return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (const item of formData.workItems) {
        if (!item.title || !item.competitionName || !item.organizer || !item.date || !item.level || !item.rank) {
            alert('กรุณากรอกข้อมูลรางวัลให้ครบถ้วน');
            return false;
        }
        if (item.attachments.length === 0) {
            alert(`กรุณาแนบหลักฐานสำหรับรางวัล "${item.title}"`);
            return false;
        }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    if (currentStep === 2 && validateStep2()) setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else router.back();
  };

  const handleSubmit = async () => {
    if (!selectedTypeId) return;
    setIsSubmitting(true);
    
    try {
      // 1. Upload Transcript
      let transcriptUrl = '';
      if (formData.transcriptFileObj) {
         const transcriptData = new FormData();
         transcriptData.append('file', formData.transcriptFileObj);
         const res = await api.fetch<{ url: string; fileName: string }>('/files', {method: 'POST',body: transcriptData
    });

transcriptUrl = res.url;
      }

      // 2. Upload Work Items Files
      const workItemsPayload: WorkItem[] = await Promise.all(formData.workItems.map(async (item) => {
         const attachments = await Promise.all(item.attachments.map(async (att) => {
             if (att.file) {
                 const fileData = new FormData();
                 fileData.append('file', att.file);
                 const res = await api.fetch<{ url: string; fileName: string }>('/files', {method: 'POST', body: fileData
                 });
                 return {
                    fileUrl: res.url,
                    fileName: res.fileName   // ⭐ เพิ่มบรรทัดนี้
                };
             }
             // Handle case where fileUrl exists but no file object (e.g. from draft or edit mode if implemented)
             return { fileUrl: att.fileUrl || '' };
         }));
         
         // Cast to satisfy WorkItemAttachment[] if needed, or rely on structural typing if interface matches
         const validAttachments = attachments.filter(a => a.fileUrl) as { fileUrl: string }[];

         const workItem: WorkItem = {
             title: item.title,
             competitionName: item.competitionName,
             organizer: item.organizer,
             rank: item.rank,
             level: item.level, 
             awardDate: item.date, 
             isTeam: item.isTeam,
             teamName: item.isTeam ? item.teamName : undefined, // Include teamName here
             attachments: validAttachments
         };
         return workItem;
      }));

      const payload: CreateApplicationInput = {
        typeId: selectedTypeId,
        
        // Personal Info
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentId: formData.studentId,
        faculty: formData.faculty,
        department: formData.department,
        major: formData.major,
        year: formData.year,
        
        // Map duplicate fields
        tel: formData.tel,
        phone: formData.tel, 
        
        email: formData.email,
        advisor: formData.advisor,
        address: formData.address,
        
        gpax: formData.gpax,
        gpa: formData.gpax,

        transcriptFile: transcriptUrl,
        workItems: workItemsPayload
      };

      await createApplication(payload);
      router.push('/student/home?success=true');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : 'Unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#EFE9F5] font-sans pb-20"> {/* Lavender Background */}
      
      {/* Header/Nav Placeholder if needed (Layout serves this) */}
      
      <div className="max-w-4xl mx-auto pt-10 px-4">
        
        {/* Progress Card */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm mb-8 relative overflow-hidden">
             
             {/* Text over Progress Bar */}
             <div className="flex justify-between items-end mb-2 relative z-10">
                <span className="text-lg font-bold text-gray-900">
                    {currentStep === 1 ? 'Step 1: Personal Info' : 
                     currentStep === 2 ? 'Step 2: Documents' : 'Step 3: Confirmation'}
                </span>
                <span className="text-xs font-bold text-gray-400">
                    {Math.round((currentStep / 3) * 100)}% Complete
                </span>
             </div>
             
             {/* Progress Bar Track */}
             <div className="w-full bg-gray-100 rounded-full h-2.5 relative z-10">
                <div 
                    className="bg-[#56C596] h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
             </div>
             
             <div className="flex justify-between mt-3 text-[10px] uppercase tracking-wider relative z-10">
                <span className={`font-bold ${currentStep >= 1 ? 'text-[#2D3748]' : 'text-gray-300'}`}>Step 1: Personal Info</span>
                <span className={`font-bold ${currentStep >= 2 ? 'text-[#2D3748]' : 'text-gray-300'}`}>Step 2: Documents</span>
                <span className={`font-bold ${currentStep === 3 ? 'text-[#2D3748]' : 'text-gray-300'}`}>Step 3: Confirmation</span>
             </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in-up">
            {currentStep === 1 && (
                <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
                    <h2 className="text-3xl font-extrabold text-[#1A202C] mb-6">ข้อมูลส่วนตัว</h2>
                    <p className="text-gray-400 text-sm mb-10 max-w-lg mx-auto">
                        กรุณาส่งเอกสารประกอบการสมัครเพื่อทำการสมัครให้เสร็จสมบูรณ์ 
                        โปรดตรวจสอบให้แน่ใจว่าเอกสารทุกฉบับอ่านได้ชัดเจน
                    </p>
                    
                    <div className="text-left space-y-8">
                        <div>
                            <h3 className="text-[#56C596] font-bold mb-4 opacity-100 text-sm tracking-wide">1. ข้อมูลส่วนตัว</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">ชื่อ-นามสกุล <span className="text-red-400">*</span></label>
                                    <input 
                                        type="text" 
                                        value={`${formData.firstName} ${formData.lastName}`}
                                        readOnly
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">รหัสประจำตัว <span className="text-red-400">*</span></label>
                                    <input 
                                        type="text" 
                                        value={formData.studentId}
                                        readOnly
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">คณะ <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <select 
                                            disabled 
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white text-gray-500 appearance-none"
                                        >
                                            <option>{formData.faculty}</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">สาขาวิชา <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <select 
                                            disabled
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white text-gray-500 appearance-none"
                                        >
                                            <option>{formData.major}</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">GPAX <span className="text-red-400">*</span></label>
                                    <input
                                        type="number"
                                        name="gpax"
                                        step="0.01"
                                        min="0"
                                        max="4"
                                        value={formData.gpax}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || val === '.') {
                                                setFormData(prev => ({ ...prev, gpax: val }));
                                                return;
                                            }
                                            const num = parseFloat(val);
                                            if (!isNaN(num) && num <= 4) {
                                                setFormData(prev => ({ ...prev, gpax: val }));
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const num = parseFloat(e.target.value);
                                            if (!isNaN(num)) {
                                                const clamped = Math.min(4, Math.max(0, num));
                                                setFormData(prev => ({ ...prev, gpax: clamped.toFixed(2) }));
                                            }
                                        }}
                                        placeholder="0.00 - 4.00"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-200 text-gray-800 placeholder-gray-300"
                                    />
                                    {formData.gpax && (parseFloat(formData.gpax) < 0 || parseFloat(formData.gpax) > 4) && (
                                        <p className="text-xs text-red-400 mt-1 ml-1">ต้องอยู่ระหว่าง 0.00 - 4.00</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-[#56C596] font-bold mb-4 opacity-100 text-sm tracking-wide">1.1 เอกสารเพิ่มเติม</h3>
                            <div>
                                <h4 className="font-bold text-gray-700 mb-1">Transcript</h4>
                                <p className="text-[10px] text-gray-400 mb-4">โปรดส่งเอกสารแสดงผลการเรียนอย่างเป็นทางการฉบับล่าสุดของคุณ (ควรเป็นไฟล์ PDF)</p>
                                <FileUploadZone 
                                    label="Transcript" 
                                    currentFileName={formData.transcriptFileName}
                                    onFileSelect={(file) => setFormData(prev => ({ ...prev, transcriptFileObj: file, transcriptFileName: file.name }))}
                                    onRemove={() => setFormData(prev => ({ ...prev, transcriptFileObj: null, transcriptFileName: undefined }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
                    <h2 className="text-3xl font-extrabold text-[#1A202C] mb-6">เอกสารเพิ่มเติม</h2>
                    <p className="text-gray-400 text-sm mb-10 max-w-lg mx-auto">
                        กรุณาส่งเอกสารประกอบการสมัครเพื่อทำการสมัครให้เสร็จสมบูรณ์ 
                        โปรดตรวจสอบให้แน่ใจว่าเอกสารทุกฉบับอ่านได้ชัดเจน
                    </p>

                    <div className="text-left space-y-10">
                        <h3 className="text-[#56C596] font-bold opacity-100 text-sm tracking-wide">2. รางวัล</h3>
                        
                        {formData.workItems.map((item, index) => (
                            <div key={index} className="space-y-6 border-b border-dashed border-gray-200 pb-8 last:border-0 relative">
                                {formData.workItems.length > 1 && (
                                    <button 
                                        onClick={() => removeWorkItem(index)}
                                        className="absolute top-0 right-0 text-gray-300 hover:text-red-400 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">ชื่อผลงาน/โครงการ <span className="text-red-400">*</span></label>
                                        <input 
                                            type="text" 
                                            value={item.title}
                                            onChange={(e) => handleWorkItemChange(index, 'title', e.target.value)}
                                            placeholder="ชื่อผลงาน/โครงการ"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#56C596] text-gray-800 placeholder-gray-300"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">ชื่อการแข่งขัน/กิจกรรม <span className="text-red-400">*</span></label>
                                        <input 
                                            type="text" 
                                            value={item.competitionName}
                                            onChange={(e) => handleWorkItemChange(index, 'competitionName', e.target.value)}
                                            placeholder="ชื่อการแข่งขัน/กิจกรรม"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#56C596] text-gray-800 placeholder-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">หน่วยงานที่จัด <span className="text-red-400">*</span></label>
                                        <input 
                                            type="text" 
                                            value={item.organizer}
                                            onChange={(e) => handleWorkItemChange(index, 'organizer', e.target.value)}
                                            placeholder="หน่วยงานที่จัด"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#56C596] text-gray-800 placeholder-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">ระดับของรางวัล <span className="text-red-400">*</span></label>
                                        <select
                                            value={item.level || ''}
                                            onChange={(e) => handleWorkItemChange(index, 'level', e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#56C596] text-gray-800 bg-white placeholder-gray-300 appearance-none"
                                        >
                                            <option value="" disabled>เลือกระดับรางวัล</option>
                                            <option value="International">ระดับนานาชาติ</option>
                                            <option value="National">ระดับชาติ</option>
                                            <option value="Regional">ระดับภูมิภาค</option>
                                            <option value="University">ระดับมหาวิทยาลัย</option>
                                            <option value="Faculty">ระดับคณะ</option>
                                            <option value="Department">ระดับภาควิชา</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">รางวัลที่ได้รับ <span className="text-red-400">*</span></label>
                                        <input 
                                            type="text" 
                                            value={item.rank}
                                            onChange={(e) => handleWorkItemChange(index, 'rank', e.target.value)}
                                            placeholder="รางวัลที่ได้รับ"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#56C596] text-gray-800 placeholder-gray-300"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">วันที่ได้รับ <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <input 
                                                type="date" 
                                                value={item.date ? new Date(item.date).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleWorkItemChange(index, 'date', e.target.value)}
                                                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#56C596] text-gray-800 appearance-none bg-white placeholder-gray-300"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="md:col-span-2 space-y-4 pt-2">
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox"
                                                id={`isTeam-${index}`}
                                                checked={item.isTeam}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData(prev => {
                                                        const items = [...prev.workItems];
                                                        items[index] = { 
                                                            ...items[index], 
                                                            isTeam: checked,
                                                            // Clear teamName if unchecked if desired, but keeping it is safe too
                                                            teamName: checked ? items[index].teamName : '' 
                                                        };
                                                        return { ...prev, workItems: items };
                                                    });
                                                }}
                                                className="w-5 h-5 text-[#56C596] border-gray-300 rounded focus:ring-[#56C596]"
                                            />
                                            <label htmlFor={`isTeam-${index}`} className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                                                เป็นผลงานรูปแบบทีม (Team Project)
                                            </label>
                                        </div>

                                        {item.isTeam && (
                                            <div className="animate-fade-in-up">
                                                <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">ชื่อทีม (Team Name) <span className="text-red-400">*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={item.teamName || ''}
                                                    onChange={(e) => handleWorkItemChange(index, 'teamName', e.target.value)}
                                                    placeholder="กรอกชื่อทีมของคุณ"
                                                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#56C596] text-gray-800 placeholder-gray-300"
                                                />
                                            </div>
                                        )}
                                    </div>

                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-700 mb-1 flex items-center gap-2">ไฟล์หลักฐาน <span className="text-red-400">*</span></h4>
                                    <p className="text-[10px] text-gray-400 mb-4">โปรดส่งเอกสารแสดงหลักฐานรางวัลของคุณ (สามารถแนบได้มากกว่า 1 ไฟล์)</p>
                                    <MultiFileUploadZone 
                                        label={`Evidence-${index}`}
                                        attachments={item.attachments}
                                        onFilesSelect={(files) => handleWorkItemFileSelect(index, files)}
                                        onRemove={(attIndex) => handleWorkItemFileRemove(index, attIndex)}
                                    />
                                </div>
                            </div>
                        ))}

                        <button 
                            onClick={addWorkItem}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-[#56C596] hover:text-[#56C596] transition-all flex items-center justify-center gap-2 bg-gray-50/50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            เพิ่มรางวัล
                        </button>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                 <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
                    <h2 className="text-3xl font-extrabold text-[#1A202C] mb-6">ตรวจสอบข้อมูล</h2>
                    <p className="text-gray-400 text-sm mb-10 max-w-lg mx-auto">
                        กรุณาส่งเอกสารประกอบการสมัครเพื่อทำการสมัครให้เสร็จสมบูรณ์ 
                        โปรดตรวจสอบให้แน่ใจว่าเอกสารทุกฉบับอ่านได้ชัดเจน
                    </p>

                    <div className="text-left space-y-8 divide-y divide-gray-100">
                        {/* 1. Review Personal Info */}
                        <div className="pt-4">
                             <h3 className="text-[#56C596] font-bold mb-4 opacity-100 text-sm tracking-wide">1. ข้อมูลส่วนตัว</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1 font-bold ml-1">ชื่อ-นามสกุล</label>
                                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-700 text-sm font-medium">
                                        {formData.firstName} {formData.lastName}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1 font-bold ml-1">รหัสประจำตัว</label>
                                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-700 text-sm font-medium">
                                        {formData.studentId}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1 font-bold ml-1">คณะ</label>
                                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-700 text-sm font-medium">
                                        {formData.faculty}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1 font-bold ml-1">สาขาวิชา</label>
                                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-700 text-sm font-medium">
                                        {formData.major}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1 font-bold ml-1">GPAX</label>
                                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-700 text-sm font-medium">
                                        {formData.gpax || '-'}
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* 2. Review Awards */}
                        <div className="pt-8">
                             <h3 className="text-[#56C596] font-bold mb-4 opacity-100 text-sm tracking-wide">2. รางวัล</h3>
                             {formData.workItems.map((item, i) => (
                                 <div key={i} className="mb-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1 font-bold">ชื่อผลงาน</label>
                                            <div className="font-bold text-gray-800 text-sm">{item.title}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1 font-bold">การแข่งขัน</label>
                                            <div className="font-bold text-gray-800 text-sm">{item.competitionName}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1 font-bold">หน่วยงาน</label>
                                            <div className="font-bold text-gray-800 text-sm">{item.organizer}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1 font-bold">ระดับ</label>
                                            <div className="font-bold text-gray-800 text-sm">{item.level}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1 font-bold">รางวัล</label>
                                            <div className="font-bold text-gray-800 text-sm">{item.rank}</div>
                                        </div>
                                     </div>
                                     
                                     {item.isTeam && (
                                         <div className="mt-4 pt-4 border-t border-gray-100">
                                            <label className="text-xs text-gray-400 block mb-1 font-bold">ชื่อทีม</label>
                                            <div className="font-bold text-[#56C596] text-sm">{item.teamName}</div>
                                         </div>
                                     )}
                                     
                                     {item.attachments.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <label className="text-xs text-gray-400 block mb-2 font-bold">ไฟล์หลักฐาน ({item.attachments.length} ไฟล์)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {item.attachments.map((att, attIdx) => (
                                                    <div key={attIdx} className="flex items-center gap-2 text-xs text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 w-fit shadow-sm">
                                                        <svg className="w-4 h-4 text-[#56C596]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd"></path></svg>
                                                        {att.fileName}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                     )}
                                 </div>
                             ))}
                        </div>
                        
                        {/* 3. Extra Docs */}
                        <div className="pt-4">
                             <h3 className="text-[#56C596] font-bold mb-4 opacity-100 text-sm tracking-wide">3. เอกสารเพิ่มเติม</h3>
                             <div>
                                 <label className="text-xs text-gray-400 block mb-2 font-bold">Transcript</label>
                                 <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-2xl w-full shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-[#56C596]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd"></path></svg>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 truncate">{formData.transcriptFileName}</span>
                                 </div>
                             </div>
                        </div>

                    </div>
                 </div>
            )}
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
           <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
               {/* Back Button */}
               <button 
                  onClick={handleBack}
                  className="px-6 py-2.5 rounded-full text-white font-bold text-sm bg-gray-400/50 hover:bg-gray-400 transition-all flex items-center gap-2"
               >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                   Back
               </button>
               
               {/* Next/Submit Button */}
               {currentStep < 3 ? (
                   <button 
                      onClick={handleNext}
                      className="px-8 py-2.5 bg-[#56C596] hover:bg-[#45a87d] text-white rounded-full font-bold text-sm shadow-lg shadow-green-200 transition-all flex items-center gap-2 transform hover:-translate-y-1"
                   >
                       ถัดไป
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                   </button>
               ) : (
                   <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-2.5 bg-[#56C596] hover:bg-[#45a87d] text-white rounded-full font-bold text-sm shadow-lg shadow-green-200 transition-all flex items-center gap-2 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed group"
                   >
                       {isSubmitting ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                             กำลังส่ง...
                           </>
                       ) : (
                           <>
                             ยืนยันการสมัคร
                             <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                           </>
                       )}
                   </button>
               )}
           </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateApplicationPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const modeParam = searchParams.get('mode'); // 'id' or 'string' (old way)
  
  const { awardTypes, loading: typesLoading } = useMasterData();
  const { user, loading: userLoading } = useCurrentUser();

  if (typesLoading || userLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EFE9F5]">
           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#56C596]"></div>
        </div>
    );
  }
  
  return <ApplicationForm user={user} awardTypes={awardTypes} typeParam={typeParam} modeParam={modeParam} />;
}
