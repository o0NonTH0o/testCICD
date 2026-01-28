'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react'; // <-- เพิ่ม useEffect

function OnboardingContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // ย้าย localStorage เข้าไปใน useEffect (เพื่อให้ทำเฉพาะตอนอยู่บน Browser)
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token); 
      console.log('Token saved:', token);
    }
  }, [token]);

  return (
    <div className="p-10 flex flex-col items-center">
      {/* ... (ส่วน UI เหมือนเดิม) */}
      <h1 className="text-2xl text-orange-500 font-bold">ยินดีต้อนรับนิสิตใหม่! 👋</h1>
      <p className="mt-2 text-gray-600">กรุณากรอกข้อมูลเพิ่มเติมเพื่อเข้าใช้งานระบบ</p>
      
      <div className="mt-8 border p-6 rounded-lg w-full max-w-md">
        <p className="mb-4 font-semibold">ฟอร์มลงทะเบียน (Mock Up)</p>
        <input type="text" placeholder="รหัสนิสิต" className="border p-2 w-full mb-3 rounded text-black" />
        <input type="text" placeholder="เบอร์โทรศัพท์" className="border p-2 w-full mb-3 rounded text-black" />
        <button className="bg-orange-500 text-white w-full py-2 rounded">
          บันทึกข้อมูล
        </button>
      </div>

      <div className="mt-6">
        <p className="text-sm">Token สำหรับยิง API (Postman):</p>
        <code className="text-xs bg-gray-100 p-2 block mt-1 break-all max-w-lg text-black">
          {token}
        </code>
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