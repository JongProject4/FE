'use client'
// src/components/chat/ChatInput.tsx
import { useState, useRef, KeyboardEvent } from 'react'

interface Props {
  onSend: (text: string) => void
  onSendVoice?: (blob: Blob) => void
  onImageUpload: (dataUrl: string | null) => void
  uploadedImg: string | null
  disabled?: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement>
  onBeforeFocus?: () => boolean
  onBeforeVoiceOpen?: () => boolean
  onOpenVoiceMode?: () => void
  needsChildSelection?: boolean
}

function AudioWaveIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="18" fill="#1e293b" />
      <rect x="9" y="14" width="2.2" height="8" rx="1.1" fill="white" />
      <rect x="13" y="11" width="2.2" height="14" rx="1.1" fill="white" />
      <rect x="17" y="13" width="2.2" height="10" rx="1.1" fill="white" />
      <rect x="21" y="10" width="2.2" height="16" rx="1.1" fill="white" />
      <rect x="25" y="14" width="2.2" height="8" rx="1.1" fill="white" />
    </svg>
  )
}

export function ChatInput({
  onSend,
  onImageUpload,
  uploadedImg,
  disabled,
  inputRef,
  onBeforeFocus,
  onBeforeVoiceOpen,
  onOpenVoiceMode,
  needsChildSelection,
}: Props) {
  const [text, setText] = useState('')
  const localTextareaRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = inputRef ?? localTextareaRef
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if ((!text.trim() && !uploadedImg) || disabled) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onImageUpload(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onBeforeFocus && !onBeforeFocus()) {
      e.target.blur()
    }
  }

  const handleVoiceClick = () => {
    if (disabled) return
    if (onBeforeVoiceOpen && !onBeforeVoiceOpen()) return
    onOpenVoiceMode?.()
  }

  const canSend = (text.trim().length > 0 || !!uploadedImg) && !disabled

  return (
    <div className="px-4 pb-4 pt-2 bg-white border-t border-[rgba(82,183,136,0.1)] flex-shrink-0">
      {uploadedImg && (
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <img src={uploadedImg} alt="" className="w-16 h-16 object-cover rounded-[10px] border border-[rgba(82,183,136,0.2)]" />
            <button
              onClick={() => onImageUpload(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#475569] rounded-full flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </button>
          </div>
          <span className="text-[12px] text-[#475569]">사진이 첨부됩니다</span>
        </div>
      )}

      <div className={`flex items-end gap-2 bg-[#F4FCFB] rounded-[22px] px-3 py-2 border transition-colors ${disabled ? 'border-[rgba(82,183,136,0.1)]' : 'border-[rgba(82,183,136,0.2)] focus-within:border-[#52B788]'
        }`}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-8 h-8 flex items-center justify-center text-[#94A3B8] hover:text-[#52B788] flex-shrink-0 mb-0.5 transition-colors disabled:opacity-40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={
            needsChildSelection
              ? '탭하여 상담할 아이를 선택하세요...'
              : disabled
                ? '잠시만 기다려주세요...'
                : '증상이나 걱정되는 것을 입력하세요...'
          }
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[14px] text-[#334155] placeholder-[#94A3B8] resize-none outline-none leading-relaxed py-1 min-w-0 disabled:opacity-40"
          style={{ maxHeight: '120px' }}
        />

        <button
          onClick={handleVoiceClick}
          disabled={disabled}
          title="음성 대화 모드"
          className="flex items-center justify-center flex-shrink-0 mb-0.5 active:scale-90 transition-transform disabled:opacity-40"
        >
          <AudioWaveIcon />
        </button>

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${canSend
            ? 'bg-gradient-to-br from-[#52B788] to-[#6EE7B7] active:scale-90'
            : 'bg-[#EBF7F2] cursor-not-allowed'
            }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke={canSend ? 'white' : '#94A3B8'} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={canSend ? 'white' : '#94A3B8'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
