import { useState, useRef } from 'react'
import { useNavigate, Link as RouterLink } from '@tanstack/react-router'
import { Upload, Link, Music, FileAudio, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { AppLogo } from './__root'
import { uploadFile } from '@/lib/api'
import { saveAudioState } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useSeoMeta } from '@/lib/seo'

export function HomePage() {
  useSeoMeta(
    'Convert Audio to Video for YouTube & Facebook',
    'The easiest way to turn your podcast, lecture, or music into a shareable video for YouTube, Facebook, TikTok, and more. Add timed image slides, chapter markers, and download MP4 in minutes.',
  )
  const navigate = useNavigate()
  const [tab, setTab] = useState<'url' | 'upload'>('url')
  const [audioUrl, setAudioUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) { setError('Title is required.'); return }

    if (tab === 'url') {
      if (!audioUrl.trim()) { setError('Please enter an audio URL or file:// path.'); return }
      saveAudioState({
        previewUrl: audioUrl,
        convertUrl: audioUrl,
        title: title.trim(),
        description: description.trim(),
      })
      navigate({ to: '/studio' })
      return
    }

    // File upload mode
    if (!file) { setError('Please choose an audio file.'); return }
    setUploading(true)
    try {
      const { file_url, preview_url } = await uploadFile(file)
      saveAudioState({
        previewUrl: preview_url,
        convertUrl: file_url,
        title: title.trim(),
        description: description.trim(),
        originalFilename: file.name,
      })
      navigate({ to: '/studio' })
    } catch (e) {
      setError(`Upload failed: ${e}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-blue-400 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Floating icons */}
      {[
        { icon: <Music className="h-5 w-5" />, cls: 'top-28 left-[10%] bg-amber-400/90 text-white shadow-lg rotate-[-8deg]' },
        { icon: <FileAudio className="h-5 w-5" />, cls: 'top-44 right-[12%] bg-blue-500/90 text-white shadow-lg rotate-[6deg]' },
        { icon: <Upload className="h-5 w-5" />, cls: 'bottom-48 left-[8%] bg-emerald-400/90 text-white shadow-lg rotate-[4deg]' },
        { icon: <Sparkles className="h-5 w-5" />, cls: 'bottom-36 right-[9%] bg-purple-400/90 text-white shadow-lg rotate-[-5deg]' },
      ].map((item, i) => (
        <div
          key={i}
          className={cn(
            'hidden lg:flex absolute w-12 h-12 rounded-2xl items-center justify-center animate-pulse-slow',
            item.cls,
          )}
        >
          {item.icon}
        </div>
      ))}

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <AppLogo />
        <div className="hidden sm:flex items-center gap-6 text-sm text-blue-900 font-medium">
          <RouterLink to="/" className="hover:text-blue-600 transition-colors">Home</RouterLink>
          <RouterLink to="/about" className="hover:text-blue-600 transition-colors">About</RouterLink>
          <RouterLink to="/guide" className="hover:text-blue-600 transition-colors">Docs</RouterLink>
          <RouterLink to="/api-docs" className="hover:text-blue-600 transition-colors">API Docs</RouterLink>
        </div>
      </nav>

      {/* Hero + form */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-10 max-w-6xl mx-auto">
        {/* Left: hero text */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-blue-900 leading-tight mb-4">
            The Easy Way to<br />Convert Audio to Video
          </h1>
          <p className="text-blue-800 text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
            Turn your podcast, lecture, or music into a video you can publish on
            <strong> YouTube, Facebook, TikTok</strong>, and more — with timed image slides,
            chapter markers, and embedded metadata.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
            {['YouTube Ready', 'MP4 / MKV / WebM', 'Chapter Markers', 'Timed Slides'].map((f) => (
              <span key={f} className="text-xs font-semibold bg-blue-900/10 text-blue-900 px-3 py-1 rounded-full backdrop-blur-sm border border-blue-900/20">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Right: form card */}
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Get Started</h2>
            <p className="text-sm text-gray-500 mb-6">Step 1 of 3 — Choose your audio</p>

            {/* Tab */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
              {(['url', 'upload'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 text-sm font-semibold py-2 rounded-lg transition-all duration-150',
                    tab === t ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  {t === 'url' ? <><Link className="h-3.5 w-3.5 inline mr-1.5" />Audio URL</> : <><Upload className="h-3.5 w-3.5 inline mr-1.5" />Upload File</>}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {tab === 'url' ? (
                <Input
                  label="Audio URL"
                  placeholder="https://… or file:///path/to/audio.mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  className={cn(
                    'border-2 border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition-all',
                    dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
                    file && 'border-emerald-400 bg-emerald-50',
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  {file ? (
                    <>
                      <FileAudio className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-700">{file.name}</p>
                      <p className="text-xs text-emerald-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Drop audio file here, or click to browse</p>
                      <p className="text-xs text-gray-400 mt-1">MP3, M4A, WAV, OGG, FLAC…</p>
                    </>
                  )}
                </div>
              )}

              <Input
                label="Title *"
                placeholder="e.g. My Podcast Episode 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={error === 'Title is required.' ? error : undefined}
              />

              <Textarea
                label="Description (optional)"
                placeholder="Short description embedded in the video metadata"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />

              {error && !error.includes('Title') && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button type="submit" size="lg" loading={uploading} className="w-full mt-1">
                Continue to Studio <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-blue-800/70 text-xs">
          A service by{' '}
          <a href="https://rumsan.com" target="_blank" rel="noreferrer" className="text-blue-900 font-semibold hover:underline">
            Rumsan
          </a>
          {' '}— Impact Innovation Company
        </p>
      </footer>
    </div>
  )
}
