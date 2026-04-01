import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Progress } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { AppLogo } from './__root'
import { progressStreamUrl } from '@/lib/api'
import { loadAudioState } from '@/lib/store'

interface ProgressEvent {
  type: 'progress' | 'complete' | 'error' | 'ping'
  percent?: number
  time_processed?: string
  download_url?: string
  message?: string
}

export function ProgressPage() {
  const { jobId } = useParams({ from: '/progress/$jobId' })
  const navigate = useNavigate()
  const audioState = loadAudioState()
  const esRef = useRef<EventSource | null>(null)

  const [percent, setPercent] = useState(0)
  const [timeProcessed, setTimeProcessed] = useState('00:00:00')
  const [status, setStatus] = useState<'connecting' | 'processing' | 'complete' | 'error'>('connecting')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const es = new EventSource(progressStreamUrl(jobId))
    esRef.current = es

    es.onopen = () => setStatus('processing')

    es.onmessage = (evt) => {
      try {
        const data: ProgressEvent = JSON.parse(evt.data)
        if (data.type === 'progress') {
          setStatus('processing')
          if (data.percent !== undefined) setPercent(data.percent)
          if (data.time_processed) setTimeProcessed(data.time_processed)
        } else if (data.type === 'complete') {
          setPercent(100)
          setStatus('complete')
          es.close()
          setTimeout(() => navigate({ to: '/preview/$jobId', params: { jobId } }), 800)
        } else if (data.type === 'error') {
          setStatus('error')
          setErrorMsg(data.message || 'Unknown error')
          es.close()
        }
      } catch {}
    }

    es.onerror = () => {
      if (status !== 'complete') {
        setStatus('error')
        setErrorMsg('Lost connection to the server.')
        es.close()
      }
    }

    return () => es.close()
  }, [jobId])

  const WaveBar = ({ delay }: { delay: string }) => (
    <div
      className="w-2 rounded-full bg-blue-400 animate-wave"
      style={{ animationDelay: delay, height: '100%' }}
    />
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-blue-400 flex flex-col">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none" />

      <nav className="relative z-10 px-6 py-5 max-w-6xl mx-auto w-full">
        <AppLogo light />
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
          {status === 'complete' ? (
            <>
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Done!</h2>
              <p className="text-sm text-gray-500">Redirecting to preview…</p>
            </>
          ) : status === 'error' ? (
            <>
              <XCircle className="h-14 w-14 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Conversion Failed</h2>
              <p className="text-sm text-red-500 mb-6 font-mono bg-red-50 rounded-lg p-3">{errorMsg}</p>
              <Button onClick={() => navigate({ to: '/studio' })}>← Back to Studio</Button>
            </>
          ) : (
            <>
              {/* Animated wave bars */}
              <div className="flex items-end justify-center gap-1.5 h-16 mb-6">
                {['0s', '0.1s', '0.2s', '0.15s', '0.05s', '0.2s', '0.1s', '0s'].map((delay, i) => (
                  <WaveBar key={i} delay={delay} />
                ))}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">Converting…</h2>
              {audioState?.title && (
                <p className="text-sm text-gray-500 mb-6 truncate">{audioState.title}</p>
              )}

              <div className="mb-3">
                <Progress value={percent} />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-blue-700 text-lg">{Math.round(percent)}%</span>
                <span className="text-gray-400 font-mono">{timeProcessed} processed</span>
              </div>

              {status === 'connecting' && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Connecting to server…
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
