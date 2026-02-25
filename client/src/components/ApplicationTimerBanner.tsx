import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { ApplicationPeriod } from '../hooks/useMasterData';

interface ApplicationTimerBannerProps {
  activePeriod: ApplicationPeriod | null;
  className?: string; // Additional classes for wrapper
  overrideTitle?: string; // Optional: Allow overriding the title (e.g. for Admin preview)
}

export default function ApplicationTimerBanner({ activePeriod, className = '', overrideTitle }: ApplicationTimerBannerProps) {
  const timeLeft = useCountdown(activePeriod?.endDate || null);

  return (
    <div className={`bg-gradient-to-r from-[#74c69d] to-[#b7e4c7] rounded-[30px] p-10 text-white flex flex-col items-center justify-center shadow-lg relative overflow-hidden min-h-[300px] ${className}`}>
      {/* Abstract Circle Decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      
      {activePeriod ? (
        <>
          <h2 className="text-2xl md:text-3xl font-medium mb-6 tracking-wide drop-shadow-sm uppercase text-center">
             {overrideTitle || `Application Time ${activePeriod.academicYear}/${activePeriod.semester}`}
          </h2>
          
          <div className="flex justify-center gap-4 text-white text-4xl md:text-5xl font-light tracking-wide drop-shadow-md tabular-nums relative z-10">
             <div className="flex items-baseline"><span className="font-bold">{timeLeft.days}</span> <span className="text-lg md:text-xl ml-1 font-normal opacity-80">d</span></div>
             <div className="flex items-baseline"><span className="font-bold">{timeLeft.hours}</span> <span className="text-lg md:text-xl ml-1 font-normal opacity-80">hr</span></div>
             <div className="flex items-baseline"><span className="font-bold">{timeLeft.minutes}</span> <span className="text-lg md:text-xl ml-1 font-normal opacity-80">m</span></div>
             <div className="flex items-baseline"><span className="font-bold">{timeLeft.seconds}</span> <span className="text-lg md:text-xl ml-1 font-normal opacity-80">s</span></div>
          </div>

          <p className="opacity-80 mt-6 text-sm md:text-base font-medium relative z-10">
             Ends on {new Date(activePeriod.endDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full z-10 text-center">
           <svg className="w-16 h-16 mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <h2 className="text-3xl font-medium mb-2 tracking-wide">ไม่อยู่ในช่วงรับสมัคร</h2>
           <p className="opacity-80">โปรดติดตามประกาศจากทางคณะ/มหาวิทยาลัย</p>
        </div>
      )}
    </div>
  );
}
