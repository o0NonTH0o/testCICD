'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'STUDENT') {
        router.push('/student/home');
      } else if (user.role === 'HEAD_OF_DEPARTMENT') {
        router.push('/head_of_department/home');
      } else if (user.role === 'VICE_DEAN') {
        router.push('/vice_dean/home');
      } else if (user.role === 'DEAN') {
        router.push('/dean/home');
      } else if (user.role === 'COMMITTEE') {
        router.push('/committee/home');
      } else {
        // ADMIN, etc.
        router.push('/admin/home');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '2.5px solid transparent',
          borderTopColor: '#d4a614',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Sarabun:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
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

        .login-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.55;
          animation: login-drift 12s ease-in-out infinite alternate;
        }
        .login-blob-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, #2e6f40 0%, #1a4028 60%, transparent 100%);
          top: -160px; left: -160px;
          animation-duration: 14s;
        }
        .login-blob-2 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, #b8960c 0%, #7a6008 60%, transparent 100%);
          bottom: -140px; right: -120px;
          animation-duration: 10s; animation-delay: -4s;
        }
        .login-blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #1d5c3a 0%, #0f3020 70%, transparent 100%);
          top: 50%; left: 55%;
          transform: translate(-50%, -50%);
          animation-duration: 18s; animation-delay: -7s;
        }
        @keyframes login-drift {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(30px, -20px) scale(1.07); }
          100% { transform: translate(-20px, 30px) scale(0.95); }
        }

        .login-grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .login-card {
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
          gap: 36px;
          animation: login-cardIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes login-cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(184,150,12,0.7), transparent);
          border-radius: 999px;
        }

        .login-logo-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .login-emblem-ring {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a4028 0%, #0f2a1a 100%);
          border: 1.5px solid rgba(184,150,12,0.4);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 0 0 6px rgba(184,150,12,0.06),
            0 8px 32px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.08);
          animation: login-pulse-ring 3s ease-in-out infinite;
        }
        @keyframes login-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 6px rgba(184,150,12,0.06), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08); }
          50%       { box-shadow: 0 0 0 10px rgba(184,150,12,0.12), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08); }
        }

        .login-star-icon { color: #d4a614; filter: drop-shadow(0 0 8px rgba(212,166,20,0.6)); }

        .login-logo-text { text-align: center; }
        .login-logo-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.02em;
          background: linear-gradient(135deg, #ffffff 30%, #d4a614 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }
        .login-logo-sub {
          margin-top: 6px;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }

        .login-divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .login-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .login-divider-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(212,166,20,0.5);
        }

        .login-bottom {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .login-hint {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.04em;
        }

        .login-google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 15px 24px;
          border-radius: 14px;
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(255,255,255,0.2);
          color: #1a1a1a;
          text-decoration: none;
          font-family: 'Sarabun', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.6) inset;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: pointer;
        }
        .login-google-btn:hover {
          background: #ffffff;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.8) inset;
          transform: translateY(-2px);
        }
        .login-google-btn:active {
          transform: translateY(0px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }

        .login-google-icon { width: 20px; height: 20px; flex-shrink: 0; }

        .login-ku-badge {
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
        .login-ku-dot { width: 5px; height: 5px; border-radius: 50%; background: #d4a614; }
      `}</style>

      <div className="login-page">
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
        <div className="login-blob login-blob-3" />
        <div className="login-grid-overlay" />

        <div className="login-card">
          {/* Logo */}
          <div className="login-logo-area">
            <div className="login-emblem-ring">
              <svg className="login-star-icon" width="36" height="36" viewBox="0 0 40 40" fill="none">
                <path d="M20 2L24.49 13.82H39.02L27.27 22.36L31.76 36.18L20 27.64L8.24 36.18L12.73 22.36L0.98 13.82H15.51L20 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="login-logo-text">
              <div className="login-logo-title">KU Nisit Deeden</div>
              <div className="login-logo-sub">Kasetsart University Student Award</div>
            </div>
          </div>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <div className="login-divider-dot" />
            <div className="login-divider-line" />
          </div>

          {/* Bottom */}
          <div className="login-bottom">
            <div className="login-ku-badge">
              <div className="login-ku-dot" />
              เฉพาะนิสิต มก. เท่านั้น
            </div>

            <a href="http://localhost:8080/auth/google" className="login-google-btn">
              <svg className="login-google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.24.81-.6z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              เข้าสู่ระบบด้วย Google @ku.th
            </a>

            <span className="login-hint">ระบบจะนำคุณไปยังหน้า Google Sign-In</span>
          </div>
        </div>
      </div>
    </>
  );
}