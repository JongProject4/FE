'use client'
// src/components/chat/MessageList.tsx
import { Message } from '@/lib/store'
import Image from 'next/image'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const RISK_CONFIG = {
  LOW:    { label: '위험도: 낮음',  cls: 'bg-[#EAFBF1] text-[#52B788]' },
  MEDIUM: { label: '위험도: 중간',  cls: 'bg-[#FFF8E1] text-[#F59E0B]' },
  HIGH:   { label: '위험도: 높음',  cls: 'bg-[#FEF2F2] text-[#EF4444]' },
}

function formatTime(iso: string) {
  try { return format(new Date(iso), 'a h:mm', { locale: ko }) }
  catch { return '' }
}

function AIBubble({ msg }: { msg: Message }) {
  const risk = msg.riskLevel ? RISK_CONFIG[msg.riskLevel] : null

  return (
    <div className="flex items-end gap-2 animate-fade-up">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A90D9] to-[#52A8E8] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-1">
        AI
      </div>

      <div className="flex flex-col items-start max-w-[78%]">
        <div className="bg-white border border-[rgba(74,144,217,0.12)] rounded-[18px] rounded-bl-[6px] px-4 py-3 shadow-sm">
          {msg.isStreaming && !msg.content ? (
            <div className="flex gap-1.5 items-center py-1">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          ) : (
            <>
              <p className="text-[14px] text-[#1A2340] leading-relaxed whitespace-pre-wrap">
                {msg.content}
                {msg.isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-[#4A90D9] ml-0.5 animate-pulse" />
                )}
              </p>
              {risk && !msg.isStreaming && (
                <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold ${risk.cls}`}>
                  {risk.label}
                </span>
              )}
            </>
          )}
        </div>
        <span className="text-[10px] text-[#A0AABF] mt-1 ml-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  )
}

function UserBubble({ msg }: { msg: Message }) {
  return (
    <div className="flex items-end justify-end gap-2 animate-fade-up">
      <div className="flex flex-col items-end max-w-[78%]">
        {msg.imageUrl && (
          <div className="mb-2 rounded-[14px] overflow-hidden border border-[rgba(74,144,217,0.15)]">
            <img src={msg.imageUrl} alt="첨부 이미지" className="w-44 h-44 object-cover block" />
          </div>
        )}
        {msg.content && (
          <div className="bg-gradient-to-br from-[#4A90D9] to-[#52A8E8] rounded-[18px] rounded-br-[6px] px-4 py-3">
            <p className="text-[14px] text-white leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          </div>
        )}
        <span className="text-[10px] text-[#A0AABF] mt-1 mr-1">{formatTime(msg.timestamp)}</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-[#52B788] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-1">
        부
      </div>
    </div>
  )
}

export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {messages.map((msg) =>
        msg.role === 'assistant'
          ? <AIBubble key={msg.id} msg={msg} />
          : <UserBubble key={msg.id} msg={msg} />
      )}
    </div>
  )
}
