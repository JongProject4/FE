'use client'
// src/components/chat/VoiceMode.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSend: (text: string) => void
    onSendVoice?: (blob: Blob) => void
    disabled?: boolean
}

type VoiceState = 'idle' | 'listening' | 'processing'

export function VoiceMode({ isOpen, onClose, onSend, disabled }: Props) {
    const [voiceState, setVoiceState] = useState<VoiceState>('idle')
    const [transcript, setTranscript] = useState('')
    const [inputText, setInputText] = useState('')
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    // Start listening automatically when opened
    useEffect(() => {
        if (isOpen) {
            setTranscript('')
            setInputText('')
            setRecordedBlob(null)
            setVoiceState('idle')
            // Auto start after short delay
            const t = setTimeout(() => startListening(), 600)
            return () => clearTimeout(t)
        } else {
            stopListening()
        }
    }, [isOpen])

    const startListening = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data)
                }
            }
            mediaRecorder.start()
            setVoiceState('listening')
            setRecordedBlob(null)
            setTranscript('')
        } catch (err) {
            alert('마이크 접근 권한이 필요합니다.')
        }
    }, [])

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                setRecordedBlob(audioBlob)
            }
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
        }
        setVoiceState('idle')
    }, [])

    const handleSendVoice = () => {
        if (inputText.trim()) {
            onSend(inputText.trim())
            onClose()
            return
        }
        if (recordedBlob && onSendVoice) {
            onSendVoice(recordedBlob)
            onClose()
        } else if (recordedBlob) {
            // fallback if onSendVoice not implemented
            onSend('음성 메시지')
            onClose()
        }
    }

    const handleToggleMic = () => {
        if (voiceState === 'listening') {
            stopListening()
        } else {
            setTranscript('')
            startListening()
        }
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        // images handled by parent — close voice mode and let parent open camera
        e.target.value = ''
    }

    const handleClose = () => {
        stopListening()
        setTranscript('')
        setInputText('')
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 m-auto max-w-[430px] h-dvh z-[998] flex flex-col bg-[#F8FAFB] overflow-hidden"
                >
                    {/* Top area — logo / title */}
                    <div className="pt-12 pb-4 flex flex-col items-center">
                        <p className="text-[13px] font-semibold text-[#1e293b] tracking-wide">
                            ChatGPT 음성
                        </p>
                    </div>

                    {/* Centered orb area */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
                        {/* Animated Orb */}
                        <div className="relative flex items-center justify-center">
                            {/* Outer glow rings — pulse when listening */}
                            {voiceState === 'listening' && (
                                <>
                                    <motion.div
                                        className="absolute rounded-full bg-blue-300/20"
                                        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{ width: 220, height: 220 }}
                                    />
                                    <motion.div
                                        className="absolute rounded-full bg-blue-400/15"
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                                        style={{ width: 200, height: 200 }}
                                    />
                                </>
                            )}

                            {/* Main orb */}
                            <motion.div
                                className="relative w-40 h-40 rounded-full overflow-hidden shadow-[0_20px_60px_rgba(100,170,255,0.35)]"
                                animate={
                                    voiceState === 'listening'
                                        ? { scale: [1, 1.06, 1] }
                                        : { scale: 1 }
                                }
                                transition={{ duration: 1.8, repeat: voiceState === 'listening' ? Infinity : 0, ease: 'easeInOut' }}
                            >
                                {/* Sky gradient */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: 'radial-gradient(ellipse at 40% 35%, #e0f0ff 0%, #a8d4f5 20%, #6bb3f0 45%, #3a8fd4 70%, #1a6ab5 90%)',
                                    }}
                                />
                                {/* Cloud blobs */}
                                <div
                                    className="absolute"
                                    style={{
                                        top: '22%', left: '15%',
                                        width: '70%', height: '35%',
                                        background: 'radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, rgba(220,235,255,0.5) 60%, transparent 100%)',
                                        borderRadius: '50%',
                                        filter: 'blur(6px)',
                                    }}
                                />
                                <div
                                    className="absolute"
                                    style={{
                                        top: '35%', left: '30%',
                                        width: '45%', height: '25%',
                                        background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 100%)',
                                        borderRadius: '50%',
                                        filter: 'blur(4px)',
                                    }}
                                />
                                {/* Animated shimmer on listening */}
                                {voiceState === 'listening' && (
                                    <motion.div
                                        className="absolute inset-0"
                                        style={{
                                            background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 70%)',
                                        }}
                                        animate={{ opacity: [0, 0.6, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                )}
                            </motion.div>
                        </div>

                        {/* Transcript / Status */}
                        <div className="w-full text-center min-h-[60px] flex flex-col items-center justify-center">
                            {voiceState === 'idle' && !recordedBlob && !inputText && (
                                <p className="text-[15px] text-[#94A3B8]">마이크를 눌러 말씀하세요</p>
                            )}
                            {voiceState === 'listening' && (
                                <div className="flex items-center gap-1.5 flex-col">
                                    <p className="text-[14px] text-[#3a8fd4] mb-2">듣고 있습니다...</p>
                                    <div className="flex items-center gap-1.5">
                                        {[0, 0.2, 0.4].map((delay, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 rounded-full bg-[#3a8fd4]"
                                                animate={{ height: ['8px', '20px', '8px'] }}
                                                transition={{ duration: 0.8, repeat: Infinity, delay }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {recordedBlob && voiceState === 'idle' && !inputText && (
                                <p className="text-[16px] text-[#1e293b] font-medium leading-relaxed px-4">
                                    음성이 녹음되었습니다. 전송을 눌러주세요.
                                </p>
                            )}
                        </div>

                        {/* Send voice message button — appears when there's recording */}
                        {(recordedBlob || inputText.trim()) && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleSendVoice}
                                disabled={disabled}
                                className="px-8 py-3 bg-gradient-to-r from-[#52B788] to-[#6EE7B7] text-white font-bold text-[15px] rounded-full shadow-[0_8px_20px_rgba(82,183,136,0.4)] active:scale-95 transition-all disabled:opacity-50"
                            >
                                전송 →
                            </motion.button>
                        )}
                    </div>

                    {/* Bottom bar — identical to ChatGPT voice mode */}
                    <div className="bg-white border-t border-[#E2E8F0] px-4 py-3 flex items-center gap-3 flex-shrink-0 pb-safe">
                        {/* + button */}
                        <button className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] transition-colors active:scale-90">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>

                        {/* Text input */}
                        <div className="flex-1 bg-[#F1F5F9] rounded-[20px] px-4 py-2.5 flex items-center">
                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendVoice() }}
                                placeholder="타이핑"
                                className="w-full bg-transparent text-[15px] text-[#1e293b] outline-none placeholder-[#94A3B8]"
                            />
                        </div>

                        {/* Camera button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] transition-colors active:scale-90"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15 8.5V8a3 3 0 0 0-6 0v.5A2.5 2.5 0 0 0 7 11v5a2.5 2.5 0 0 0 2.5 2.5h5A2.5 2.5 0 0 0 17 16v-5A2.5 2.5 0 0 0 15 8.5zM9 8a3 3 0 0 1 6 0v.17A2.5 2.5 0 0 0 15 8.5V8a1 1 0 0 0-2 0v.5h-2V8a1 1 0 0 0-2 0v.5A2.5 2.5 0 0 0 9 8.17V8z" />
                                <rect x="2" y="6" width="20" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                <circle cx="12" cy="13" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                <rect x="15" y="8" width="3" height="2" rx="0.5" />
                            </svg>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

                        {/* Mic toggle button */}
                        <button
                            onClick={handleToggleMic}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${voiceState === 'listening'
                                ? 'bg-[#EF4444] text-white shadow-[0_4px_15px_rgba(239,68,68,0.4)]'
                                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                                }`}
                        >
                            {voiceState === 'listening' ? (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                        <rect x="9" y="2" width="6" height="12" rx="3" />
                                        <path d="M5 10c0 4 3 7 7 7s7-3 7-7" />
                                        <line x1="12" y1="17" x2="12" y2="21" />
                                        <line x1="8" y1="21" x2="16" y2="21" />
                                    </svg>
                                </motion.div>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                    <rect x="9" y="2" width="6" height="12" rx="3" />
                                    <path d="M5 10c0 4 3 7 7 7s7-3 7-7" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                </svg>
                            )}
                        </button>

                        {/* Close / X button */}
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-[#334155] transition-colors active:scale-90 shadow-sm"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
