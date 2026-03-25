'use client'
// src/components/chat/WelcomeScreen.tsx

const SAMPLE_QUESTIONS = [
  { icon: '🌡️', text: '열이 38.5도예요. 어떻게 해야 할까요?' },
  { icon: '😮‍💨', text: '기침이 3일째 계속돼요' },
  { icon: '🔴', text: '발진이 생겼는데 알레르기인가요?' },
  { icon: '🍽️', text: '아이가 밥을 잘 안 먹어요' },
]

interface Props {
  onSampleClick: (text: string) => void
}

export function WelcomeScreen({ onSampleClick }: Props) {
  return (
    <div className="flex flex-col items-center px-5 pt-10 pb-6 animate-fade-in">
      {/* Icon */}
      <div className="w-16 h-16 bg-[#EBF4FF] rounded-[22px] flex items-center justify-center mb-5 overflow-hidden p-1 shadow-sm">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-full h-full object-contain"
        />
      </div>

      <h2 className="text-[19px] font-bold text-[#1A2340] text-center mb-2">
        안녕하세요?
      </h2>


      {/* Sample questions */}
      <div className="w-full flex flex-col gap-2.5">
        <p className="text-[11px] font-semibold text-[#A0AABF] uppercase tracking-wider mb-1">
          자주 묻는 질문
        </p>
        {SAMPLE_QUESTIONS.map(({ icon, text }) => (
          <button
            key={text}
            onClick={() => onSampleClick(text)}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-[rgba(74,144,217,0.15)] rounded-[14px] text-left active:scale-[0.98] transition-transform hover:border-[#4A90D9] hover:bg-[#EBF4FF]"
          >
            <span className="text-lg flex-shrink-0">{icon}</span>
            <span className="text-[14px] text-[#1A2340] leading-snug">{text}</span>
            <svg className="ml-auto flex-shrink-0" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="#A0AABF" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>


    </div>
  )
}
