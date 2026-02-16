import React from 'react';
import { useRouter } from 'next/navigation';
import { AwardType } from '../hooks/useMasterData';

interface Props {
  award: AwardType;
  isDisabled?: boolean;
  disabledReason?: string;
}

export default function AwardCard({ award, isDisabled, disabledReason }: Props) {
  const router = useRouter();

  // Helper to map styles/icons based on award name keywords (Temporary until DB has these fields)
  const getStyle = (name: string) => {
    if (name.includes('ความคิดสร้างสรรค์')) {
      return {
        gradient: 'from-[#e0c3fc] to-[#8ec5fc]',
        iconColor: 'text-purple-500',
        btnColor: 'bg-[#74c69d] hover:bg-[#52b788]',
      };
    } else if (name.includes('กิจกรรมเสริมหลักสูตร')) {
      return {
        gradient: 'from-[#a1c4fd] to-[#c2e9fb]',
        iconColor: 'text-blue-500',
        btnColor: 'bg-[#74c69d] hover:bg-[#52b788]',
      };
    } else {
      // Conduct / Default
      return {
        gradient: 'from-[#fff1eb] to-[#ace0f9]',
        iconColor: 'text-yellow-500',
        btnColor: 'bg-[#74c69d] hover:bg-[#52b788]',
      };
    }
  };

  const style = getStyle(award.awardName);
  // Use DB data or fallback
  const description = award.description || 'ไม่มีคำอธิบาย';
  const displayTags = award.tags && award.tags.length > 0 ? award.tags : ['General'];

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
        <div className={`h-32 bg-gradient-to-b ${style.gradient} rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden group`}>
             <div className="absolute w-20 h-20 bg-white/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
             {award.iconUrl ? (
                 <img src={award.iconUrl} alt="icon" className="w-16 h-16 object-contain z-10" />
             ) : (
                <div className="bg-white p-3 rounded-full shadow-lg z-10">
                    <svg className={`w-8 h-8 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                    </svg>
                </div>
             )}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight min-h-[56px] line-clamp-2">
            {award.awardName}
        </h3>
        <p className="text-xs text-gray-500 mb-6 line-clamp-3 flex-grow">
            {description}
        </p>
        
        <div className="flex gap-2 mb-8 flex-wrap">
            {displayTags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600">
                {tag}
              </span>
            ))}
        </div>

        <button 
            onClick={() => {
                if (!isDisabled) {
                    router.push(`/student/create?type=${encodeURIComponent(award.id)}&mode=id`);
                }
            }} 
            disabled={isDisabled}
            className={`mt-auto w-full py-3 ${
                isDisabled 
                ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' 
                : `${style.btnColor} text-white shadow-lg shadow-green-100 hover:-translate-y-1`
            } rounded-2xl font-bold text-sm transition-all transform`}
        >
            {isDisabled ? (disabledReason || 'ไม่สามารถสมัครได้') : 'ส่งใบสมัคร'}
        </button>
    </div>
  );
}
