'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import Link from 'next/link';

export default function CreateAwardTypePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    awardName: '',
    description: '',
    criteria: '', 
    iconUrl: 'trophy', 
    scheduleFileUrl: '',
    tags: [] as string[]
  });
  
  const [tagInput, setTagInput] = useState('');
  const [fileName, setFileName] = useState<string | null>(null); // Schedule file name
  const [iconName, setIconName] = useState<string | null>(null); // Icon file name
  const [iconPreview, setIconPreview] = useState<string | null>(null); // Icon preview URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Icon Upload Handler
  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Create local preview
        const previewUrl = URL.createObjectURL(file);
        setIconPreview(previewUrl);
        setIconName(file.name);

        // Upload to server
        const data = new FormData();
        data.append('file', file);

        try {
            // Adjust endpoint if needed. Assuming standard upload route
            // The API client automatically handles FormData content-type
            // Ensure we use the full URL from the response
             const response = await api.post<{ fileUrl: string }>('/files', data);
             if (response.fileUrl) {
                setFormData(prev => ({ ...prev, iconUrl: response.fileUrl }));
             } else {
                console.error("Upload response missing fileUrl");
             }
        } catch (error) {
            console.error("Upload failed", error);
            // Fallback or error handling
        }
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() !== '') {
        setFormData({
            ...formData,
            tags: [...formData.tags, tagInput.trim()]
        });
        setTagInput('');
    }
  };

  const handleTagRemove = (indexToRemove: number) => {
    setFormData({
        ...formData,
        tags: formData.tags.filter((_, index) => index !== indexToRemove)
    });
  };

  // Mock file handling: In a real app, you would upload this file to a server/storage
  // and get a URL back. Here we just take the name as the URL for simulation.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
         const file = e.target.files[0];
         setFileName(file.name);
         
         const data = new FormData();
         data.append('file', file);

         try {
             const response = await api.post<{ fileUrl: string }>('/files', data);
             if (response.fileUrl) {
                setFormData(prev => ({ ...prev, scheduleFileUrl: response.fileUrl }));
             }
         } catch (error) {
             console.error("Upload failed", error);
         }
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validating required fields
      if (!formData.awardName || !formData.description) {
          throw new Error("Please fill in all required fields");
      }

      await api.post('/master/award-types', formData);
      router.push('/admin/home');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create award type');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#E8DDF5] p-6 font-sans">
      
      {/* Header / Nav would be in Layout, but here is the Back button */}
      <div className="max-w-6xl mx-auto mb-6">
        <button 
           onClick={() => router.back()}
           className="flex items-center gap-2 px-6 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
        
        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                {error}
            </div>
        )}

        {/* Card 1: Icon, Name, Description */}
        <div className="bg-white rounded-[30px] p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10">
            {/* Left: Icon Upload */}
            <div className="flex-shrink-0 flex flex-col gap-3 items-center">
                <div 
                    onClick={() => iconInputRef.current?.click()}
                    className="w-64 h-64 rounded-xl bg-gradient-to-b from-[#E9D5FF] to-[#C084FC] flex items-center justify-center shadow-inner cursor-pointer hover:opacity-90 transition-opacity overflow-hidden relative"
                >
                    {iconPreview ? (
                        <img src={iconPreview} alt="Icon Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                           <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </div>
                    )}
                    
                    {/* Hidden input */}
                    <input 
                        type="file" 
                        ref={iconInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleIconChange}
                    />
                </div>
                <button 
                    type="button" 
                    onClick={() => iconInputRef.current?.click()}
                    className="font-bold text-gray-800 text-sm hover:text-green-600"
                >
                    {iconName ? 'Change Icon/Image' : 'Upload Icon/Image'}
                </button>
                {iconName && <span className="text-xs text-gray-500 max-w-[200px] truncate">{iconName}</span>}
            </div>

            {/* Right: Inputs */}
            <div className="flex-grow space-y-6">
                <div>
                     <input
                        type="text"
                        name="awardName"
                        value={formData.awardName}
                        onChange={handleChange}
                        placeholder="กรอกชื่อรางวัล*"
                        className="w-full px-4 py-3 border border-gray-400 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white"
                        required
                     />
                </div>
                <div>
                     <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="เพิ่มคำอธิบาย*..."
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-400 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white resize-none"
                        required
                     />
                </div>
                <div>
                     <textarea
                        name="criteria"
                        value={formData.criteria}
                        onChange={handleChange}
                        placeholder="ระบุเกณฑ์การตัดสิน (Criteria)..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-400 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white resize-none"
                     />
                </div>
            </div>
        </div>

        {/* Card 2: Files & Tags & Submit */}
        <div className="bg-white rounded-[30px] p-10 shadow-sm border border-gray-100 min-h-[400px] flex flex-col justify-between">
             
             {/* File Upload Section */}
             <div className="border border-gray-400 rounded-xl p-6 min-h-[250px] relative">
                 <h3 className="font-bold text-gray-800 mb-4">แนบไฟล์(กำหนดการ)</h3>
                 
                 {fileName && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-400 bg-white text-gray-700 text-sm font-medium mb-4">
                        {formData.scheduleFileUrl ? (
                            <a 
                                href={formData.scheduleFileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                {fileName}
                            </a>
                        ) : (
                            <span>{fileName}</span>
                        )}
                         <button type="button" onClick={() => { setFileName(null); setFormData(prev => ({ ...prev, scheduleFileUrl: '' })); }} className="text-gray-400 hover:text-red-500 ml-2">
                            x
                        </button>
                    </div>
                 )}

                 <div>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-1 rounded-full border border-gray-600 text-gray-500 text-xs hover:bg-gray-50 transition-colors"
                    >
                        Choose File
                    </button>
                 </div>
             </div>

             {/* Bottom Actions */}
             <div className="flex justify-between items-end mt-6">
                 
                 {/* Tags Input */}
                 <div className="flex flex-col gap-2">
                     <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag, idx) => (
                             <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                {tag}
                                <button type="button" onClick={() => handleTagRemove(idx)} className="hover:text-red-500 ml-1">×</button>
                             </span>
                        ))}
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-xs font-bold">
                                เพิ่ม Tag
                            </span>
                             <input 
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleTagAdd();
                                    }
                                }}
                                className="pl-20 pr-4 py-1.5 bg-gray-50 rounded-full text-sm border-none focus:ring-0 w-48 text-gray-700" 
                             />
                        </div>
                        <button 
                            type="button" 
                            onClick={handleTagAdd}
                            className="p-1 bg-white border border-gray-200 rounded-full text-gray-400 hover:bg-gray-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                     </div>
                 </div>

                 {/* Submit Button */}
                 <button 
                    type="submit"
                    disabled={loading}
                    className="px-10 py-2.5 bg-[#E2E8F0] text-gray-500 font-bold rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                 >
                    {loading ? 'Creating...' : 'Create'}
                 </button>
             </div>
        </div>

      </form>
    </div>
  );
}
