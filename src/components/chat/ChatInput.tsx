'use client'
// src/components/chat/ChatInput.tsx
import { useState, useRef, KeyboardEvent } from 'react'

interface Props {
  onSend: (text: string) => void
  onImageUpload: (dataUrl: string | null) => void
  uploadedImg: string | null
  disabled?: boolean
}

export function ChatInput({ onSend, onImageUpload, uploadedImg, disabled }: Props) {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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
    // Auto-resize
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

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'ko-KR'
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setText((prev) => prev + transcript)
    }
    recognition.start()
  }

  const canSend = (text.trim().length > 0 || !!uploadedImg) && !disabled

  return (
    <div className="px-4 pb-4 pt-2 bg-white border-t border-[rgba(74,144,217,0.1)] flex-shrink-0">
      {/* Image preview */}
      {uploadedImg && (
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <img src={uploadedImg} alt="" className="w-16 h-16 object-cover rounded-[10px] border border-[rgba(74,144,217,0.2)]" />
            <button
              onClick={() => onImageUpload(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#6B7A99] rounded-full flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          <span className="text-[12px] text-[#6B7A99]">사진이 첨부됩니다</span>
        </div>
      )}

      {/* Input row */}
      <div className={`flex items-end gap-2 bg-[#F5F8FF] rounded-[22px] px-3 py-2 border transition-colors ${
        disabled ? 'border-[rgba(74,144,217,0.1)]' : 'border-[rgba(74,144,217,0.2)] focus-within:border-[#4A90D9]'
      }`}>
        {/* Image upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-8 h-8 flex items-center justify-center text-[#A0AABF] hover:text-[#4A90D9] flex-shrink-0 mb-0.5 transition-colors disabled:opacity-40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? '아이를 선택해주세요...' : '증상이나 걱정되는 것을 입력하세요...'}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[14px] text-[#1A2340] placeholder-[#A0AABF] resize-none outline-none leading-relaxed py-1 min-w-0 disabled:opacity-40"
          style={{ maxHeight: '120px' }}
        />

        {/* Voice input */}
        <button
          onClick={toggleVoice}
          disabled={disabled}
          className={`w-8 h-8 flex items-center justify-center flex-shrink-0 mb-0.5 transition-colors disabled:opacity-40 ${
            isListening ? 'text-[#EF4444]' : 'text-[#A0AABF] hover:text-[#4A90D9]'
          }`}
        >
          {isListening ? (
            <div className="w-4 h-4 rounded-full bg-[#EF4444] animate-pulse" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10c0 4 3 7 7 7s7-3 7-7"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
            </svg>
          )}
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            canSend
              ? 'bg-gradient-to-br from-[#4A90D9] to-[#52A8E8] active:scale-90'
              : 'bg-[#E8EEF5] cursor-not-allowed'
          }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke={canSend ? 'white' : '#A0AABF'} strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={canSend ? 'white' : '#A0AABF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
