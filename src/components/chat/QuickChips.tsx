'use client'
// src/components/chat/QuickChips.tsx

const CHIPS = [
  '병원에 가야 할까요?',
  '집에서 어떻게 돌봐야 할까요?',
  '언제 나아질까요?',
  '다른 증상이 있어요',
  '약을 먹여도 될까요?',
]

interface Props {
  onChipClick: (text: string) => void
}

export function QuickChips({ onChipClick }: Props) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto flex-shrink-0 scrollbar-none -webkit-overflow-scrolling-touch">
      {CHIPS.map((chip) => (
        <button
          key={chip}
          onClick={() => onChipClick(chip)}
          className="flex-shrink-0 px-3.5 py-2 bg-white border border-[rgba(74,144,217,0.2)] rounded-full text-[12px] font-medium text-[#4A90D9] active:scale-95 transition-transform hover:bg-[#EBF4FF] whitespace-nowrap"
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
