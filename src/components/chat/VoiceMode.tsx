'use client'
// src/components/chat/VoiceMode.tsx
// Gemini-like Voice Chat Mode — full duplex voice conversation
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendVoiceMessageStream, ChatStreamResponse, createChat, ChildResponse } from '@/lib/api'
import { getChildColor } from '@/lib/childColors'
import {
    buildChatTitleFromHistory,
    fetchChatHistory,
    historyToMessages,
} from '@/lib/chatHistory'
import { useAppStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface Props {
    isOpen: boolean
    onClose: () => void
    activeChild: ChildResponse | null
    onSendVoice?: (blob: Blob) => void
    disabled?: boolean
}

// WAV Encoder utility function to guarantee 16kHz LINEAR16 formatting
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitDepth = 16;
    let result: Float32Array;

    if (numChannels === 2) {
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);
        result = new Float32Array(left.length * 2);
        for (let i = 0; i < left.length; i++) {
            result[i * 2] = left[i];
            result[i * 2 + 1] = right[i];
        }
    } else {
        result = buffer.getChannelData(0);
    }

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const wavBuffer = new ArrayBuffer(44 + result.length * bytesPerSample);
    const view = new DataView(wavBuffer);

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + result.length * bytesPerSample, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, result.length * bytesPerSample, true);

    let offset = 44;
    for (let i = 0; i < result.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, result[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([wavBuffer], { type: 'audio/wav' });
}

// Gemini TTS returns raw PCM (LINEAR16, 24kHz, mono) without WAV headers.
// AudioContext.decodeAudioData() needs a container format, so we wrap it.
function pcmToWav(pcmData: Uint8Array, numChannels = 1, sampleRate = 24000): ArrayBuffer {
    const bitDepth = 16
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    const wavBuffer = new ArrayBuffer(44 + pcmData.length)
    const view = new DataView(wavBuffer)
    const ws = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
    }
    ws(0, 'RIFF')
    view.setUint32(4, 36 + pcmData.length, true)
    ws(8, 'WAVE')
    ws(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    ws(36, 'data')
    view.setUint32(40, pcmData.length, true)
    new Uint8Array(wavBuffer).set(pcmData, 44)
    return wavBuffer
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking'

export function VoiceMode({ isOpen, onClose, activeChild, onSendVoice, disabled }: Props) {
    const [voiceState, setVoiceState] = useState<VoiceState>('idle')
    const [transcript, setTranscript] = useState('')
    const [aiText, setAiText] = useState('')
    const [statusText, setStatusText] = useState('마이크를 눌러 말씀하세요')
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    // Audio playback refs
    const audioCtxRef = useRef<AudioContext | null>(null)
    const nextAudioTimeRef = useRef<number>(0)
    const sourceNodesRef = useRef<AudioBufferSourceNode[]>([])

    // Chat room ref
    const chatIdRef = useRef<string | null>(null)
    const childRef = useRef<ChildResponse | null>(null)

    const { consultationId, setConsultationId, addMessage, addChatSession, updateChatSession, updateLastMessage, setMessages } = useAppStore()

    // consultationId 변경 시 ref만 동기화 (UI 초기화·재녹음 트리거 금지)
    useEffect(() => {
        chatIdRef.current = consultationId || null
    }, [consultationId])

    // 모달 열림/닫힘 시에만 초기화
    useEffect(() => {
        if (!isOpen) {
            stopListening()
            stopAllAudio()
            return
        }
        if (!activeChild) return

        childRef.current = activeChild
        setTranscript('')
        setAiText('')
        setVoiceState('idle')
        setStatusText('마이크를 눌러 말씀하세요')

        const t = setTimeout(() => startListening(), 700)
        return () => clearTimeout(t)
    }, [isOpen, activeChild])

    const getOrCreateChatRoom = useCallback(async (): Promise<string> => {
        if (chatIdRef.current) return chatIdRef.current

        const child = childRef.current
        if (!child) throw new Error('아이를 먼저 등록해주세요.')

        const newRoom = await createChat({ childId: child.id })
        chatIdRef.current = String(newRoom.chatId)
        setConsultationId(chatIdRef.current)
        addChatSession({
            id: newRoom.chatId,
            title: '음성 상담',
            date: new Date().toLocaleDateString('ko-KR'),
            childId: String(child.id),
            childName: child.name,
            isVoice: true,
        })
        return chatIdRef.current
    }, [setConsultationId, addChatSession])

    const syncTitleFromBackend = useCallback(async (roomId: string) => {
        try {
            const history = await fetchChatHistory(Number(roomId))
            const title = buildChatTitleFromHistory(history, 30)
            if (title) {
                updateChatSession(Number(roomId), { title, isVoice: true })
            }
        } catch (e) {
            console.error('Failed to sync voice chat title', e)
        }
    }, [updateChatSession])

    const syncHistoryFromBackend = useCallback(async (roomId: string) => {
        try {
            const history = await fetchChatHistory(Number(roomId))
            setMessages(historyToMessages(history))
            const title = buildChatTitleFromHistory(history, 30)
            if (title) {
                updateChatSession(Number(roomId), { title, isVoice: true })
            }
            return history
        } catch (e) {
            console.error('Failed to sync voice chat history', e)
            return null
        }
    }, [setMessages, updateChatSession])

    const isFinalReceivedRef = useRef(false)
    const audioQueueRef = useRef<string[]>([])
    const isProcessingQueueRef = useRef(false)

    const decodeAndScheduleAudio = useCallback(async (base64: string) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        const ctx = audioCtxRef.current
        if (ctx.state === 'suspended') await ctx.resume()

        try {
            const binary = atob(base64)
            const bytes = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

            let buffer: AudioBuffer
            try {
                buffer = await ctx.decodeAudioData(bytes.buffer.slice(0))
            } catch {
                buffer = await ctx.decodeAudioData(pcmToWav(bytes, 1, 24000))
            }
            const source = ctx.createBufferSource()
            source.onended = () => {
                sourceNodesRef.current = sourceNodesRef.current.filter(s => s !== source)
                if (sourceNodesRef.current.length === 0 && isFinalReceivedRef.current) {
                    setVoiceState(prev => (prev === 'speaking' ? 'idle' : prev))
                    setStatusText('마이크를 눌러 다시 말씀하세요')
                }
            }
            source.buffer = buffer
            source.connect(ctx.destination)

            const startTime = Math.max(nextAudioTimeRef.current, ctx.currentTime)
            source.start(startTime)
            nextAudioTimeRef.current = startTime + buffer.duration
            sourceNodesRef.current.push(source)
        } catch (e) {
            console.warn('AudioContext playback failed, trying HTMLAudio fallback', e)
            try {
                const blob = new Blob([new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)))], { type: 'audio/wav' })
                const url = URL.createObjectURL(blob)
                const audio = new Audio(url)
                audio.play()
                audio.onended = () => {
                    URL.revokeObjectURL(url)
                    // Simplified logic for fallback: if no nodes left, go idle
                    if (sourceNodesRef.current.length === 0 && isFinalReceivedRef.current) {
                        setVoiceState(prev => (prev === 'speaking' ? 'idle' : prev))
                        setStatusText('마이크를 눌러 다시 말씀하세요')
                    }
                }
            } catch (fallbackErr) {
                console.error('All audio methods failed', fallbackErr)
            }
        }
    }, [])

    const processAudioQueue = useCallback(async () => {
        if (isProcessingQueueRef.current) return
        isProcessingQueueRef.current = true
        while (audioQueueRef.current.length > 0) {
            const next = audioQueueRef.current.shift()
            if (next) await decodeAndScheduleAudio(next)
        }
        isProcessingQueueRef.current = false
    }, [decodeAndScheduleAudio])

    const playAudioChunk = useCallback((base64: string) => {
        audioQueueRef.current.push(base64)
        processAudioQueue()
    }, [processAudioQueue])

    const stopAllAudio = useCallback(() => {
        isProcessingQueueRef.current = false
        audioQueueRef.current = []
        isFinalReceivedRef.current = false
        sourceNodesRef.current.forEach(s => {
            try {
                s.onended = null
                s.stop()
            } catch { }
        })
        sourceNodesRef.current = []
        nextAudioTimeRef.current = 0
    }, [])

    const startListening = useCallback(async () => {
        try {
            stopAllAudio()
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            })

            // Backend supports WEBM_OPUS at 48kHz — Chrome default
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : ''

            const recorderOptions: MediaRecorderOptions = {}
            if (mimeType) recorderOptions.mimeType = mimeType

            const mediaRecorder = new MediaRecorder(stream, recorderOptions)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }

            // When recording stops, automatically send to backend
            mediaRecorder.onstop = async () => {
                const finalMime = mediaRecorder.mimeType || mimeType || 'audio/webm'
                const audioBlob = new Blob(audioChunksRef.current, { type: finalMime })
                stream.getTracks().forEach(t => t.stop())

                console.log(`[VoiceMode] Recording done: ${audioBlob.size} bytes, mime=${finalMime}`)

                if (audioBlob.size < 500) {
                    setStatusText('음성이 너무 짧습니다. 다시 말씀하세요.')
                    setVoiceState('idle')
                    return
                }

                setStatusText('음성을 분석하고 있습니다...')
                setVoiceState('processing')
                setAiText('')

                try {
                    // Convert whatever format the browser recorded into 16000Hz WAV
                    // This perfectly matches the backend Google STT expectations for LINEAR16
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
                    const arrayBuffer = await audioBlob.arrayBuffer()
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
                    audioContext.close() // Close context to prevent leaks

                    const wavBlob = audioBufferToWavBlob(audioBuffer)
                    console.log(`[VoiceMode] Converted to WAV, new size: ${wavBlob.size} bytes`)

                    await handleVoiceToBackend(wavBlob)
                } catch (e) {
                    console.error('Audio conversion failed:', e)
                    // fallback to original if conversion fails
                    await handleVoiceToBackend(audioBlob)
                }
            }

            mediaRecorder.start(200) // collect data every 200ms
            setVoiceState('listening')
            setTranscript('')
            setAiText('')
            setStatusText('듣고 있습니다...')
        } catch (err) {
            console.error('Mic error:', err)
            toast.error('마이크 접근 권한이 필요합니다.')
            setStatusText('마이크 권한을 허용해주세요')
        }
    }, [])

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
    }, [])

    const handleVoiceToBackend = useCallback(async (blob: Blob) => {
        setVoiceState('processing')
        setStatusText('음성을 분석하고 있습니다...')
        setAiText('')
        nextAudioTimeRef.current = 0

        try {
            const roomId = await getOrCreateChatRoom()
            let fullText = ''
            let gotTranscript = false

            // Add user message placeholder to chat store
            const userMsgId = Date.now().toString()
            addMessage({
                id: userMsgId,
                role: 'user',
                content: '음성 인식 중...',
                timestamp: new Date().toISOString(),
            })

            // Add AI placeholder
            addMessage({
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
                timestamp: new Date().toISOString(),
                isStreaming: true,
            })

            await sendVoiceMessageStream(Number(roomId), blob, (chunk: ChatStreamResponse) => {
                if (chunk.transcript) {
                    setTranscript(chunk.transcript)
                    if (!gotTranscript) gotTranscript = true
                    useAppStore.setState(s => {
                        const msgs = [...s.messages]
                        const uIdx = msgs.findIndex(m => m.id === userMsgId)
                        if (uIdx !== -1) msgs[uIdx] = { ...msgs[uIdx], content: chunk.transcript! }
                        return { messages: msgs }
                    })
                }

                // AI text response (for display)
                if (chunk.text) {
                    fullText += chunk.text
                    setAiText(fullText)
                    updateLastMessage(fullText, false)
                    setVoiceState('speaking')
                    setStatusText('AI가 답변 중입니다...')
                }

                // Audio chunk — play it!
                if (chunk.audio) {
                    setVoiceState('speaking')
                    playAudioChunk(chunk.audio)
                }

                if (chunk.isFinal) {
                    isFinalReceivedRef.current = true
                    updateLastMessage(fullText || '(음성 응답)', true)
                }
            })

            await syncTitleFromBackend(roomId)
        } catch (err: any) {
            console.error('[VoiceMode Backend Error]', err)
            setStatusText('오류가 발생했습니다. 다시 시도하세요.')
            setVoiceState('idle')
            updateLastMessage('죄송합니다. 음성 처리 중 오류가 발생했습니다.', true)
            toast.error(err.message || '음성 처리 실패')
        }
    }, [getOrCreateChatRoom, addMessage, updateLastMessage, playAudioChunk, syncTitleFromBackend])

    const handleMicButton = () => {
        if (voiceState === 'listening') {
            // Stop recording → triggers onstop → auto-sends
            stopListening()
        } else if (voiceState === 'idle') {
            startListening()
        } else if (voiceState === 'speaking') {
            // Stop AI audio and start new recording
            stopAllAudio()
            setVoiceState('idle')
            setTimeout(() => startListening(), 300)
        }
        // If 'processing', ignore taps
    }

    const handleClose = async () => {
        stopListening()
        stopAllAudio()
        const roomId = chatIdRef.current || consultationId
        if (roomId) {
            await syncHistoryFromBackend(roomId)
        }
        setTranscript('')
        setAiText('')
        onClose()
    }

    // Determine orb colors based on state
    const getOrbStyle = () => {
        switch (voiceState) {
            case 'listening':
                return {
                    background: 'radial-gradient(ellipse at 40% 35%, #e0f0ff 0%, #a8d4f5 20%, #6bb3f0 45%, #3a8fd4 70%, #1a6ab5 90%)',
                    shadow: '0 20px 60px rgba(100,170,255,0.45)',
                }
            case 'processing':
                return {
                    background: 'radial-gradient(ellipse at 40% 35%, #fef3c7 0%, #fbbf24 30%, #f59e0b 55%, #d97706 80%)',
                    shadow: '0 20px 60px rgba(245,158,11,0.4)',
                }
            case 'speaking':
                return {
                    background: 'radial-gradient(ellipse at 40% 35%, #d1fae5 0%, #6ee7b7 25%, #34d399 50%, #10b981 75%, #059669 95%)',
                    shadow: '0 20px 60px rgba(16,185,129,0.45)',
                }
            default:
                return {
                    background: 'radial-gradient(ellipse at 40% 35%, #f1f5f9 0%, #cbd5e1 30%, #94a3b8 55%, #64748b 80%)',
                    shadow: '0 20px 60px rgba(100,116,139,0.25)',
                }
        }
    }

    const orbStyle = getOrbStyle()
    const childColor = activeChild ? getChildColor(activeChild.id) : null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 m-auto max-w-[430px] h-dvh z-[998] flex flex-col bg-[#0f172a] overflow-hidden"
                >
                    {/* Top bar */}
                    <div className="pt-12 pb-4 flex flex-col items-center px-4">
                        <p className="text-[13px] font-semibold text-white/80 tracking-wide">
                            AIYA 음성 상담
                        </p>
                        {activeChild && childColor && (
                            <div
                                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full"
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                            >
                                <span className="text-[18px]">{activeChild.gender === 'MALE' ? '👦' : '👧'}</span>
                                <span
                                    className="text-[14px] font-bold"
                                    style={{ color: childColor.dot }}
                                >
                                    {activeChild.name}
                                </span>
                                <span className="text-[12px] text-white/60">의 상담</span>
                            </div>
                        )}
                    </div>

                    {/* Centered orb area */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
                        {/* Animated Orb */}
                        <div className="relative flex items-center justify-center">
                            {/* Outer pulse rings */}
                            {(voiceState === 'listening' || voiceState === 'speaking') && (
                                <>
                                    <motion.div
                                        className="absolute rounded-full"
                                        style={{
                                            width: 220, height: 220,
                                            background: voiceState === 'speaking'
                                                ? 'rgba(16,185,129,0.15)'
                                                : 'rgba(100,170,255,0.15)',
                                        }}
                                        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                    <motion.div
                                        className="absolute rounded-full"
                                        style={{
                                            width: 200, height: 200,
                                            background: voiceState === 'speaking'
                                                ? 'rgba(16,185,129,0.1)'
                                                : 'rgba(100,170,255,0.1)',
                                        }}
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                                    />
                                </>
                            )}

                            {/* Processing spinner */}
                            {voiceState === 'processing' && (
                                <motion.div
                                    className="absolute w-[200px] h-[200px] rounded-full border-4 border-transparent border-t-amber-400 border-r-amber-400/50"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                                />
                            )}

                            {/* Main orb */}
                            <motion.div
                                className="relative w-40 h-40 rounded-full overflow-hidden"
                                style={{ boxShadow: orbStyle.shadow }}
                                animate={
                                    voiceState === 'listening'
                                        ? { scale: [1, 1.08, 1] }
                                        : voiceState === 'speaking'
                                            ? { scale: [1, 1.05, 0.98, 1] }
                                            : { scale: 1 }
                                }
                                transition={{
                                    duration: voiceState === 'speaking' ? 1.2 : 1.8,
                                    repeat: (voiceState === 'listening' || voiceState === 'speaking') ? Infinity : 0,
                                    ease: 'easeInOut'
                                }}
                            >
                                <div className="absolute inset-0" style={{ background: orbStyle.background }} />
                                {/* Cloud / glass effect */}
                                <div
                                    className="absolute"
                                    style={{
                                        top: '22%', left: '15%',
                                        width: '70%', height: '35%',
                                        background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, rgba(220,235,255,0.3) 60%, transparent 100%)',
                                        borderRadius: '50%',
                                        filter: 'blur(6px)',
                                    }}
                                />
                                {/* Shimmer */}
                                {(voiceState === 'listening' || voiceState === 'speaking') && (
                                    <motion.div
                                        className="absolute inset-0"
                                        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)' }}
                                        animate={{ opacity: [0, 0.6, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                )}
                            </motion.div>
                        </div>

                        {/* Status text */}
                        <div className="w-full text-center min-h-[80px] flex flex-col items-center justify-center gap-2">
                            <p className="text-[15px] text-white/60">{statusText}</p>

                            {/* User transcript */}
                            {transcript && (
                                <motion.p
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[14px] text-blue-300 px-4"
                                >
                                    🎙 &quot;{transcript}&quot;
                                </motion.p>
                            )}

                            {/* AI response text */}
                            {aiText && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-h-[120px] overflow-y-auto px-4 mt-1"
                                >
                                    <p className="text-[13px] text-emerald-300 leading-relaxed">
                                        {aiText}
                                    </p>
                                </motion.div>
                            )}

                            {/* Listening bars */}
                            {voiceState === 'listening' && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    {[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1 rounded-full bg-blue-400"
                                            animate={{ height: ['6px', '22px', '6px'] }}
                                            transition={{ duration: 0.7, repeat: Infinity, delay }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="px-6 pb-10 pt-4 flex items-center justify-center gap-6">
                        {/* Mic button */}
                        <motion.button
                            onClick={handleMicButton}
                            disabled={voiceState === 'processing'}
                            whileTap={{ scale: 0.9 }}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${voiceState === 'listening'
                                ? 'bg-red-500 shadow-red-500/40'
                                : voiceState === 'speaking'
                                    ? 'bg-emerald-500 shadow-emerald-500/40'
                                    : voiceState === 'processing'
                                        ? 'bg-amber-500/50 shadow-amber-500/20 cursor-wait'
                                        : 'bg-white shadow-white/20'
                                }`}
                        >
                            {voiceState === 'listening' ? (
                                // Stop icon (square)
                                <div className="w-5 h-5 bg-white rounded-[3px]" />
                            ) : voiceState === 'processing' ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                    </svg>
                                </motion.div>
                            ) : (
                                // Mic icon
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={voiceState === 'speaking' ? 'white' : '#1e293b'} strokeWidth="2.2" strokeLinecap="round">
                                    <rect x="9" y="2" width="6" height="12" rx="3" />
                                    <path d="M5 10c0 4 3 7 7 7s7-3 7-7" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                </svg>
                            )}
                        </motion.button>

                        {/* Close button */}
                        <motion.button
                            onClick={handleClose}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
