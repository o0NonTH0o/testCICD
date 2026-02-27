'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function RejectPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Sarabun:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reject-page {
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

        .reject-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.55;
          animation: reject-drift 12s ease-in-out infinite alternate;
        }
        .reject-blob-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, #6f2e2e 0%, #401a1a 60%, transparent 100%);
          top: -160px; left: -160px;
          animation-duration: 14s;
        }
        .reject-blob-2 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, #b8960c 0%, #7a6008 60%, transparent 100%);
          bottom: -140px; right: -120px;
          animation-duration: 10s; animation-delay: -4s;
        }
        .reject-blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #5c1d1d 0%, #300f0f 70%, transparent 100%);
          top: 50%; left: 55%;
          transform: translate(-50%, -50%);
          animation-duration: 18s; animation-delay: -7s;
        }
        @keyframes reject-drift {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(30px, -20px) scale(1.07); }
          100% { transform: translate(-20px, 30px) scale(0.95); }
        }

        .reject-grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .reject-card {
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
            0 0 60px rgba(239,68,68,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          animation: reject-cardIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes reject-cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .reject-card::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent);
          border-radius: 999px;
        }

        .reject-icon-ring {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #401a1a 0%, #2a0f0f 100%);
          border: 1.5px solid rgba(239,68,68,0.4);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 0 0 6px rgba(239,68,68,0.06),
            0 8px 32px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.08);
          animation: reject-pulse-ring 3s ease-in-out infinite;
        }
        @keyframes reject-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 6px rgba(239,68,68,0.06), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08); }
          50%       { box-shadow: 0 0 0 12px rgba(239,68,68,0.1), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08); }
        }

        .reject-x-icon { color: #f87171; filter: drop-shadow(0 0 8px rgba(239,68,68,0.6)); }

        .reject-text-area { text-align: center; }
        .reject-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.02em;
          background: linear-gradient(135deg, #ffffff 30%, #f87171 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
          margin-bottom: 10px;
        }
        .reject-subtitle {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
        }

        .reject-divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .reject-divider-line {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .reject-divider-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(239,68,68,0.5);
        }

        .reject-bottom {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .reject-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .reject-badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #f87171;
        }

        .reject-logout-btn {
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
        .reject-logout-btn:hover {
          background: rgba(239,68,68,0.25);
          border-color: rgba(239,68,68,0.5);
          color: #fecaca;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(239,68,68,0.2);
        }
        .reject-logout-btn:active {
          transform: translateY(0);
        }

        .reject-hint {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          text-align: center;
          line-height: 1.6;
        }
      `}</style>

      <div className="reject-page">
        <div className="reject-blob reject-blob-1" />
        <div className="reject-blob reject-blob-2" />
        <div className="reject-blob reject-blob-3" />
        <div className="reject-grid-overlay" />

        <div className="reject-card">
          {/* Icon */}
          <div className="reject-icon-ring">
            <svg className="reject-x-icon" width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Text */}
          <div className="reject-text-area">
            <div className="reject-title">การลงทะเบียนถูกปฏิเสธ</div>
            <p className="reject-subtitle">
              ขออภัย ข้อมูลการลงทะเบียนของท่านไม่ผ่านการอนุมัติ<br />
              กรุณาติดต่อผู้ดูแลระบบเพื่อแก้ไขข้อมูล<br />
              หรือสอบถามรายละเอียดเพิ่มเติม
            </p>
          </div>

          {/* Divider */}
          <div className="reject-divider">
            <div className="reject-divider-line" />
            <div className="reject-divider-dot" />
            <div className="reject-divider-line" />
          </div>

          {/* Bottom */}
          <div className="reject-bottom">
            <div className="reject-badge">
              <div className="reject-badge-dot" />
              ไม่ผ่านการอนุมัติ
            </div>

            <button onClick={handleLogout} className="reject-logout-btn">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              ออกจากระบบ
            </button>

            <span className="reject-hint">
              ติดต่อผู้ดูแลระบบที่ admin@ku.th
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
