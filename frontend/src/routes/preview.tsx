import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Download, RotateCcw, Loader2, Film, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLogo } from './__root'
import { fetchVideoObjectUrl, directDownloadUrl } from '@/lib/api'
import { loadAudioState, clearAudioState } from '@/lib/store'

export function PreviewPage() {
  const { jobId } = useParams({ from: '/preview/$jobId' })
  const navigate = useNavigate()
  const audioState = loadAudioState()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    fetchVideoObjectUrl(jobId)
      .then((url) => {
        objectUrl = url
        setVideoSrc(url)
        setLoading(false)
      })
      .catch((e) => {
        setError(String(e))
        setLoading(false)
      })

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [jobId])

  const handleConvertAnother = () => {
    clearAudioState()
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <AppLogo light />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleConvertAnother}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <RotateCcw className="h-4 w-4" />
            Convert Another
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Video player */}
        <div className="rounded-2xl overflow-hidden bg-black shadow-2xl aspect-video relative flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900">
              <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
              <p className="text-sm text-gray-400">Loading video…</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900 p-8">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}
          {videoSrc && !error && (
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              autoPlay
              className="w-full h-full"
              onError={() => setError('Failed to play video.')}
            />
          )}
        </div>

        {/* Info + actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Film className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-white text-lg font-bold leading-tight">
                {audioState?.title || 'Your Video'}
              </h1>
              {audioState?.description && (
                <p className="text-gray-400 text-sm mt-0.5 max-w-lg">{audioState.description}</p>
              )}
              <p className="text-gray-600 text-xs mt-1.5">Job ID: {jobId}</p>
            </div>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <a
              href={directDownloadUrl(jobId)}
              download
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors shadow-md hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            <Button variant="ghost" size="md" onClick={handleConvertAnother} className="text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700">
              New Conversion
            </Button>
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-xl bg-gray-900 border border-gray-800 px-4 py-3 text-xs text-gray-500">
          💡 The video has chapter markers embedded from your image time markers. Open in VLC or upload to YouTube to see them.
        </div>
      </main>
    </div>
  )
}
