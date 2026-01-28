'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // 1. เก็บ Token ลง LocalStorage (หรือ Cookie)
      localStorage.setItem('token', token);
      console.log('Token saved:', token);
      
      // 2. (Optional) Redirect ไป Dashboard
      // router.push('/dashboard');
    }
  }, [token, router]);

  return (
    <div className="p-10 flex flex-col items-center">
      <h1 className="text-2xl text-green-600 font-bold">Login สำเร็จ! 🎉</h1>
      <p className="mt-4">Token ของคุณคือ:</p>
      <code className="bg-gray-100 p-4 rounded mt-2 break-all max-w-2xl block">
        {token}
      </code>
      <p className="text-sm text-gray-500 mt-4">
        (Token นี้ถูกบันทึกลง LocalStorage แล้ว พร้อมเรียก API)
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}