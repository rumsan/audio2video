import { useEffect, useRef, useState, useCallback } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause, Volume2, Plus } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { Button } from './ui/Button'

interface WaveformProps {
  url: string
  onDurationReady?: (seconds: number) => void
  onTimeUpdate?: (seconds: number) => void
  seekToSeconds?: number | null
  seekVersion?: number
  onAddImageAtTime?: (seconds: number) => void
}

export function Waveform({ url, onDurationReady, onTimeUpdate, seekToSeconds, seekVersion, onAddImageAtTime }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoverInfo, setHoverInfo] = useState<{ x: number; time: number; width: number } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    setLoading(true)
    setError(null)

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#93c5fd',
      progressColor: '#2563eb',
      cursorColor: '#1d4ed8',
      barWidth: 2,
      barGap: 2,
      barRadius: 3,
      height: 72,
      normalize: true,
    })

    wsRef.current = ws

    ws.on('ready', (dur) => {
      setDuration(dur)
      setLoading(false)
      onDurationReady?.(dur)
    })

    ws.on('audioprocess', (t) => {
      setCurrentTime(t)
      onTimeUpdate?.(t)
    })

    ws.on('seeking', (t) => {
      setCurrentTime(t)
      onTimeUpdate?.(t)
    })
    ws.on('play', () => setPlaying(true))
    ws.on('pause', () => setPlaying(false))
    ws.on('finish', () => setPlaying(false))

    ws.on('error', () => {
      setError('Could not load audio for preview. The URL may require authentication or CORS is blocked.')
      setLoading(false)
    })

    ws.load(url).catch(() => {
      setError('Failed to load audio.')
      setLoading(false)
    })

    return () => {
      ws.destroy()
      wsRef.current = null
    }
  }, [url])

  useEffect(() => {
    if (seekToSeconds != null && wsRef.current && duration > 0) {
      wsRef.current.seekTo(seekToSeconds / duration)
    }
  }, [seekToSeconds, seekVersion, duration])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || loading || !!error || !onAddImageAtTime) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = Math.max(0, Math.min(duration, (x / rect.width) * duration))
    setHoverInfo({ x, time, width: rect.width })
  }, [duration, loading, error, onAddImageAtTime])

  const handleMouseLeave = useCallback(() => setHoverInfo(null), [])

  const toggle = useCallback(() => wsRef.current?.playPause(), [])

  return (
    <div className="flex flex-col gap-3">
      {/* Waveform display */}
      <div
        className="relative bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-50/80 z-10">
            <div className="flex gap-1 items-end h-10">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-blue-400 rounded-full animate-wave"
                  style={{ animationDelay: `${i * 0.1}s`, height: `${20 + Math.random() * 40}px` }}
                />
              ))}
            </div>
          </div>
        )}
        {error ? (
          <div className="flex items-center justify-center h-[72px] text-sm text-amber-600 bg-amber-50 rounded-lg px-4 text-center">
            ⚠ {error}
          </div>
        ) : (
          <div ref={containerRef} />
        )}
        {hoverInfo && onAddImageAtTime && !loading && !error && (
          <>
            {/* Cursor line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-500/40 pointer-events-none z-10 rounded-full"
              style={{ left: hoverInfo.x }}
            />
            {/* Add image pill */}
            <div
              className="absolute z-20"
              style={{ left: Math.min(hoverInfo.x + 6, hoverInfo.width - 128), top: 6 }}
              onMouseMove={(e) => e.stopPropagation()}
            >
              <button
                className="bg-blue-600 text-white text-xs rounded-lg px-2.5 py-1 shadow-md flex items-center gap-1.5 whitespace-nowrap hover:bg-blue-700 active:bg-blue-800 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onAddImageAtTime(hoverInfo.time)
                }}
              >
                <Plus className="h-3 w-3" />
                {formatDuration(hoverInfo.time)}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="primary"
          size="sm"
          onClick={toggle}
          disabled={loading || !!error}
          className="w-10 h-10 p-0 rounded-full flex-shrink-0"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{formatDuration(currentTime)}</span>
            <span className="flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              {duration > 0 ? formatDuration(duration) : '--:--'}
            </span>
          </div>
          <div className="h-1 bg-blue-100 rounded-full">
            <div
              className="h-1 bg-blue-500 rounded-full transition-all duration-100"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
