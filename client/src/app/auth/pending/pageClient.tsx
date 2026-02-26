'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { User } from '../../../types';

export default function PendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // รับ token จาก URL params (?token=xxx) ที่ server ส่งมา
    const urlToken = searchParams.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const checkStatus = async () => {
      try {
        setIsChecking(true);
        const user = await api.get<User>('/users/me');
        
        if (user.status === 'ACTIVE') {
          router.replace('/');
        }
        
        if (user.status === 'REJECTED') {
          router.replace('/auth/reject'); 
        }
        // ถ้ายัง PENDING_APPROVAL → อยู่หน้านี้ต่อไป ไม่ทำอะไร
      } catch (err: unknown) {
        // ไม่ redirect อัตโนมัติเมื่อ API error เพื่อป้องกัน redirect loop
        // ให้ user กด logout เองเท่านั้น
        console.error("Error checking status:", err);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [router, searchParams]);

  // ✅ ฟังก์ชัน logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Sarabun:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pending-page {
          font-family: 'Sarabun', sans-serif;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0e1a;
          overflow: hidden;
          position: relative;
        }

        .pending-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.55;
          animation: pending-drift 12s ease-in-out infinite alternate;
        }
        .pending-blob-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, #2e6f40 0%, #1a4028 60%, transparent 100%);
          top: -160px; left: -160px;
          animation-duration: 14s;
        }
        .pending-blob-2 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, #b8960c 0%, #7a6008 60%, transparent 100%);
          bottom: -140px; right: -120px;
          animation-duration: 10s; animation-delay: -4s;
        }
        .pending-blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #1d5c3a 0%, #0f3020 70%, transparent 100%);
          top: 50%; left: 55%;
          transform: translate(-50%, -50%);
          animation-duration: 18s; animation-delay: -7s;
        }
        @keyframes pending-drift {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(30px, -20px) scale(1.07); }
          100% { transform: translate(-20px, 30px) scale(0.95); }
        }

        .pending-grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .pending-card {
          position: relative;
          z-index: 10;
          width: 400px;
          background: linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 28px;
          padding: 48px 40px 40px;
          backdrop-filter: blur(28px) saturate(160%);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05) inset,
            0 40px 80px rgba(0,0,0,0.6),
            0 0 60px rgba(184,150,12,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          animation: pending-cardIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes pending-cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .pending-card::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(184,150,12,0.7), transparent);
          border-radius: 999px;
        }

        .pending-icon-ring {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a4028 0%, #0f2a1a 100%);
          border: 1.5px solid rgba(184,150,12,0.4);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 0 0 6px rgba(184,150,12,0.06),
            0 8px 32px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.08);
          animation: pending-pulse-ring 3s ease-in-out infinite;
        }
        @keyframes pending-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 6px rgba(184,150,12,0.06), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08); }
          50%       { box-shadow: 0 0 0 12px rgba(184,150,12,0.1), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08); }
        }

        .pending-clock-icon { color: #d4a614; filter: drop-shadow(0 0 8px rgba(212,166,20,0.6)); }

        .pending-text-area { text-align: center; }
        .pending-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.02em;
          background: linear-gradient(135deg, #ffffff 30%, #d4a614 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
          margin-bottom: 10px;
        }
        .pending-subtitle {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
        }
        .pending-subtitle-note {
          display: block;
          margin-top: 6px;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
        }

        .pending-divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pending-divider-line {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .pending-divider-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(212,166,20,0.5);
        }

        .pending-bottom {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .pending-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(184,150,12,0.1);
          border: 1px solid rgba(184,150,12,0.25);
          color: #c9a825;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pending-badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #d4a614;
          animation: badge-blink 1.5s ease-in-out infinite;
        }
        @keyframes badge-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .pending-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 15px 24px;
          border-radius: 14px;
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          font-family: 'Sarabun', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pending-logout-btn:hover {
          background: rgba(239,68,68,0.25);
          border-color: rgba(239,68,68,0.5);
          color: #fecaca;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(239,68,68,0.2);
        }
        .pending-logout-btn:active {
          transform: translateY(0);
        }

        .pending-status-hint {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pending-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #d4a614;
        }
        .pending-status-dot.checking {
          animation: badge-blink 0.8s ease-in-out infinite;
        }
      `}</style>

      <div className="pending-page">
        <div className="pending-blob pending-blob-1" />
        <div className="pending-blob pending-blob-2" />
        <div className="pending-blob pending-blob-3" />
        <div className="pending-grid-overlay" />

        <div className="pending-card">
          {/* Icon */}
          <div className="pending-icon-ring">
            <svg className="pending-clock-icon" width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Text */}
          <div className="pending-text-area">
            <div className="pending-title">รอการอนุมัติ</div>
            <p className="pending-subtitle">
              ระบบได้รับข้อมูลการลงทะเบียนของท่านแล้ว<br />
              กรุณารอการตรวจสอบและอนุมัติจากผู้ดูแลระบบ
              <span className="pending-subtitle-note">(อาจใช้เวลา 1-2 วันทำการ)</span>
            </p>
          </div>

          {/* Divider */}
          <div className="pending-divider">
            <div className="pending-divider-line" />
            <div className="pending-divider-dot" />
            <div className="pending-divider-line" />
          </div>

          {/* Bottom */}
          <div className="pending-bottom">
            <div className="pending-badge">
              <div className="pending-badge-dot" />
              กำลังรอการอนุมัติ
            </div>

            <button onClick={handleLogout} className="pending-logout-btn">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              ออกจากระบบ
            </button>

            <span className="pending-status-hint">
              <span className={`pending-status-dot ${isChecking ? 'checking' : ''}`} />
              ตรวจสอบสถานะอัตโนมัติทุก 3 วินาที
            </span>
          </div>
        </div>
      </div>
    </>
  );
}