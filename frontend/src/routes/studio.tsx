import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Clapperboard, ArrowLeft, Image, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLogo } from './__root'
import { Waveform } from '@/components/Waveform'
import { ImageMarkerCard, makeImageMarker, type ImageMarker } from '@/components/ImageMarkerCard'
import { OptionsPanel } from '@/components/OptionsPanel'
import { Badge } from '@/components/ui/Badge'
import { loadAudioState, DEFAULT_OPTIONS } from '@/lib/store'
import type { ConvertOptions } from '@/lib/api'
import { startConversion } from '@/lib/api'
import { secondsToMarker, formatDuration, isValidMarker } from '@/lib/utils'

export function StudioPage() {
  const navigate = useNavigate()
  const audioState = loadAudioState()

  useEffect(() => {
    if (!audioState) navigate({ to: '/' })
  }, [])

  const [duration, setDuration] = useState<number>(0)
  const [seekTo, setSeekTo] = useState<number | null>(null)
  const [seekVersion, setSeekVersion] = useState(0)
  const [images, setImages] = useState<ImageMarker[]>([])
  const [imageMode, setImageMode] = useState<'timed' | 'cover'>('cover')
  const [coverUrl, setCoverUrl] = useState('')
  const [options, setOptions] = useState<ConvertOptions>(DEFAULT_OPTIONS)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const currentTimeRef = useRef(0)
  const imagesSectionRef = useRef<HTMLDivElement>(null)
  const coverUrlRef = useRef<HTMLInputElement>(null)
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set())

  if (!audioState) return null

  const addImage = () => {
    const marker = currentTimeRef.current > 0
      ? secondsToMarker(Math.floor(currentTimeRef.current))
      : duration > 0 ? secondsToMarker(Math.floor(duration * (images.length / 5))) : '00:00:00'
    setImages((prev) => [...prev, makeImageMarker(marker)])
    setImageMode('timed')
  }

  const handleAddImageAtTime = (seconds: number) => {
    const marker = secondsToMarker(Math.floor(seconds))
    setImageMode('timed')
    setImages((prev) => {
      const exists = prev.some((img) => img.marker === marker)
      if (exists) {
        // Fill the first image with a blank/default marker instead of duplicating
        const emptyIdx = prev.findIndex((img) => !img.marker || img.marker === '00:00:00')
        if (emptyIdx >= 0) {
          return prev.map((img, i) => (i === emptyIdx ? { ...img, marker } : img))
        }
        return prev
      }
      return [...prev, makeImageMarker(marker)]
    })
    setTimeout(() => imagesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  const updateImage = (id: string, patch: Partial<ImageMarker>) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...patch } : img)))
    // Clear error highlight for this card when user edits it
    if (errorIds.has(id)) {
      setErrorIds((prev) => { const n = new Set(prev); n.delete(id); return n })
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleConvert = async () => {
    setSubmitError('')
    setErrorIds(new Set())

    // Validation
    if (imageMode === 'cover' && !coverUrl.trim()) {
      setSubmitError('Please enter a cover image URL or switch to timed images.')
      coverUrlRef.current?.focus()
      coverUrlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (imageMode === 'timed' && images.length === 0) {
      setSubmitError('Add at least one image or switch to cover image mode.')
      imagesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return
    }
    const badIds = images
      .filter((img) => !img.convertUrl.trim() || (img.marker !== '' && !isValidMarker(img.marker)))
      .map((img) => img.id)
    if (badIds.length > 0) {
      setErrorIds(new Set(badIds))
      setSubmitError('Some images are missing a URL or have an invalid time marker.')
      // scroll to first bad card
      setTimeout(() => {
        document.getElementById(`img-card-${badIds[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }

    setSubmitting(true)
    try {
      const job = await startConversion({
        title: audioState.title,
        description: audioState.description || undefined,
        audio_url: audioState.convertUrl,
        ...(imageMode === 'timed'
          ? {
              images: images.map((img) => ({
                url: img.convertUrl,
                marker: img.marker || '00:00:00',
                title: img.title || undefined,
              })),
            }
          : { image_url: coverUrl }),
        options,
      })
      navigate({ to: '/progress/$jobId', params: { jobId: job.job_id } })
    } catch (e) {
      setSubmitError(String(e))
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: '/' })}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <AppLogo />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{audioState.title}</p>
            {duration > 0 && (
              <p className="text-xs text-gray-400">Duration: {formatDuration(duration)}</p>
            )}
          </div>
          <Badge variant="blue">Step 2 of 3</Badge>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* Waveform */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
            Audio Preview
          </h2>
          <Waveform
            url={audioState.previewUrl}
            onDurationReady={useCallback((d: number) => { setDuration(d) }, [])}
            seekToSeconds={seekTo}
            seekVersion={seekVersion}
            onTimeUpdate={useCallback((t: number) => { currentTimeRef.current = t }, [])}
            onAddImageAtTime={handleAddImageAtTime}
          />
        </div>

        {/* Images section */}
        <div ref={imagesSectionRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-purple-500 rounded-full" />
              Images &amp; Chapters
            </h2>
            {/* Mode toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              {(['cover', 'timed'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setImageMode(m)}
                  className={`px-3 py-1.5 font-medium transition-colors ${imageMode === m ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {m === 'cover' ? '🖼 Cover Image' : '⏱ Timed Slides'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 flex flex-col gap-3">
            {imageMode === 'cover' ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    ref={coverUrlRef}
                    type="text"
                    className={`flex-1 text-sm rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                      imageMode === 'cover' && submitError && !coverUrl.trim()
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                    placeholder="https://example.com/cover.jpg"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    onBlur={(e) => setCoverUrl(e.target.value.trim())}
                    onPaste={(e) => { e.preventDefault(); setCoverUrl(e.clipboardData.getData('text').trim()) }}
                  />
                </div>
                <p className="text-xs text-gray-400">This image will be displayed for the full video duration.</p>

                {coverUrl && (
                  <div className="mt-1 w-28 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={coverUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                  </div>
                )}
              </div>
            ) : (
              <>
                {images.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center text-gray-400">
                    <Image className="h-10 w-10 mb-3 text-gray-200" />
                    <p className="text-sm font-medium mb-1">No images yet</p>
                    <p className="text-xs max-w-xs">Add images with time markers. Each image will be shown from its marker until the next one.</p>
                  </div>
                ) : (
                  images.map((img, i) => (
                    <ImageMarkerCard
                      key={img.id}
                      id={`img-card-${img.id}`}
                      image={img}
                      index={i}
                      audioDuration={duration}
                      onUpdate={(patch) => updateImage(img.id, patch)}
                      onRemove={() => removeImage(img.id)}
                      onSeek={(s) => { setSeekTo(s); setSeekVersion((v) => v + 1) }}
                      hasError={errorIds.has(img.id)}
                    />
                  ))
                )}
                <Button variant="secondary" size="sm" onClick={addImage} className="self-start mt-1">
                  <Plus className="h-4 w-4" /> Add Image
                </Button>
                {images.length > 0 && (
                  <p className="text-xs text-gray-400">
                    ✓ First image is the cover. Click <strong>seek</strong> to preview a marker in the waveform.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Options */}
        <OptionsPanel options={options} onChange={(patch) => setOptions((p) => ({ ...p, ...patch }))} />

        {/* Spacer for fixed footer */}
        <div className="h-24" />
      </main>

      {/* Fixed bottom convert bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">{audioState.title}</p>
            <p className="text-xs text-gray-400">
              {imageMode === 'timed' ? `${images.length} image${images.length !== 1 ? 's' : ''}` : 'Cover image'} · {options.format?.toUpperCase()} · {options.resolution}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {submitError && <p className="text-xs text-red-500 max-w-xs text-right">{submitError}</p>}
            <Button size="lg" loading={submitting} onClick={handleConvert} className="gap-2 flex-shrink-0">
              <Clapperboard className="h-4 w-4" />
              Convert
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
