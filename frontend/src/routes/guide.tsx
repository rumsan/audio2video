import { Link as RouterLink } from '@tanstack/react-router'
import { AppLogo } from './__root'
import { Music, Image, Film, Download, Upload, Link, CheckCircle, ArrowRight, Settings, Layers } from 'lucide-react'
import { useSeoMeta } from '@/lib/seo'

const steps = [
  {
    step: '01',
    icon: <Music className="h-6 w-6 text-blue-600" />,
    title: 'Choose Your Audio',
    desc: 'On the home page, either paste a public audio URL (https:// or file://) or upload a file directly from your computer. Supported formats include MP3, M4A, WAV, OGG, and FLAC.',
    tips: [
      'Give the video a descriptive title — it becomes the filename (e.g. "My Podcast Ep 3" → my-podcast-ep-3.mp4).',
      'The description field is embedded as video metadata (visible in media players).',
    ],
  },
  {
    step: '02',
    icon: <Layers className="h-6 w-6 text-blue-600" />,
    title: 'Studio — Add Image Slides',
    desc: 'The Studio page loads after you choose audio. Use the waveform to explore your audio and add timed image slides that appear at specific timestamps.',
    tips: [
      'Click "Add Image" to add a slide. Set the time it should appear using the HH:MM:SS marker field.',
      'You can paste an image URL or upload an image file for each slide.',
      'Each slide\'s title becomes a chapter marker embedded in the video — great for podcast episode breakdowns.',
      'Drag slides to re-order them. The first slide (lowest timestamp) is also the video cover/thumbnail.',
      'If you only need a single static background image, add one slide at 00:00:00.',
    ],
  },
  {
    step: '03',
    icon: <Settings className="h-6 w-6 text-blue-600" />,
    title: 'Configure Output Options',
    desc: 'Expand the Options panel in the Studio to fine-tune the output video.',
    tips: [
      'Format: choose MP4 (default, widest compatibility), MKV, or WebM.',
      'Resolution: defaults to 1920×1080 (Full HD). Images are padded/letterboxed to fit.',
      'CRF: controls quality (0 = lossless, 51 = worst). Default 23 is a good balance.',
      'Audio bitrate: default 192k. Increase to 320k for high-quality music.',
      'Enable "Normalize Audio" to even out volume levels across your audio track.',
    ],
  },
  {
    step: '04',
    icon: <Film className="h-6 w-6 text-blue-600" />,
    title: 'Start Conversion & Track Progress',
    desc: 'Click "Start Conversion" to submit the job. The progress page streams real-time updates via Server-Sent Events (SSE), showing percentage and time processed.',
    tips: [
      'Do not close the tab — the SSE stream keeps the progress live.',
      'If the connection drops, the job continues on the server. Check the status endpoint.',
      'Conversion typically takes 1–3× the audio duration depending on the server hardware.',
    ],
  },
  {
    step: '05',
    icon: <Download className="h-6 w-6 text-blue-600" />,
    title: 'Preview & Download',
    desc: 'After conversion the preview page loads automatically. You can play the video in the browser before downloading.',
    tips: [
      'Click "Download" to save the video to your computer.',
      'Click "Convert Another" to return to the home page and start a new job.',
    ],
  },
]

const faqs = [
  {
    q: 'What audio formats are supported?',
    a: 'Any format FFmpeg can decode: MP3, M4A, AAC, WAV, OGG, FLAC, OPUS, WMA, and more.',
  },
  {
    q: 'What image formats are supported?',
    a: 'JPEG, PNG, WebP, GIF (first frame), BMP, and TIFF.',
  },
  {
    q: 'How large can my audio file be?',
    a: 'The default upload limit is 200 MB. For larger files, host the audio on a CDN and use the URL option instead.',
  },
  {
    q: 'Can I use private/local files?',
    a: 'Yes — use the Upload File tab to upload from your computer, or use a file:// path if the server can access the file directly.',
  },
  {
    q: 'Where does the output video go?',
    a: 'Generated videos are stored in the server\'s output/ directory and available via the download endpoint. They are not automatically deleted.',
  },
  {
    q: 'Can I run this without Docker?',
    a: 'Yes — install Python 3.10+, run pip install -r requirements.txt, and start the server with uvicorn app.main:app --reload.',
  },
]

export function GuidePage() {
  useSeoMeta(
    'User Guide – How to Convert Audio to Video',
    'Step-by-step guide to converting audio to video with Audio2Video. Learn how to add timed slides, chapter markers, and export MP4 ready for YouTube and social media.',
  )
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <RouterLink to="/">
            <AppLogo />
          </RouterLink>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <RouterLink to="/" className="hover:text-blue-600 transition-colors">Home</RouterLink>
            <RouterLink to="/about" className="hover:text-blue-600 transition-colors">About</RouterLink>
            <RouterLink to="/guide" className="text-blue-600 font-semibold">Docs</RouterLink>
            <RouterLink to="/api-docs" className="hover:text-blue-600 transition-colors">API Docs</RouterLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-3">User Guide</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 [text-shadow:0_2px_12px_rgba(0,0,0,0.3)]">
            How to Use Audio2Video
          </h1>
          <p className="text-white/90 text-base max-w-xl mx-auto">
            From audio file to shareable video in five steps. No video editing software required.
          </p>
          <RouterLink
            to="/"
            className="mt-7 inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-md text-sm"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </RouterLink>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-14 space-y-14">

        {/* Step-by-step */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Step-by-Step Workflow</h2>
          <div className="space-y-8">
            {steps.map((s) => (
              <div key={s.step} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    {s.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-blue-400 tracking-widest">STEP {s.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{s.desc}</p>
                  <ul className="space-y-1.5">
                    {s.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Input types */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Supported Input Types</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Link className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Public URL</h3>
              <p className="text-sm text-gray-500">Any https:// or http:// URL accessible by the server. Audio and images are downloaded and cached by their SHA-256 hash.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                <Upload className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">File Upload</h3>
              <p className="text-sm text-gray-500">Upload audio or images directly from your browser. Files are stored in the server cache and a file:// URL is returned for use in conversion.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
                <Image className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Local File Path</h3>
              <p className="text-sm text-gray-500">Use file:///absolute/path/to/file format for files accessible directly on the server filesystem — useful in Docker/local setups.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to convert?</h2>
          <p className="text-white/80 mb-6">Upload your audio and create a shareable video in minutes.</p>
          <RouterLink
            to="/"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-7 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </RouterLink>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center">
        <p className="text-gray-500 text-sm">
          A service by{' '}
          <a href="https://rumsan.com" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
            Rumsan
          </a>
          {' '}— Impact Innovation Company
        </p>
      </footer>
    </div>
  )
}
